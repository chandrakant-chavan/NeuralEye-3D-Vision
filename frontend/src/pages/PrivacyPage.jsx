import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Lock, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="inner-page-container">
      <Link to="/" className="neural-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Detector Dashboard</span>
      </Link>

      <div className="section-header-pill" style={{ marginTop: 12 }}>
        <ShieldCheck size={15} className="text-cyan" />
        <span>DATA PRIVACY & COMPLIANCE CONSTITUTION</span>
      </div>

      <h1 className="section-heading-primary">
        NeuralEye <span>Privacy Policy</span>
      </h1>
      <p className="section-subtext">
        Last updated: November 2026 • 100% Client-Side Evaluation & Zero Cloud Transmission Guarantee.
      </p>

      <div className="legal-glass-card">
        <div className="legal-section-block">
          <div className="lsb-title-row">
            <Lock size={18} className="text-cyan" />
            <h3>1. Overview & Privacy by Design</h3>
          </div>
          <p>
            NeuralEye is an enterprise-grade in-browser computer vision platform. We have architected the system so that the application does not collect, transmit, record, or store any personal biometric data or camera media. All tensor operations execute within your local device memory sandbox.
          </p>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <ShieldCheck size={18} className="text-green" />
            <h3>2. Data We Do Not Collect</h3>
          </div>
          <p>
            When utilizing NeuralEye in Client-Side Edge Mode (the default setting), every frame from your webcam or uploaded media is processed entirely within your browser utilizing WebAssembly WebWorkers and WebGL shaders:
          </p>
          <ul className="legal-list">
            <li><Check size={14} className="text-green" /> No video frames or images are ever transmitted to any external cloud server.</li>
            <li><Check size={14} className="text-green" /> No biometric measurements, facial embeddings, or identity data are extracted or saved.</li>
            <li><Check size={14} className="text-green" /> Zero tracking pixels, marketing cookies, or telemetry analytics scripts are embedded.</li>
          </ul>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <Lock size={18} className="text-blue" />
            <h3>3. Optional Backend Server Mode</h3>
          </div>
          <p>
            NeuralEye includes an optional FastAPI server mode for high-throughput GPU server acceleration. This mode is completely optional and disabled by default. If enabled on your own local machine (e.g. <code>localhost:8000</code>), data stays entirely on your physical machine. We do not operate any shared public backend storage.
          </p>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <ShieldCheck size={18} className="text-purple" />
            <h3>4. Local Browser Caching & Memory</h3>
          </div>
          <p>
            The YOLOv11 ONNX model file (~12 MB) is loaded and cached by your browser standard HTTP cache for instant offline execution. You can clear this cache at any time via your browser settings without affecting past telemetry.
          </p>
        </div>
      </div>
    </div>
  );
}
