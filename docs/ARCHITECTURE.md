# NeuralEye 3D Vision Architecture & Production Hardening Guide

## 1. Directory Structure

The project has been organized into clear, decoupled domain directories:

```
AI-ML/
├── backend/                  # FastAPI ASGI application & ML inference pipeline
│   ├── api/                  # API routers, SPA server, and route handlers
│   ├── core/                 # Config, logging, security middleware & rate-limiters
│   ├── ml/                   # YOLOv8/v11 inference engine, SAHI slicer & tracker
│   └── tests/                # Automated backend test suites
│
├── frontend/                 # React 18 + Vite SPA with WebAssembly SIMD
│   ├── public/               # Public web assets (models, audio, icons, Report.html, Report.pdf)
│   │   ├── models/           # ONNX quantized edge vision models
│   │   ├── samples/          # Verified sample images & benchmark inputs
│   │   ├── Report.html       # Official 18-page whitepaper browser edition
│   │   └── Report.pdf        # High-res downloadable PDF whitepaper
│   └── src/                  # React components, 3D scenes, WebWorkers, hooks
│
├── docs/                     # Master documentation & whitepapers
│   ├── Report.html           # Whitepaper source HTML
│   ├── Report.pdf            # High-resolution master publication PDF
│   └── ARCHITECTURE.md       # Architectural blueprints & security overview
│
├── assets/                   # Media repository & static artifacts
│   ├── branding/             # Vector SVGs, layered brand logos, master icons
│   └── source-media/         # Original high-res renders, demo videos, and raw crops
│
├── scripts/                  # DevOps, deployment & generation scripts
│   ├── build_pdf_report.py   # Headless Chrome/Edge automated PDF generator
│   ├── build-frontend.sh     # Production Vite build script
│   └── start-backend.sh      # Production Uvicorn ASGI runner
│
├── archive/                  # Subprojects & historical data (excluded from git)
│   ├── neuraleye-screenshot-to-code/
│   └── scratch/
│
├── render.yaml               # Render Cloud deployment blueprint (Strict Mode)
├── docker-compose.yml        # Multi-container orchestration
└── requirements.txt          # Frozen Python dependencies
```

---

## 2. Production Anti-Hacking & Security Hardening

### A. Path Traversal Elimination
In `backend/api/main.py`, the SPA static file server normalizes incoming paths with `os.path.abspath` and verifies containment within the `frontend/dist` directory before serving:
```python
safe_path = os.path.abspath(os.path.join(frontend_dist, full_path))
if not safe_path.startswith(frontend_dist):
    return FileResponse(os.path.join(frontend_dist, "index.html"))
```
Any traversal attempt (`/../../.env` or `/../../backend/inquiries.json`) is safely trapped and redirected to `index.html`.

### B. Same-Origin Frame Security (Clickjacking Defense)
- `X-Frame-Options` is set to `SAMEORIGIN`.
- This ensures the internal whitepaper preview iframe renders seamlessly inside `/reports`, while external malicious websites are strictly blocked from framing NeuralEye to prevent clickjacking attacks.

### C. Defense-in-Depth HTTP Security Headers
Every HTTP response carries enterprise security headers:
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- `X-XSS-Protection: 1; mode=block` (browser XSS filtering)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforces HTTPS)
- `X-Robots-Tag: noindex, nofollow, noarchive` (prevents crawler indexing of raw endpoints)
- `Permissions-Policy: camera=(self), microphone=()` (blocks unauthorized peripheral access)
- `Server: NeuralEye-SecOps/2.0` (masks underlying server software versions)

### D. Production Environment Credential Randomization
In `render.yaml`, `ENVIRONMENT: "production"` is strictly set. When deployed:
- Default development credentials (`NeuralEye@2026!`, `NE-SEC-OP-2026-X99`) are **completely deactivated**.
- Cryptographically strong 256-bit runtime tokens are generated using `secrets.token_urlsafe(24)` if environment secrets are not provided.
- Brute-force attacks are halted by `SlidingWindowRateLimiter` (30 requests/minute per IP) and constant-time `hmac.compare_digest` checks.

### E. Secret & Log Leak Prevention
- `app.log` has been removed from git tracking.
- `.gitignore` rigorously excludes all logs (`*.log`), contact records (`inquiries.json`), development archives (`archive/`, `scratch/`), and local secrets (`.env`).
