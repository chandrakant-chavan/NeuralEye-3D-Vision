# 👁️ NeuralEye 3D Vision Systems
### _Edge-Accelerated Computer Vision & Real-Time Multi-Object Detection Engine_

<p align="center">
  <a href="https://neuraleye.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Application-neuraleye.vercel.app-0052cc?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" />
  </a>
  <a href="https://chandrakantchavan-portfolio.vercel.app/">
    <img src="https://img.shields.io/badge/Developer%20Portfolio-Chandrakant%20Chavan-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Developer Portfolio" />
  </a>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi,pytorch,react,vite,js,html,css,git,docker" />
</p>

> 🌐 **Live Web Application:** [https://neuraleye.vercel.app/](https://neuraleye.vercel.app/)  
> 💼 **Developer Portfolio:** [https://chandrakantchavan-portfolio.vercel.app/](https://chandrakantchavan-portfolio.vercel.app/)  
> 📱 **PWA Ready:** Install directly on mobile home screen (iOS & Android) with zero cloud latency.

---

## 📌 Overview

**NeuralEye 3D Vision** is a cutting-edge real-time computer vision platform designed and developed by **[Chandrakant Chavan](https://chandrakantchavan-portfolio.vercel.app/)**. Built for ultra-low latency inference, privacy-first computing, and enterprise visual perception, it combines the accuracy of deep learning object detection models with client-side WebAssembly SIMD and SAHI sliced inference.

Unlike legacy computer vision architectures that depend on cloud roundtrips and introduce high network latency, NeuralEye executes client-side micro-inference with WebAssembly SIMD WebWorkers and zero-cloud transport lag.

---

## ✨ Key Architectural Capabilities

- ⚡ **Zero-Cloud Client Edge Vision** — Runs quantized INT8/FP16 models locally in the user's browser using WebAssembly SIMD multi-threading.
- 🎯 **Advanced Real-Time Detection** — High-accuracy YOLOv11 & v8 inference pipeline with sub-millisecond tensor processing.
- 📱 **Progressive Web App (PWA)** — Installs as a standalone native-feeling application on Android and iOS devices directly from the browser.
- 🖼️ **SAHI Sliced Micro-Inference** — Sliced Aided Hyper Inference detects miniature, distant, and overlapping objects in high-resolution frames.
- 🔒 **Enterprise-Grade Defense-in-Depth** — Rate limiting, cryptographic constant-time auth tokens, strict sanitized inputs, and path-traversal protection.
- 📄 **18-Page Master Engineering Report** — Native whitepaper and benchmark suite built directly into the web application (`/reports`).
- 🌓 **Adaptive Cross-Device Layout** — Ultra-responsive UI with system-aware Dark/Light modes designed for desktop, mobile (iOS Safari/Android Chrome), and tablets.

---

## 🛠 Tech Stack

### 🧠 Computer Vision & AI Pipeline
- **YOLOv11 & YOLOv8**: Core neural detection architectures.
- **ONNX Runtime Web (WASM SIMD)**: Edge-accelerated in-browser hardware-accelerated inference.
- **SAHI**: Sliced Aided Hyper Inference for fine-grained object segmentation.
- **OpenCV & Albumentations**: Frame preprocessing and geometric transformations.

### ⚙️ Backend (API & SecOps)
- **FastAPI**: Asynchronous Python API framework.
- **Uvicorn**: High-concurrency ASGI server.
- **Pydantic v2**: Type enforcement and runtime validation.

### 🎨 Frontend
- **React 19 + Vite 8**: High-performance single page application.
- **Lucide Icons**: Crisp interface iconography.
- **Tailwind CSS & Custom Design System**: Glassmorphism, cybernetic aesthetic, and responsive design tokens.
- **Service Worker & Manifest**: PWA caching and homescreen installation engine.

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
├── frontend/                 # React 19 + Vite WebAssembly application
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
├── vercel.json               # Vercel Edge CDN & SPA routing configuration
├── render.yaml               # Render Cloud deployment blueprint
├── docker-compose.yml        # Docker orchestration
└── requirements.txt          # Python dependencies
```

---

## 🚀 Quickstart & Local Development

### 1️⃣ Run Frontend Client (Edge WebAssembly AI)
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to access the live dashboard with client-side ONNX acceleration.

### 2️⃣ Run Optional Backend API (FastAPI)
```bash
# Activate virtual environment
venv\Scripts\activate   # Windows
source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 👨‍💻 Author & Lead Architect

- **Lead Architect:** **Chandrakant Chavan**
- **Portfolio:** [https://chandrakantchavan-portfolio.vercel.app/](https://chandrakantchavan-portfolio.vercel.app/)
- **Live Project:** [https://neuraleye.vercel.app/](https://neuraleye.vercel.app/)
- **GitHub:** [@chandrakant-chavan](https://github.com/chandrakant-chavan)
- **Platform:** NeuralEye 3D Vision Systems
- **License:** MIT
