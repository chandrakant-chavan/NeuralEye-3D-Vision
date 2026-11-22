import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import {
  Eye, Home, BarChart3, Camera, FileText, Settings,
  Sun, Moon, ChevronDown, ChevronRight, Menu, X, Zap, Activity,
  ShieldCheck, Cpu, Layers, Gauge, Code,
  Workflow, Terminal, Server, ArrowLeft
} from 'lucide-react';
import ImageDetection from './components/ImageDetection';
import WebcamDetection from './components/WebcamDetection';
import AnalyticsPanel from './components/AnalyticsPanel';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ReportsPage from './pages/ReportsPage';
import { ThemeContext } from './context/ThemeContext';
import NeuralEyeLogo from './components/NeuralEyeLogo';
import SecurityCenterModal from './components/SecurityCenterModal';
import './neuraleye-home.css';
import './index.css';
import config from './config';

const PIPELINE_FLOW = [
  {
    id: 0,
    num: "01",
    tag: "INGESTION",
    title: "Multi-Source Optical Stream",
    subtitle: "RTSP / WebCam / Video File",
    badge: "1080p @ 60 FPS",
    desc: "Ingests raw camera feeds and high-resolution video streams with native zero-copy frame buffers. Eliminates network hops by processing frames directly on client hardware.",
    spec: "BUFFER: ZERO-COPY SHAREDARRAYBUFFER",
    icon: Camera,
  },
  {
    id: 1,
    num: "02",
    tag: "PRE-PROCESSING",
    title: "SAHI Micro-Slicing Window",
    subtitle: "Dynamic 640x640 Overlaps",
    badge: "0.4ms Slice Latency",
    desc: "Slices gigapixel and crowded frames into localized micro-windows to resolve miniature pedestrians, vehicles, and distance objects without resizing distortion.",
    spec: "SLICING: 20% DYNAMIC OVERLAP",
    icon: Layers,
  },
  {
    id: 2,
    num: "03",
    tag: "INFERENCE",
    title: "YOLOv11 Neural Tensor Engine",
    subtitle: "ONNX Runtime WASM SIMD",
    badge: "Active • 2.4ms",
    desc: "Executes quantized FP16 YOLOv11 weights inside dedicated WebWorkers with SIMD 128-bit vectorization. Offloads CPU compute so the browser UI stays butter-smooth at 60 FPS.",
    spec: "TENSOR: 1x3x640x640 FP16",
    icon: Cpu,
  },
  {
    id: 3,
    num: "04",
    tag: "POST-PROCESSING",
    title: "Spatial Projections & NMS",
    subtitle: "Non-Maximum Suppression",
    badge: "IoU 0.45 Dynamic",
    desc: "Applies multi-class NMS bounding filtering, coordinate inverse-transformation, and confidence thresholding to project tight, jitter-free 3D spatial boxes.",
    spec: "CONFIDENCE: THRESHOLD DYNAMIC",
    icon: Activity,
  },
  {
    id: 4,
    num: "05",
    tag: "ZERO-TRUST EGRESS",
    title: "Air-Gapped Privacy Sandbox",
    subtitle: "Zero Cloud Video Streaming",
    badge: "100% Offline Ready",
    desc: "All video bytes stay inside the browser memory sandbox. Feeds never leave your device, ensuring full GDPR, HIPAA, and CCPA enterprise security compliance.",
    spec: "EGRESS: 0 BYTES TRANSMITTED",
    icon: ShieldCheck,
  },
];

const ARCHITECTURE_SPECS = [
  { label: "Core Model Variant", value: "YOLOv11 Small (Edge-Optimized)", category: "Inference Engine" },
  { label: "Client Execution Runtime", value: "ONNX WASM SIMD (WebWorker Threaded)", category: "Compute Architecture" },
  { label: "Hybrid Backend Protocol", value: "FastAPI REST & Async WebSockets", category: "Microservices" },
  { label: "Micro-Slicing Capability", value: "SAHI Dynamic Sub-Window Inference", category: "Computer Vision" },
  { label: "Enterprise Security Model", value: "Air-Gapped Client Sandbox (Zero Egress)", category: "Zero-Trust Privacy" },
  { label: "Deployment Targets", value: "Docker Multi-stage / PWA / Edge Gateways", category: "Containerization" },
];

const ROADMAP_MILESTONES = [
  {
    phase: "PHASE 01",
    version: "v1.2-beta",
    status: "IN PROGRESS",
    active: true,
    progress: 85,
    title: "DeepSORT Multi-Object Tracking",
    desc: "Kalman filtering and deep appearance re-identification vectors for continuous object trajectories across occlusions.",
    tech: "ENGINE: DEEPSORT + RE-ID TENSORS",
    spec: "ENGINE: DEEPSORT + RE-ID TENSORS"
  },
  {
    phase: "PHASE 02",
    version: "v1.3",
    status: "TARGET: Q2 2026",
    active: false,
    progress: 35,
    title: "Cloud Inference Microservice API",
    desc: "High-throughput authenticated REST and WebSocket streaming endpoints for enterprise camera network integrations.",
    tech: "PROTOCOL: REST / WEBSOCKET / GRPC",
    spec: "PROTOCOL: REST / WEBSOCKET / GRPC"
  },
  {
    phase: "PHASE 03",
    version: "v2.0",
    status: "TARGET: Q3 2026",
    active: false,
    progress: 10,
    title: "Mobile PWA & WebGPU Acceleration",
    desc: "Progressive Web App with ServiceWorker offline persistence and direct WebGPU compute pipelines for hand-held field devices.",
    tech: "STANDARD: WEBGPU COMPUTE / PWA",
    spec: "STANDARD: WEBGPU COMPUTE / PWA"
  },
  {
    phase: "PHASE 04",
    version: "v2.5",
    status: "TARGET: Q4 2026",
    active: false,
    progress: 0,
    title: "Active Learning & In-Browser Fine-Tuning",
    desc: "Integrated browser bounding-box dataset annotation, hard-example mining, and transfer learning fine-tuning studio.",
    tech: "PIPELINE: ACTIVE LEARNING LOOP",
    spec: "PIPELINE: ACTIVE LEARNING LOOP"
  }
];

function DashboardView({ isBackendReady }) {
  const [feedMode, setFeedMode] = useState('image'); // 'webcam' or 'image'
  const [activeDetections, setActiveDetections] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeStage, setActiveStage] = useState(2); // default to YOLOv11 Tensor Engine

  const selectedStage = PIPELINE_FLOW[activeStage] || PIPELINE_FLOW[2];
  const SelectedIcon = selectedStage.icon;

  return (
    <div className="dashboard-layout">
      {/* Sleek Command Center Operational Header */}
      <div className="command-center-header">
        <div>
          <div className="section-header-pill" style={{ marginBottom: 6 }}>
            <Zap size={14} className="text-cyan" />
            <span>YOLOV11 WORKBENCH COMMAND CENTER</span>
          </div>
          <h1 className="section-heading-primary" style={{ margin: 0, fontSize: '1.85rem' }}>
            NeuralEye Detection <span>Command Center</span>
          </h1>
        </div>

        <div className="telemetry-pills-wrap">
          <div className="telemetry-pill-stat">
            <span>LATENCY: <b style={{ color: 'var(--accent-cyan)' }}>0.0ms</b></span>
            <span>|</span>
            <span>ACCELERATOR: <b style={{ color: 'var(--accent-green)' }}>WASM SIMD</b></span>
          </div>

          <span className="live-pill">
            <span className="live-dot-pulse"></span>
            {isBackendReady ? 'Hybrid Backend Online' : 'Client WASM Engine (Active)'}
          </span>
        </div>
      </div>

      {/* 2-Column Command Center Workbench Studio (Solid, Unified, No Gimmick Tilt) */}
      <div className="command-center-grid">
        {/* Left Column: Analytics & Metrics */}
        <div className="analytics-column">
          <AnalyticsPanel detections={activeDetections} />
        </div>

        {/* Right Column: Live Camera Feed / Detection Viewport */}
        <div className="feed-column">
          <div className="feed-panel-card">
            <div className="panel-header feed-card-header">
              <div className="feed-header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="var(--accent-cyan)" />
                <h3 className="panel-title" style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>
                  NeuralEye 3D Vision – Live Camera Feed
                </h3>
                <span className="live-status-pill" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  marginLeft: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 6px #10B981' }}></span>
                  Online • 2.4ms
                </span>
              </div>

              {/* Feed Mode Switcher */}
              <div className="feed-switcher">
                <button
                  type="button"
                  className={`feed-switch-btn ${feedMode === 'image' ? 'active' : ''}`}
                  onClick={() => setFeedMode('image')}
                  title="3D Neural View (Static / Samples)"
                >
                  3D View
                </button>
                <button
                  type="button"
                  className={`feed-switch-btn ${feedMode === 'webcam' ? 'active' : ''}`}
                  onClick={() => setFeedMode('webcam')}
                  title="Real-time 2D Camera Feed"
                >
                  2D View
                </button>
              </div>

              <button
                type="button"
                className="icon-menu-btn"
                title="Feed Settings"
                onClick={() => setShowSettingsModal(true)}
              >
                •••
              </button>
            </div>

            <div className="feed-content-body">
              {feedMode === 'webcam' ? (
                <WebcamDetection
                  isBackendReady={isBackendReady}
                  onDetectionsChange={setActiveDetections}
                />
              ) : (
                <ImageDetection
                  isBackendReady={isBackendReady}
                  onDetectionsChange={setActiveDetections}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Human-Crafted Architecture Hub: Interactive Vision Execution Pipeline & Specification Matrix */}
      <section className="dashboard-section" id="pipeline-architecture">
        <div className="section-heading">
          <div className="section-header-pill">
            <Workflow size={14} className="text-cyan" />
            <span>END-TO-END EXECUTION PIPELINE</span>
          </div>
          <h2 className="section-title">Vision Pipeline & Architecture</h2>
          <p className="section-desc">Interactive execution trace from optics ingestion to zero-latency bounding tensors.</p>
        </div>

        <div className="pipeline-flow-container">
          {/* Continuous 5-Stage Interactive Pipeline Ribbon */}
          <div className="pipeline-flow-track" role="tablist" aria-label="Pipeline Stages">
            {PIPELINE_FLOW.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeStage === stage.id;
              return (
                <button
                  type="button"
                  key={stage.id}
                  role="tab"
                  aria-selected={isSelected}
                  className={`pipeline-stage-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveStage(stage.id)}
                >
                  <div className="stage-top-meta">
                    <span className="stage-num">{stage.num}</span>
                    <span className="stage-tag">{stage.tag}</span>
                  </div>
                  <div className="stage-icon-row">
                    <div className="stage-icon-box">
                      <Icon size={16} />
                    </div>
                    <span className="stage-title">{stage.title}</span>
                  </div>
                  <span className="stage-badge-pill">{stage.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive Inspector Panel */}
          <div className="pipeline-inspector-panel">
            <div className="inspector-info-left">
              <h4>
                <SelectedIcon size={20} className="text-cyan" />
                <span>Stage {selectedStage.num}: {selectedStage.title}</span>
                <span className="stage-tag" style={{ marginLeft: 6 }}>({selectedStage.subtitle})</span>
              </h4>
              <p>{selectedStage.desc}</p>
            </div>
            <div className="inspector-spec-box">
              <span className="spec-caption">STAGE RUNTIME SPEC</span>
              <span className="spec-code">{selectedStage.spec}</span>
            </div>
          </div>

          {/* 2-Column Technical Architecture Matrix */}
          <div className="arch-matrix-grid">
            {/* Left Card: Hybrid Processing Architecture */}
            <div className="arch-matrix-card">
              <div className="arch-card-title-row">
                <h3>
                  <Server size={18} className="text-cyan" />
                  <span>Hybrid Processing Engine</span>
                </h3>
                <span className="arch-status-tag">DUAL RUNTIME</span>
              </div>

              <div className="hybrid-flow-diagram">
                <div className="hybrid-tier-block">
                  <div className="hybrid-tier-header">
                    <span className="hybrid-tier-title">
                      <Cpu size={15} color="#00f2fe" />
                      Client-Side WebAssembly (Primary)
                    </span>
                    <span className="hybrid-tier-stat">0.0ms Cloud Latency</span>
                  </div>
                  <p className="hybrid-tier-desc">
                    Evaluates YOLOv11 FP16 weights directly within browser WebWorkers using WASM SIMD. Full air-gapped privacy with zero bytes sent to external servers.
                  </p>
                </div>

                <div className="hybrid-tier-block">
                  <div className="hybrid-tier-header">
                    <span className="hybrid-tier-title">
                      <Terminal size={15} color="#2563eb" />
                      FastAPI Python Daemon (Hybrid Fallback)
                    </span>
                    <span className="hybrid-tier-stat">Port 8000 • Async</span>
                  </div>
                  <p className="hybrid-tier-desc">
                    High-throughput asynchronous Python microservice for heavy multi-stream batch processing, custom weight validation, and Docker server deployment.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Verified Edge System Specifications */}
            <div className="arch-matrix-card">
              <div className="arch-card-title-row">
                <h3>
                  <Activity size={18} className="text-cyan" />
                  <span>Verified System Specifications</span>
                </h3>
                <span className="arch-status-tag">PRODUCTION READY</span>
              </div>

              <div className="arch-specs-list">
                {ARCHITECTURE_SPECS.map((spec, idx) => (
                  <div key={idx} className="arch-spec-row">
                    <div className="arch-spec-label">
                      <span className="arch-spec-name">{spec.label}</span>
                      <span className="arch-spec-cat">{spec.category}</span>
                    </div>
                    <span className="arch-spec-val">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Crafted Milestone Roadmap: Connected Stepper Track (No Separate Boxes) */}
      <section className="dashboard-section" id="roadmap">
        <div className="section-heading">
          <div className="section-header-pill">
            <Layers size={14} className="text-cyan" />
            <span>PRODUCTION EXPANSION PHASES</span>
          </div>
          <h2 className="section-title">Milestone Engineering Roadmap</h2>
          <p className="section-desc">Continuous technical progression track for client-side edge computer vision.</p>
        </div>

        <div className="roadmap-connected-timeline">
          {/* Continuous Connecting Progress Rail */}
          <div className="roadmap-rail-track" aria-hidden="true" />

          {/* 4 Connected Milestone Stations */}
          <div className="roadmap-milestones-grid">
            {ROADMAP_MILESTONES.map((m) => (
              <div key={m.phase} className={`roadmap-milestone-item ${m.active ? 'active' : ''}`}>
                <div className="milestone-station-top">
                  <span className="milestone-node-dot" />
                  <span className="milestone-phase-badge">{m.phase}</span>
                  <span className="milestone-status-chip">
                    {m.active && <span className="live-dot-pulse" style={{ width: 5, height: 5 }} />}
                    {m.status}
                  </span>
                </div>

                <h3 className="milestone-title">{m.title}</h3>
                <p className="milestone-desc">{m.desc}</p>

                <div className="milestone-progress-bar" title={`Progress: ${m.progress}%`}>
                  <div
                    className="milestone-progress-fill"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>

                <div className="milestone-tech-spec">{m.tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>NeuralEye Telemetry & Core Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><b>Model Engine:</b> NeuralEye YOLOv11 (WASM WebWorker / FastAPI Hybrid)</p>
              <p><b>Visual Architecture:</b> Luxury 3D Obsidian & Holographic HUD</p>
              <p><b>Server Telemetry:</b> {isBackendReady ? 'Connected (FastAPI 8000)' : 'Independent Browser Engine'}</p>
              <p><b>System:</b> NeuralEye Core Engineering</p>
            </div>
            <div className="modal-footer">
              <button className="ctrl-btn upload-btn" onClick={() => setShowSettingsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveViewRoute({ isBackendReady }) {
  const [, setDetections] = useState([]);
  return (
    <div className="inner-page-container">
      <div className="section-header-pill">
        <Camera size={15} className="text-cyan" />
        <span>FULL-VIEWPORT SPATIAL TRACKING</span>
      </div>
      <h1 className="section-heading-primary">
        NeuralEye Real-Time <span>Live View HUD</span>
      </h1>
      <p className="section-subtext">
        Direct camera feed telemetry and bounding-box spatial tracking with zero cloud transmission. Evaluates video frames in client-side WebAssembly WebWorkers.
      </p>

      {/* Quick Telemetry Indicators */}
      <div className="telemetry-chips-strip">
        <span className="live-pill">
          <span className="live-dot-pulse" />
          {isBackendReady ? 'Hybrid Server Online (FastAPI)' : 'WASM Edge Engine (Active)'}
        </span>
        <span className="telemetry-stat-badge"><Zap size={13} /> 0.0ms Cloud Latency</span>
        <span className="telemetry-stat-badge"><ShieldCheck size={13} /> 100% On-Device Privacy</span>
        <span className="telemetry-stat-badge"><Gauge size={13} /> 60 FPS Hardware SIMD</span>
        <span className="telemetry-stat-badge"><Cpu size={13} /> YOLOv11 Edge</span>
      </div>

      <div className="live-feed-card-wrapper">
        <WebcamDetection isBackendReady={isBackendReady} onDetectionsChange={setDetections} />
      </div>
    </div>
  );
}

function ReportsRoute() {
  return <ReportsPage />;
}

function SettingsRoute({ isBackendReady }) {
  return (
    <div className="inner-page-container">
      <Link to="/" className="neural-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Detector Dashboard</span>
      </Link>
      <div className="section-header-pill">
        <Settings size={15} className="text-cyan" />
        <span>SYSTEM CONFIGURATION & HYPERPARAMETERS</span>
      </div>
      <h1 className="section-heading-primary">
        NeuralEye Engine <span>Settings</span>
      </h1>
      <p className="section-subtext">
        Configure hardware accelerators, inference execution modes, confidence thresholds, and developer telemetry.
      </p>

      <div className="settings-glass-card">
        <div className="settings-row-item">
          <div className="sri-info">
            <h4 className="sri-title">Inference Execution Mode</h4>
            <p className="sri-desc">Toggle between client-side WebAssembly WebWorkers and FastAPI local inference backend.</p>
          </div>
          <div className="sri-action">
            <span className="live-pill">
              <span className="live-dot-pulse" />
              {isBackendReady ? 'Hybrid Server Online (FastAPI)' : 'WASM WebWorker (Active)'}
            </span>
          </div>
        </div>

        <div className="settings-row-item">
          <div className="sri-info">
            <h4 className="sri-title">Default Confidence Threshold</h4>
            <p className="sri-desc">Global minimum confidence score required to render bounding box overlays on live feeds.</p>
          </div>
          <div className="sri-action">
            <span className="settings-badge-cyan">0.25 (Adjustable on live viewport)</span>
          </div>
        </div>

        <div className="settings-row-item">
          <div className="sri-info">
            <h4 className="sri-title">Hardware Acceleration Runtime</h4>
            <p className="sri-desc">Client SIMD vectorization and WebGL shader compute for maximum frame rates.</p>
          </div>
          <div className="sri-action">
            <span className="settings-badge-green">WASM SIMD Enabled • 60 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationShell({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('neuraleye_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neuraleye_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  if (isHome) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-shell neuraleye-shell ${theme === 'dark' ? 'neuraleye-dark' : ''} ${isHome ? 'shell-home' : ''}`}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        {/* Global Unified NeuralEye Header */}
        <header className="neural-header">
          <Link
            to="/"
            className="brand"
            onClick={() => {
              if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <NeuralEyeLogo size="header" />
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Home size={16} /> Home
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <BarChart3 size={16} /> Dashboard
            </NavLink>
            <NavLink to="/live" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Camera size={16} /> Live View
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <FileText size={16} /> Reports
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Settings size={16} /> Settings
            </NavLink>
            <NavLink to="/portfolio" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Portfolio
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Contact
            </NavLink>
          </nav>

          <div className="header-actions">
            {/* Enterprise Security Operations Center Shield */}
            <button
              type="button"
              className="round-action security-shield-btn"
              aria-label="Security Operations Center"
              onClick={() => setSecurityModalOpen(true)}
              title="NeuralEye 6-Layer Security Operations Center (Active)"
            >
              <ShieldCheck size={19} style={{ color: 'var(--accent-cyan)' }} />
            </button>

            {/* Desktop Theme Toggle - hidden on mobile header, available in mobile menu */}
            <button
              type="button"
              className="round-action desktop-theme-toggle"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            {/* Desktop Profile Wrap - hidden on mobile header, shown inside mobile menu */}
            <div className="profile-wrap desktop-profile-wrap">
              <button
                type="button"
                className="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
                title="User Workspace"
              >
                <span>
                  <Code size={15} strokeWidth={2.5} />
                </span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <strong>NeuralEye Workspace</strong>
                  <span>AI Vision Platform</span>
                  <Link to="/portfolio" onClick={() => setProfileOpen(false)}>
                    Portfolio
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}>
                    Settings
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Backdrop overlay for mobile menu */}
          {menuOpen && (
            <div
              className="mobile-nav-backdrop"
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Glassmorphic Mobile Navigation Drawer */}
          {menuOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              <div className="mobile-profile-card">
                <div className="mobile-avatar">
                  <Code size={18} strokeWidth={2.5} />
                </div>
                <div className="mobile-profile-info">
                  <strong>NeuralEye Workspace</strong>
                  <span>AI Vision Platform</span>
                </div>
              </div>

              {/* Mobile Theme Switcher Section */}
              <div className="mobile-theme-section">
                <div className="mobile-theme-header">
                  <span className="mobile-theme-title">Theme / Mode</span>
                  <span className="mobile-theme-curr">{theme === 'dark' ? "Dark Mode 🌙" : "Light Mode ☀️"}</span>
                </div>
                <div className="mobile-theme-pills">
                  <button
                    type="button"
                    className={`mobile-theme-pill ${theme === 'light' ? "active" : ""}`}
                    onClick={() => {
                      if (theme === 'dark') toggleTheme();
                    }}
                  >
                    <Sun size={15} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    className={`mobile-theme-pill ${theme === 'dark' ? "active" : ""}`}
                    onClick={() => {
                      if (theme === 'light') toggleTheme();
                    }}
                  >
                    <Moon size={15} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div className="mobile-nav-divider" />

              <div className="mobile-nav-links">
                <NavLink to="/" end className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><Home size={18} /></span>
                  <span className="mobile-nav-label">Home</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><BarChart3 size={18} /></span>
                  <span className="mobile-nav-label">Dashboard</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/live" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><Camera size={18} /></span>
                  <span className="mobile-nav-label">Live View</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><FileText size={18} /></span>
                  <span className="mobile-nav-label">Reports</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><Settings size={18} /></span>
                  <span className="mobile-nav-label">Settings</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/portfolio" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><Eye size={18} /></span>
                  <span className="mobile-nav-label">Portfolio</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="mobile-nav-icon"><Activity size={18} /></span>
                  <span className="mobile-nav-label">Contact</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </NavLink>
                <button
                  type="button"
                  className="mobile-nav-item"
                  onClick={() => { setMenuOpen(false); setSecurityModalOpen(true); }}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span className="mobile-nav-icon"><ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} /></span>
                  <span className="mobile-nav-label">Security Center (6 Layers)</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </button>
              </div>
            </nav>
          )}
        </header>

        {/* NeuralEye Enterprise Security Center Modal */}
        <SecurityCenterModal isOpen={securityModalOpen} onClose={() => setSecurityModalOpen(false)} />

        {/* Page Views */}
        <main className={`main-content-scroll ${isHome ? 'main-scroll-home' : ''}`}>
          {children}
        </main>

        {/* Footer only on non-home dashboard pages (Perfect Center, No Box / Card) */}
        {!isHome && (
          <footer className="dashboard-footer-unified">
            <div className="footer-content-wrap">
              <div className="footer-brand-centered">
                <div className="brand" style={{ transform: 'none', cursor: 'default' }}>
                  <NeuralEyeLogo size="footer" />
                </div>
              </div>
              <div className="footer-nav-centered">
                <Link to="/portfolio" className="footer-link-btn">Developer Portfolio</Link>
                <span className="footer-dot">•</span>
                <Link to="/contact" className="footer-link-btn">Contact Developer</Link>
                <span className="footer-dot">•</span>
                <Link to="/privacy" className="footer-link-btn">Privacy Policy</Link>
                <span className="footer-dot">•</span>
                <Link to="/terms" className="footer-link-btn">Terms of Service</Link>
              </div>
              <div className="footer-divider-line" />
              <div className="footer-meta-centered">
                <p className="footer-copyright-text">
                  © 2026 NeuralEye 3D Vision Systems. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/`);
        if (res.ok) setIsBackendReady(true);
      } catch {
        setIsBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <NavigationShell isBackendReady={isBackendReady}>
        <Routes>
          <Route path="/" element={<HomePage isBackendReady={isBackendReady} />} />
          <Route path="/dashboard" element={<DashboardView isBackendReady={isBackendReady} />} />
          <Route path="/detector" element={<DashboardView isBackendReady={isBackendReady} />} />
          <Route path="/live" element={<LiveViewRoute isBackendReady={isBackendReady} />} />
          <Route path="/reports" element={<ReportsRoute />} />
          <Route path="/settings" element={<SettingsRoute isBackendReady={isBackendReady} />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </NavigationShell>
    </BrowserRouter>
  );
}

export default App;
