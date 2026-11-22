# 👁️ NeuralEye 3D Vision Systems
### _Edge-Accelerated Computer Vision & Real-Time Multi-Object Detection Engine_

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi,pytorch,react,vite,js,html,css,git,docker" />
</p>

---

## 📌 Overview

**NeuralEye 3D Vision** is a cutting-edge real-time computer vision platform designed by **Chandrakant Chavan**. Built for ultra-low latency inference, privacy-first computing, and enterprise visual perception, it combines the accuracy of deep learning object detection models with client-side WebAssembly SIMD and SAHI sliced inference.

Unlike legacy computer vision architectures that depend on cloud roundtrips and introduce high network latency, NeuralEye executes client-side micro-inference with WebAssembly SIMD WebWorkers and zero-cloud transport lag.

---

## ✨ Key Architectural Capabilities

- ⚡ **Zero-Cloud Client Edge Vision** — Runs quantized INT8/FP16 models locally in the user's browser using WebAssembly SIMD multi-threading.
- 🎯 **Advanced Real-Time Detection** — High-accuracy YOLOv11 & v8 inference pipeline with sub-millisecond tensor processing.
- 🖼️ **SAHI Sliced Micro-Inference** — Sliced Aided Hyper Inference detects miniature, distant, and overlapping objects in high-resolution frames.
- 🔒 **Enterprise-Grade Defense-in-Depth** — Rate limiting, cryptographic constant-time auth tokens, strict sanitized inputs, and path-traversal protection.
- 📄 **18-Page Master Engineering Report** — Native whitepaper and benchmark suite built directly into the web application (`/reports`).
- 📱 **Adaptive Cross-Device Layout** — Responsive UI designed for desktop, mobile (iOS Safari/Android Chrome), and foldable/tablet viewports.

---

## 🛠 Tech Stack

### 🧠 Computer Vision & AI Pipeline
- **YOLOv11 & YOLOv8**: Core neural detection architectures.
- **ONNX Runtime Web (WASM SIMD)**: Edge-accelerated in-browser inference.
- **SAHI**: Sliced Aided Hyper Inference for fine-grained object segmentation.
- **OpenCV & Albumentations**: Frame preprocessing and geometric transformations.

### ⚙️ Backend (API & SecOps)
- **FastAPI**: Asynchronous Python API framework.
- **Uvicorn**: High-concurrency ASGI server.
- **Pydantic v2**: Type enforcement and runtime validation.

### 🎨 Frontend
- **React 18 + Vite**: High-performance single page application.
- **Lucide Icons**: Crisp interface iconography.
- **Tailwind CSS & Custom Design System**: Glassmorphism and responsive UI tokens.

---

## 📂 Project Structure

```bash
AI-ML/
├── backend/                  # FastAPI ASGI application & inference pipeline
│   ├── api/                  # Hardened routes & SPA static server
│   ├── core/                 # Config, logging, security & rate limiters
│   ├── ml/                   # YOLO model runners, SAHI slicer & tracker
│   └── tests/                # Automated API test suites
│
├── frontend/                 # React 18 + Vite WebAssembly application
│   ├── public/               # Static models, audio, icons & master reports
│   └── src/                  # React components, 3D scenes & workers
│
├── docs/                     # Master engineering whitepapers & architecture guide
│   ├── Report.html           # Whitepaper browser edition
│   ├── Report.pdf            # Publication PDF
│   └── ARCHITECTURE.md       # Architecture & deployment security guide
│
├── assets/                   # Media repository & vector branding
│   ├── branding/             # Vector brand logos and iconography
│   └── source-media/         # High-res renders and demo video
│
├── scripts/                  # Automated report generators & build utilities
│   └── build_pdf_report.py   # Headless Chrome PDF builder
│
├── render.yaml               # Render Cloud deployment blueprint
├── docker-compose.yml        # Docker orchestration
└── requirements.txt          # Python dependencies
```

---

## 🚀 Quickstart & Local Development

### 1️⃣ Run Backend API
```bash
# Activate virtual environment
venv\Scripts\activate   # Windows
source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2️⃣ Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to access the live dashboard.

---

## 👨‍💻 Author & Lead Architect

- **Lead Architect**: Chandrakant Chavan
- **Platform**: NeuralEye 3D Vision Systems
- **License**: MIT
