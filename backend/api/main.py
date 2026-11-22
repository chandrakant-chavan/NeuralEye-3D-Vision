import os
import threading
import time
import ssl
import urllib.request
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router as api_router
from backend.core.config import settings
from backend.core.logging import logger
from backend.ml.inference import detector_status, get_detector

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Global sanitized exception handler to prevent internal tracebacks or directory leaks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. The incident has been securely logged."}
    )

# Layer 1: Global Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=()"
    response.headers["Server"] = "NeuralEye-SecOps/2.0"
    return response

cors_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

MODEL_LOADING_STARTED = False
MODEL_LOADING_ERROR = None

def _keep_alive_worker():
    """
    Self-contained in-code Keep-Alive daemon.
    Automatically keeps Render free-tier instances awake by detecting the public
    service URL and sending non-blocked HTTP GET pings to the edge router every 6 minutes.
    """
    service_name = os.environ.get("RENDER_SERVICE_NAME", "neuraleye-3d-vision")
    render_url = (
        os.environ.get("RENDER_EXTERNAL_URL")
        or os.environ.get("KEEP_ALIVE_URL")
        or os.environ.get("APP_URL")
        or (f"https://{service_name}.onrender.com" if os.environ.get("RENDER") else "")
    ).rstrip("/")

    if not render_url:
        print("[KeepAlive] Notice: Running in local environment (no Render URL configured). Self-ping inactive.")
        return

    ping_url = f"{render_url}/healthz" if not render_url.endswith("/healthz") else render_url
    print(f"[KeepAlive] Background worker active! Target: {ping_url} (Interval: 6 min)")

    # Initial grace period: wait 35 seconds for server to finish binding
    time.sleep(35)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (NeuralEye-KeepAlive/2.0)",
        "Accept": "application/json, text/plain, */*",
        "Connection": "close",
    }

    # Resilient SSL context for outbound pings
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    consecutive_failures = 0

    while True:
        try:
            req = urllib.request.Request(ping_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, context=ssl_context, timeout=20) as response:
                status_code = response.getcode()
                print(f"[KeepAlive] ✅ Self-ping successful -> HTTP {status_code}")
                consecutive_failures = 0

            # Ping every 360 seconds (6 minutes) - well within Render's 15-minute idle limit
            time.sleep(360)

        except Exception as exc:
            consecutive_failures += 1
            print(f"[KeepAlive] ⚠️ Ping attempt #{consecutive_failures} failed: {exc}. Retrying in 25s...")
            # Fast retry backoff to prevent sleeping during transient glitches
            time.sleep(25)

def _load_model_async():
    global MODEL_LOADING_ERROR
    try:
        d = get_detector()
        if d is None:
            MODEL_LOADING_ERROR = "Model failed to initialize"
    except Exception as e:
        MODEL_LOADING_ERROR = str(e)

@app.on_event("startup")
async def startup_event():
    global MODEL_LOADING_STARTED
    if not MODEL_LOADING_STARTED:
        MODEL_LOADING_STARTED = True
        model_thread = threading.Thread(target=_load_model_async, name="model-loader", daemon=True)
        model_thread.start()

    # Launch Keep-Alive daemon
    keep_alive_thread = threading.Thread(target=_keep_alive_worker, name="keep-alive", daemon=True)
    keep_alive_thread.start()

@app.get("/healthz")
def liveness_check():
    """Lightweight 200 OK liveness check for Render deploy health monitoring and keep-alive."""
    return {"status": "ok"}

@app.get("/health")
def health_check():
    status = detector_status()
    model_loaded = status["loaded"]
    if model_loaded:
        overall = "healthy"
        code = 200
    elif MODEL_LOADING_ERROR:
        overall = "error"
        code = 503
    elif MODEL_LOADING_STARTED:
        overall = "loading"
        code = 200
    else:
        overall = "starting"
        code = 200
    return JSONResponse(
        status_code=code,
        content={
            "status": overall,
            "model_loaded": model_loaded,
            "model_path": status.get("model_path", settings.MODEL_PATH),
            "error": MODEL_LOADING_ERROR,
        }
    )

# Static file serving for React frontend (when dist is built)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    models_dir = os.path.join(frontend_dist, "models")
    if os.path.exists(models_dir):
        app.mount("/models", StaticFiles(directory=models_dir), name="models")
    samples_dir = os.path.join(frontend_dist, "samples")
    if os.path.exists(samples_dir):
        app.mount("/samples", StaticFiles(directory=samples_dir), name="samples")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Prevent Directory / Path Traversal attacks
        safe_path = os.path.abspath(os.path.join(frontend_dist, full_path))
        if not safe_path.startswith(frontend_dist):
            return FileResponse(os.path.join(frontend_dist, "index.html"))
        if os.path.isfile(safe_path):
            return FileResponse(safe_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": f"Welcome to {settings.PROJECT_NAME}"}
