import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Cpu, Play, Send, ShieldCheck, ExternalLink } from 'lucide-react';

const TECH_STACK = [
  'YOLOv11', 'ONNX Runtime Web', 'WebAssembly (WASM)', 'FastAPI', 'PyTorch',
  'React 19', 'Docker', 'OpenCV', 'WebGL Shaders', 'DeepSORT'
];

const PROJECTS = [
  {
    tag: 'COMPUTER VISION // REAL-TIME',
    title: 'NeuralEye 3D Vision Platform',
    desc: 'In-browser real-time multi-class object detection and spatial tracking running YOLOv11 via client-side WebAssembly WebWorkers with zero cloud latency.',
    specs: 'React • Vite • ONNX Runtime • YOLOv11 • WebGL',
    link: '/dashboard',
    badge: 'Flagship System',
    color: 'cyan'
  },
  {
    tag: 'GIGAPIXEL RECON // HIGH-RES',
    title: 'SAHI Micro-Sliced Inferencer',
    desc: 'Integrated Slicing Aided Hyper Inference architecture resolving minute, distant, and heavily occluded objects in ultra-high-resolution 4K panoramic security feeds.',
    specs: 'SAHI Architecture • Python • Multi-Scale Slicing',
    link: '/reports',
    badge: 'Micro-Scale',
    color: 'blue'
  },
  {
    tag: 'SPATIAL KINEMATICS // TRACKING',
    title: 'DeepSORT Multi-Object Tracker',
    desc: 'Persistent trajectory and identity tracking pipeline using Kalman filtering and deep appearance descriptors for multi-camera urban surveillance.',
    specs: 'DeepSORT • Kalman Filters • Velocity Vectors',
    link: '/reports',
    badge: 'In Progress',
    color: 'purple'
  },
  {
    tag: 'AIR-GAPPED SECURITY // PRIVACY',
    title: 'Zero-Cloud Edge AI Architecture',
    desc: 'Fully sandboxed local inference engine ensuring zero video frames ever escape device memory. Compliant with strict enterprise privacy and GDPR standards.',
    specs: 'WASM Sandboxing • Local Shaders • Air-Gapped',
    link: '/privacy',
    badge: '100% Private',
    color: 'green'
  }
];

export default function PortfolioPage() {
  const navigate = useNavigate();

  return (
    <div className="inner-page-container">
      <Link to="/" className="neural-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Detector Dashboard</span>
      </Link>

      <div className="section-header-pill" style={{ marginTop: 12 }}>
        <Cpu size={15} className="text-cyan" />
        <span>LEAD AI ENGINEER & SYSTEM ARCHITECT</span>
      </div>

      <h1 className="section-heading-primary">
        Chandrakant Chavan // <span>Engineering Portfolio</span>
      </h1>
      <p className="section-subtext">
        Specializing in high-throughput edge computer vision, real-time deep learning inference optimization, and distributed AI application architectures.
      </p>

      {/* Direct Live Portfolio Link Banner */}
      <div style={{ marginTop: '16px', marginBottom: '22px' }}>
        <a
          href="https://chandrakantchavan-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <ExternalLink size={16} />
          <span>Open Live Portfolio (chandrakantchavan-portfolio.vercel.app)</span>
        </a>
      </div>

      {/* Tech Stack Chips */}
      <div className="portfolio-tech-strip">
        <span className="chips-label">CORE TECHNOLOGIES:</span>
        {TECH_STACK.map((tech) => (
          <span key={tech} className="tech-badge-chip">{tech}</span>
        ))}
      </div>

      {/* Featured Projects Grid */}
      <div className="portfolio-projects-grid">
        {PROJECTS.map((project) => (
          <div key={project.title} className={`portfolio-project-card border-${project.color}`}>
            <div className="ppc-header">
              <span className="ppc-tag">{project.tag}</span>
              <span className={`ppc-badge badge-${project.color}`}>{project.badge}</span>
            </div>
            <h3 className="ppc-title">{project.title}</h3>
            <p className="ppc-desc">{project.desc}</p>
            <div className="ppc-footer">
              <span className="ppc-specs"><code>{project.specs}</code></span>
              <Link to={project.link} className="ppc-action-btn">
                <span>Explore</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Engineering Focus Glass Card */}
      <div className="portfolio-focus-card">
        <div className="pfc-left">
          <div className="pfc-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="pfc-title">Engineering Focus & System Capabilities</h3>
            <p className="pfc-desc">
              Building low-latency client-side AI systems that maximize browser hardware capabilities via WebAssembly SIMD and WebGL. Open for high-impact computer vision contracts and architecture design.
            </p>
          </div>
        </div>
        <div className="pfc-actions">
          <button className="primary-button" onClick={() => navigate('/contact')}>
            <Send size={16} />
            Contact Developer
          </button>
          <button className="secondary-button" onClick={() => navigate('/dashboard')}>
            <Play size={16} fill="currentColor" />
            Live Workbench
          </button>
        </div>
      </div>
    </div>
  );
}
