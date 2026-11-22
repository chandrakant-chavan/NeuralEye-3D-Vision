import { Link } from 'react-router-dom';
import { ArrowLeft, Check, FileText, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="inner-page-container">
      <Link to="/" className="neural-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Detector Dashboard</span>
      </Link>

      <div className="section-header-pill" style={{ marginTop: 12 }}>
        <FileText size={15} className="text-cyan" />
        <span>TERMS OF USE & OPERATIONAL GOVERNANCE</span>
      </div>

      <h1 className="section-heading-primary">
        NeuralEye <span>Terms of Service</span>
      </h1>
      <p className="section-subtext">
        Last updated: November 2026 • Open-Source Research, Education & Enterprise Development License.
      </p>

      <div className="legal-glass-card">
        <div className="legal-section-block">
          <div className="lsb-title-row">
            <Check size={18} className="text-cyan" />
            <h3>1. Acceptance of Terms</h3>
          </div>
          <p>
            By accessing or operating the NeuralEye vision platform, you agree to comply with and be bound by these Terms of Service. If you do not agree with any provision, please discontinue utilization of the platform.
          </p>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <FileText size={18} className="text-blue" />
            <h3>2. Platform Scope & Purpose</h3>
          </div>
          <p>
            NeuralEye provides client-side computer vision inference leveraging YOLOv11 and ONNX Runtime Web. It is architected for real-time edge detection, academic research, industrial prototyping, and situational awareness applications.
          </p>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <ShieldCheck size={18} className="text-green" />
            <h3>3. Permitted & Prohibited Uses</h3>
          </div>
          <p>
            Users are strictly required to operate NeuralEye in compliance with applicable local and international privacy laws. You may not use NeuralEye to perform unauthorized covert surveillance or violate privacy rights.
          </p>
        </div>

        <div className="legal-section-block">
          <div className="lsb-title-row">
            <FileText size={18} className="text-purple" />
            <h3>4. Open-Source Licensing & Intellectual Property</h3>
          </div>
          <p>
            The NeuralEye application framework is provided under standard open-source licensing. YOLOv11 model weights are governed by their respective upstream Ultralytics / ONNX distribution licenses.
          </p>
        </div>
      </div>
    </div>
  );
}
