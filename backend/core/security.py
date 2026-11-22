import os
import time
import hmac
import hashlib
import base64
import json
from collections import defaultdict
from typing import Optional, Tuple
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.core.config import settings

import os
import time
import hmac
import hashlib
import base64
import json
import secrets
from collections import defaultdict
from typing import Optional, Tuple
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.core.config import settings
from backend.core.logging import logger

# -------------------------------------------------------------
# 1. SECURITY CONFIGURATION & SECRETS
# -------------------------------------------------------------
# Cryptographically secure secret keys:
# If not explicitly provided in environment, generate ephemeral 256-bit entropy keys at runtime
# This prevents attackers from forging tokens or guessing default passwords from git repositories.
_ENV_JWT_SECRET = os.getenv("JWT_SECRET")
if not _ENV_JWT_SECRET:
    _ENV_JWT_SECRET = secrets.token_urlsafe(32)
    logger.warning("SECURITY ADVISORY: JWT_SECRET not found in environment. Generated ephemeral 256-bit runtime key.")
JWT_SECRET = _ENV_JWT_SECRET
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 3600 * 12  # 12 Hours

DEFAULT_OPERATOR_USER = os.getenv("OPERATOR_USERNAME", "admin")
_ENV_OPERATOR_PASS = os.getenv("OPERATOR_PASSWORD")
if not _ENV_OPERATOR_PASS:
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("RENDER"):
        _ENV_OPERATOR_PASS = secrets.token_urlsafe(24)
        logger.warning("SECURITY ALERT: OPERATOR_PASSWORD generated randomly for production environment.")
    else:
        _ENV_OPERATOR_PASS = "NeuralEye@2026!"
DEFAULT_OPERATOR_PASS = _ENV_OPERATOR_PASS

_ENV_HARDWARE_KEY = os.getenv("HARDWARE_API_KEY")
if not _ENV_HARDWARE_KEY:
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("RENDER"):
        _ENV_HARDWARE_KEY = secrets.token_urlsafe(24)
    else:
        _ENV_HARDWARE_KEY = "NE-SEC-OP-2026-X99"
DEFAULT_HARDWARE_API_KEY = _ENV_HARDWARE_KEY

# Layer 2 Limits
MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_REQUESTS_PER_MINUTE = 30           # 30 req / min per IP
MAX_IMAGE_PIXELS = 16_000_000          # 4000 x 4000 px max decompression ceiling

# -------------------------------------------------------------
# 2. IN-MEMORY SLIDING WINDOW RATE LIMITER
# -------------------------------------------------------------
class SlidingWindowRateLimiter:
    def __init__(self, limit: int = MAX_REQUESTS_PER_MINUTE, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def check_rate_limit(self, client_ip: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - self.window_seconds

        # Prune older timestamps
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > window_start]

        if len(self.requests[client_ip]) >= self.limit:
            oldest_request = self.requests[client_ip][0]
            retry_after = int(self.window_seconds - (now - oldest_request)) + 1
            return False, max(retry_after, 1)

        self.requests[client_ip].append(now)
        return True, 0

rate_limiter = SlidingWindowRateLimiter()

# -------------------------------------------------------------
# 3. CRYPTOGRAPHIC JWT IMPLEMENTATION (HS256, RFC 7519)
# -------------------------------------------------------------
def _b64_url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64_url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def create_jwt_token(payload: dict, expires_in: int = JWT_EXPIRATION_SECONDS) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    body = payload.copy()
    body["exp"] = int(time.time()) + expires_in
    body["iat"] = int(time.time())

    encoded_header = _b64_url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_body = _b64_url_encode(json.dumps(body, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{encoded_header}.{encoded_body}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = _b64_url_encode(signature)

    return f"{encoded_header}.{encoded_body}.{encoded_signature}"

def verify_jwt_token(token: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        encoded_header, encoded_body, encoded_sig = parts
        signing_input = f"{encoded_header}.{encoded_body}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()

        if not hmac.compare_digest(expected_sig, _b64_url_decode(encoded_sig)):
            return None

        body = json.loads(_b64_url_decode(encoded_body).decode('utf-8'))
        if body.get("exp", 0) < time.time():
            return None  # Expired

        return body
    except Exception:
        return None

# -------------------------------------------------------------
# 4. ROLE-BASED AUTH & API KEY VALIDATOR
# -------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)

async def verify_operator_auth(
    request: Request,
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme)
) -> dict:
    """
    Guarantees that caller is an authorized NeuralEye operator
    either via a signed Operator JWT or a dedicated Hardware API Key.
    """
    # 1. Check Hardware API Key header
    api_key_header = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
    if api_key_header and hmac.compare_digest(api_key_header, DEFAULT_HARDWARE_API_KEY):
        return {"role": "hardware_camera", "sub": "edge_device", "authorized": True}

    # 2. Check Bearer JWT token
    token = None
    if auth_credentials:
        token = auth_credentials.credentials
    elif "Authorization" in request.headers:
        auth_header = request.headers["Authorization"]
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if token:
        payload = verify_jwt_token(token)
        if payload:
            return {"role": payload.get("role", "operator"), "sub": payload.get("sub", "admin"), "authorized": True}

    # In local testing or edge dashboard mode, provide a safe fallback ONLY for localhost/127.0.0.1
    # DO NOT allow arbitrary remote callers with "X-NeuralEye-Internal-Demo: true" to bypass authentication!
    is_local_client = request.client and request.client.host in ("127.0.0.1", "localhost", "testclient")
    if is_local_client and (os.getenv("ENVIRONMENT") != "production" and not os.getenv("RENDER")):
        return {"role": "operator", "sub": "local_operator", "authorized": True}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Access requires a valid Operator JWT or X-API-Key header.",
        headers={"WWW-Authenticate": "Bearer"}
    )

# -------------------------------------------------------------
# 5. IMAGE SANITIZATION & MAGIC BYTE VERIFICATION
# -------------------------------------------------------------
ALLOWED_MAGIC_SIGNATURES = [
    (b'\xff\xd8\xff', "image/jpeg"),                    # JPEG / JPG
    (b'\x89PNG\r\n\x1a\n', "image/png"),                # PNG
    (b'RIFF', "image/webp"),                             # WebP (checked further)
]

def sanitize_and_verify_image_bytes(raw_bytes: bytes) -> bytes:
    """
    Layer 3: Image Sanitization (Malicious Code Removal)
    - Verifies genuine image magic bytes (blocks polyglots and executable scripts).
    - Checks payload size ceiling (5MB).
    - Re-encodes with OpenCV to strip EXIF, GPS tracking, and buffer-overflow payloads.
    - Prevents Decompression Bombs.
    """
    import cv2
    import numpy as np

    # 1. Size check
    if len(raw_bytes) > MAX_IMAGE_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Security Alert: Payload exceeds 5MB limit ({len(raw_bytes)} bytes)."
        )

    if len(raw_bytes) < 16:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Security Alert: Image payload corrupt or too small.")

    # 2. Magic byte verification
    is_valid_format = False
    for sig, mime in ALLOWED_MAGIC_SIGNATURES:
        if raw_bytes.startswith(sig):
            if sig == b'RIFF':
                # Check WEBP signature at offset 8
                if len(raw_bytes) >= 12 and raw_bytes[8:12] == b'WEBP':
                    is_valid_format = True
                    break
            else:
                is_valid_format = True
                break

    if not is_valid_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Alert: Invalid magic bytes detected. Only verified clean JPEG, PNG, or WebP permitted."
        )

    # 3. Decode & Decompression Bomb Verification
    np_arr = np.frombuffer(raw_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Security Alert: Image decode failed. Corrupted buffer.")

    h, w = image.shape[:2]
    if (h * w) > MAX_IMAGE_PIXELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security Alert: Image dimension {w}x{h} ({w*h} px) exceeds decompression threshold (potential decompression bomb)."
        )

    # 4. Re-encode to clean JPEG buffer (strips all EXIF metadata, GPS coordinates, steganographic payloads)
    success, clean_buffer = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 95])
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Security Alert: Sanitization encoding failed.")

    return clean_buffer.tobytes()
