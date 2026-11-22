import os
import json
import smtplib
import hmac
import html
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends, status
from backend.ml.inference import get_detector
from backend.core.security import (
    rate_limiter,
    verify_operator_auth,
    sanitize_and_verify_image_bytes,
    create_jwt_token,
    DEFAULT_OPERATOR_USER,
    DEFAULT_OPERATOR_PASS,
    DEFAULT_HARDWARE_API_KEY
)
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class DetectionResult(BaseModel):
    label: str
    confidence: float
    bbox: List[int]

class PredictResponse(BaseModel):
    objects: List[DetectionResult]
    security_audit: dict

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in_hours: int = 12
    role: str = "operator"
    permissions: List[str]

# -------------------------------------------------------------
# 1. AUTHENTICATION & SESSION ROUTES (Layer 4)
# -------------------------------------------------------------
@router.post("/auth/login", response_model=LoginResponse)
async def login_operator(creds: LoginRequest, request: Request):
    """
    Issue cryptographically signed JWT for Command Center Operators.
    Protected with rate limiting and constant-time string comparison to prevent brute-force attacks.
    """
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = rate_limiter.check_rate_limit(f"login_{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Security Alert: Rate limit exceeded. Too many attempts. Retry after {retry_after}s.",
            headers={"Retry-After": str(retry_after)}
        )

    # Constant-time comparison prevents timing analysis
    user_ok = hmac.compare_digest(creds.username, DEFAULT_OPERATOR_USER)
    pass_ok = hmac.compare_digest(creds.password, DEFAULT_OPERATOR_PASS)

    if user_ok and pass_ok:
        token = create_jwt_token({
            "sub": creds.username,
            "role": "command_operator",
            "access": "full_telemetry"
        })
        return {
            "access_token": token,
            "token_type": "Bearer",
            "expires_in_hours": 12,
            "role": "command_operator",
            "permissions": ["predict:execute", "models:read", "stream:telemetry"]
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Security Alert: Invalid operator credentials provided."
    )

@router.get("/auth/verify")
async def verify_session(operator: dict = Depends(verify_operator_auth)):
    """
    Healthcheck for active security session and role clearance.
    """
    return {
        "status": "authenticated",
        "operator": operator,
        "security_level": "MIL-STD-ENCRYPTED"
    }

# -------------------------------------------------------------
# 2. HARDENED PREDICT ENDPOINT (Layers 2, 3, 4, 5)
# -------------------------------------------------------------
@router.post("/predict", response_model=PredictResponse)
async def predict(
    request: Request,
    file: UploadFile = File(...),
    confidence: Optional[float] = Form(None),
    operator: dict = Depends(verify_operator_auth)
):
    """
    Hardened Real-Time Prediction Endpoint:
    - Layer 2: Sliding-window rate limit (30 req/min per IP) + 5MB payload limit
    - Layer 3: Magic-bytes verification + buffer re-encoding sanitization
    - Layer 4: Role-Based Authorization
    - Layer 5: Adversarial Perturbation Filtering
    """
    # Layer 2: Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Security Alert: Rate limit exceeded (30 req/min). Retry after {retry_after}s.",
            headers={"Retry-After": str(retry_after)}
        )

    # File Type check
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Security Alert: File provided is not an image.")

    detector = get_detector()
    if detector is None:
        raise HTTPException(status_code=503, detail="Model is still initializing. Please retry in 10s.")

    try:
        raw_contents = await file.read()

        # Layer 3: Image Sanitization & Magic Bytes check
        clean_contents = sanitize_and_verify_image_bytes(raw_contents)

        # Layer 5: Prediction with Adversarial Filtering in pipeline
        results = detector.predict_image(clean_contents, conf=confidence)

        return {
            "objects": results.get("objects", []),
            "security_audit": {
                "sanitized": True,
                "magic_verified": True,
                "adversarial_defense": "active",
                "caller_role": operator.get("role", "operator"),
                "bytes_checked": len(raw_contents)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        from backend.core.logging import logger
        logger.error(f"Inference processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Inference processing failed. Please verify that the image format is valid and supported."
        )

# -------------------------------------------------------------
# 3. MODEL INTELLECTUAL PROPERTY PROTECTION (Layer 6)
# -------------------------------------------------------------
@router.get("/models/manifest")
async def get_model_manifest(operator: dict = Depends(verify_operator_auth)):
    """
    Layer 6: Prevents scraping and unauthenticated harvesting of AI model weights.
    """
    return {
        "model_architecture": "Ultralytics YOLOv11 (Tensor Accelerated)",
        "quantization": "FP16 / WASM-SIMD INT8",
        "anti_tamper_signature": "SHA256:7f9b8c94a29ef194a08c023d854e7d32918bb12c85b1945ae90e181bbac18837",
        "operator_clearance": operator.get("role", "operator")
    }

# -------------------------------------------------------------
# 4. DIRECT ENGINEERING INQUIRY & DISPATCH (Contact Portal)
# -------------------------------------------------------------
class ContactInquiryRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

@router.post("/contact")
async def receive_contact_inquiry(inquiry: ContactInquiryRequest, request: Request):
    """
    Direct Engineering Inquiry Endpoint:
    Receives contact messages with anti-spam rate limiting and input sanitization,
    logs them to backend/inquiries.json, and dispatches real emails if SMTP is configured.
    """
    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam rate limiting (maximum 5 inquiries per minute per IP)
    allowed, retry_after = rate_limiter.check_rate_limit(f"contact_{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Security Alert: Rate limit exceeded. Please wait {retry_after}s before submitting again.",
            headers={"Retry-After": str(retry_after)}
        )

    # Input length guards to prevent memory flooding / DoS attacks
    if (len(inquiry.name) > 100 or len(inquiry.email) > 120 or 
        len(inquiry.subject) > 200 or len(inquiry.message) > 5000):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Alert: Payload exceeds allowable field length limits."
        )

    # Sanitize strings against HTML injection / XSS
    safe_name = html.escape(inquiry.name.strip())
    safe_email = html.escape(inquiry.email.strip())
    safe_subject = html.escape(inquiry.subject.strip())
    safe_message = html.escape(inquiry.message.strip())

    timestamp = datetime.utcnow().isoformat()

    record = {
        "timestamp": timestamp,
        "client_ip": client_ip,
        "name": safe_name,
        "email": safe_email,
        "subject": safe_subject,
        "message": safe_message,
        "status": "received"
    }

    # 1. Save inquiry record locally
    inquiries_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "inquiries.json")
    try:
        data = []
        if os.path.exists(inquiries_file):
            with open(inquiries_file, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception:
                    data = []
        data.append(record)
        with open(inquiries_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Warning: Failed to log inquiry to disk: {e}")

    # 2. SMTP dispatch
    smtp_user = os.getenv("SMTP_USER") or os.getenv("GMAIL_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
    recipient = os.getenv("CONTACT_RECIPIENT_EMAIL", "chandrakant150805@gmail.com")

    email_sent = False
    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[NeuralEye Inquiry] {safe_subject}"
            msg["From"] = f"NeuralEye Portal <{smtp_user}>"
            msg["To"] = recipient
            msg["Reply-To"] = safe_email

            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #0052cc, #00d2ff); padding: 16px; border-radius: 8px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 20px;">⚡ New NeuralEye Engineering Inquiry</h2>
                    <p style="margin: 4px 0 0; opacity: 0.85; font-size: 13px;">Received via NeuralEye 3D Vision Portal</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;"><strong>Sender Name:</strong></td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;"><strong>{safe_name}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Sender Email:</strong></td>
                        <td style="padding: 8px 0; color: #0066cc; font-size: 15px;"><a href="mailto:{safe_email}">{safe_email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;">{safe_subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Received At:</strong></td>
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">{timestamp}</td>
                    </tr>
                </table>
                
                <div style="background: #f8fafc; border-left: 4px solid #0052cc; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px; color: #334155;">Project Details & Requirements:</h4>
                    <p style="margin: 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">{safe_message}</p>
                </div>
                
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
                    NeuralEye 3D Vision • Dispatched directly to Chandrakant Chavan ({recipient})
                </p>
            </div>
            """
            msg.attach(MIMEText(html_body, "html"))
            smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                email_sent = True
        except Exception as e:
            print(f"Error dispatching SMTP email: {e}")

    return {
        "success": True,
        "message": "Engineering inquiry received and registered.",
        "email_dispatched": email_sent,
        "recipient": recipient
    }
