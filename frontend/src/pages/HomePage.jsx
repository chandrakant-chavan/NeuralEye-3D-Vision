import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, Camera, ChevronDown, ChevronRight,
  Cpu, FileText, Home, Menu, Moon, Play, Rocket, Settings,
  ShieldCheck, Sun, Video, X, Zap, Box,
  Sparkles, Send, Terminal, Activity, Layers, Database,
  Gauge, Clock, Check, HelpCircle, Search, RefreshCw, Code, Download
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import NeuralEyeLogo from "../components/NeuralEyeLogo";
import SecurityCenterModal from "../components/SecurityCenterModal";
import {
  Icon3DVision,
  IconWebAssembly,
  IconEdgeAI,
  IconAnalytics,
} from "../components/FeatureGlassIcons";

const PORTFOLIO_URL = "https://chandrakantchavan-portfolio.vercel.app/";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { label: "Live View", icon: Camera, path: "/live" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Portfolio", path: PORTFOLIO_URL, isExternal: true },
  { label: "Contact", path: "/contact" },
];

const features = [
  {
    title: "3D Vision",
    description: "Real-time 3D object detection & tracking",
    icon: Icon3DVision,
    tone: "violet",
    path: "/live",
  },
  {
    title: "WebAssembly",
    description: "Ultra-fast inference in browser",
    icon: IconWebAssembly,
    tone: "blue",
    path: "/dashboard",
  },
  {
    title: "Edge AI",
    description: "Zero cloud latency for better privacy",
    icon: IconEdgeAI,
    tone: "green",
    path: "/settings",
  },
  {
    title: "Powerful Analytics",
    description: "Get insights with smart reports",
    icon: IconAnalytics,
    tone: "purple",
    path: "/reports",
  },
];

// Curated Vision Prompting Presets
const PROMPT_PRESETS = [
  {
    id: "traffic",
    tag: "Traffic Telemetry",
    title: "Urban Traffic & Velocity Tracking",
    prompt: "Detect moving vehicles, calculate velocity vectors, and track lane departures in 4K stream",
    latency: "1.4ms",
    model: "YOLOv11-Nano (Edge WASM)",
    tensor: "1x3x640x640 FP16",
    fps: "60 FPS",
    detections: [
      { id: "OBJ-101", label: "Luxury Sedan", conf: "98.7%", velocity: "48.2 km/h", status: "In Lane", color: "blue" },
      { id: "OBJ-102", label: "Electric SUV", conf: "97.4%", velocity: "52.8 km/h", status: "Passing", color: "cyan" },
      { id: "OBJ-103", label: "Urban Cyclist", conf: "95.2%", velocity: "16.4 km/h", status: "Bike Lane", color: "green" },
      { id: "OBJ-104", label: "Person", conf: "98.1%", velocity: "4.1 km/h", status: "Crosswalk", color: "purple" },
    ],
  },
  {
    id: "ppe",
    tag: "Safety & Compliance",
    title: "Industrial Site PPE & Exclusion Zones",
    prompt: "Verify worker safety helmets, high-visibility vests, and unauthorized exclusion zone incursions",
    latency: "2.1ms",
    model: "YOLOv11-Small (Industrial)",
    tensor: "1x3x640x640 FP16",
    fps: "58 FPS",
    detections: [
      { id: "PPE-201", label: "Hardhat Detected", conf: "99.2%", velocity: "Stationary", status: "100% Compliant", color: "green" },
      { id: "PPE-202", label: "Hi-Vis Vest", conf: "98.6%", velocity: "Moving", status: "100% Compliant", color: "green" },
      { id: "PPE-203", label: "Forklift Unit", conf: "96.9%", velocity: "12.0 km/h", status: "Authorized Zone", color: "blue" },
      { id: "PPE-204", label: "Perimeter Barrier", conf: "99.8%", velocity: "Fixed", status: "Clear", color: "cyan" },
    ],
  },
  {
    id: "retail",
    tag: "Spatial Footfall",
    title: "Retail Heatmap & Dwell Time",
    prompt: "Track customer journey trajectories, queue congestion length, and product display dwell time",
    latency: "1.8ms",
    model: "YOLOv11-Small + DeepSORT",
    tensor: "1x3x640x640 FP16",
    fps: "60 FPS",
    detections: [
      { id: "RET-301", label: "Shopper Group (x2)", conf: "97.5%", velocity: "2.4 km/h", status: "Dwell Time: 42s", color: "purple" },
      { id: "RET-302", label: "Aisle Browser", conf: "98.3%", velocity: "1.1 km/h", status: "Dwell Time: 1m 15s", color: "blue" },
      { id: "RET-303", label: "Checkout Queue", conf: "96.1%", velocity: "Slow", status: "Queue: 3 persons", color: "cyan" },
      { id: "RET-304", label: "Store Associate", conf: "98.9%", velocity: "Active", status: "Service Zone", color: "green" },
    ],
  },
  {
    id: "sahi",
    tag: "Gigapixel Slicing",
    title: "SAHI Micro-Target Resolution",
    prompt: "Scan ultra high-resolution 4K panoramic camera feed to resolve miniature and crowded distant objects",
    latency: "5.8ms",
    model: "SAHI Sliced Micro-Engine",
    tensor: "4x3x320x320 FP16",
    fps: "52 FPS",
    detections: [
      { id: "SAHI-401", label: "Micro Object #1 (28px)", conf: "94.8%", velocity: "Tracked", status: "Resolved via SAHI", color: "cyan" },
      { id: "SAHI-402", label: "Micro Object #2 (32px)", conf: "93.4%", velocity: "Tracked", status: "Resolved via SAHI", color: "blue" },
      { id: "SAHI-403", label: "Distant Aerial Target", conf: "92.1%", velocity: "34 km/h", status: "Far Horizon", color: "purple" },
      { id: "SAHI-404", label: "Occluded Vehicle", conf: "95.6%", velocity: "Partial", status: "De-occluded", color: "green" },
    ],
  },
];

// Architecture Pipeline Stages
const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Zero-Latency Stream Ingestion",
    tag: "INGESTION",
    desc: "Seamlessly ingest high-frame-rate inputs from 4K RTSP IP cameras, browser webcams, or high-res local image & video media.",
    specs: "RTSP / WebRTC / USB Camera / MP4 / PNG",
  },
  {
    step: "02",
    title: "Edge WebAssembly Pre-processing",
    tag: "ACCELERATION",
    desc: "Frames are normalized and letterboxed inside client-side WebAssembly WebWorkers using SIMD multi-threading. Zero bytes sent to cloud servers.",
    specs: "ONNX Runtime Web • SIMD • WebGL Hardware",
  },
  {
    step: "03",
    title: "Spatial 3D Tensor Inference",
    tag: "INFERENCE",
    desc: "YOLOv11 neural network executes forward inference in sub-3ms. Predicts 2D bounding boxes and extrapolates spatial 3D cuboid depth and velocity.",
    specs: "YOLOv11x • 80 COCO Classes • 3D Bounding",
  },
  {
    step: "04",
    title: "Real-Time Telemetry & Alert Webhooks",
    tag: "TELEMETRY",
    desc: "Instantly stream structured JSON detection telemetry, class confidence ratings, and trigger automated webhook notifications.",
    specs: "JSON Streams • WebSockets • Export CSV/PDF",
  },
];

// Model Comparison Matrix Data
const MODEL_BENCHMARKS = [
  {
    name: "YOLOv11-Nano",
    size: "2.6M params",
    latency: "1.4ms",
    precision: "94.2% mAP",
    throughput: "120+ FPS",
    bestFor: "IoT, Mobile & Low-Power Edge Devices",
    tag: "Ultra-Fast",
    status: "Active",
  },
  {
    name: "YOLOv11-Small",
    size: "9.4M params",
    latency: "2.8ms",
    precision: "96.8% mAP",
    throughput: "60+ FPS",
    bestFor: "Standard Laptops & High-FPS Live Feeds",
    tag: "Recommended",
    status: "Default",
  },
  {
    name: "YOLOv11-Medium 3D",
    size: "20.1M params",
    latency: "5.6ms",
    precision: "98.4% mAP",
    throughput: "45 FPS",
    bestFor: "Enterprise Spatial Surveillance & 3D Bounding",
    tag: "High Accuracy",
    status: "Available",
  },
  {
    name: "SAHI 4K Slicer",
    size: "Hybrid Multi-Scale",
    latency: "11.2ms",
    precision: "99.2% mAP",
    throughput: "30 FPS",
    bestFor: "Crowded Gigapixel CCTV & Aerial Drone Feeds",
    tag: "Ultra-Res",
    status: "Pro",
  },
];

// Interactive Capabilities Tabs
const CAPABILITY_TABS = [
  {
    id: "traffic",
    label: "🚦 Smart City Traffic",
    heading: "Intelligent Urban Mobility & Vehicle Telemetry",
    desc: "Monitor urban intersections and highway corridors with automated vehicle classification, speed estimation, congestion heatmaps, and lane violation detection.",
    metrics: [
      { label: "Vehicle Detection Accuracy", value: "98.7%" },
      { label: "Speed Tracking Variance", value: "±1.2 km/h" },
      { label: "Simultaneous Tracking", value: "120+ objects" },
    ],
    features: ["License Plate Region Localization", "Lane Departure Warning", "Person Crosswalk Safety"],
  },
  {
    id: "industrial",
    label: "🏗️ Workplace Safety",
    heading: "Automated Industrial PPE & Hazard Compliance",
    desc: "Enforce safety regulations on manufacturing floors and construction zones by detecting hardhats, safety vests, protective footwear, and hazardous equipment exclusion zones.",
    metrics: [
      { label: "PPE Compliance Rate", value: "99.4%" },
      { label: "Zone Breach Alert Time", value: "< 25ms" },
      { label: "False Positive Rate", value: "< 0.3%" },
    ],
    features: ["Real-time Exclusion Zone Geofencing", "Forklift Proximity Warning", "Automated Safety Audit Logs"],
  },
  {
    id: "retail",
    label: "🛒 Retail Intelligence",
    heading: "Spatial Shopper Analytics & Customer Flow",
    desc: "Analyze customer dwell time, aisle conversion heatmaps, and checkout queue lengths without tracking any personally identifiable biometric information.",
    metrics: [
      { label: "Dwell Time Accuracy", value: "97.8%" },
      { label: "Queue Length Prediction", value: "100% Real-time" },
      { label: "Privacy Protection", value: "100% Anonymous" },
    ],
    features: ["Aisle Footfall Heatmaps", "Queue Wait-Time Notifications", "Loss Prevention Alerts"],
  },
  {
    id: "aerial",
    label: "🚁 Drone & Aerial Recon",
    heading: "Panoramic Sliced Inference for Aerial Feeds",
    desc: "Powered by SAHI slicing algorithms to detect minute objects, livestock, vehicles, and infrastructure anomalies from high-altitude aerial drone video feeds.",
    metrics: [
      { label: "Small Object Resolution", value: "16x16 pixels" },
      { label: "Panoramic Stitching Speed", value: "52 FPS" },
      { label: "Coverage Radius", value: "Multi-km Panoramas" },
    ],
    features: ["Miniature Target Detection", "Topographical Slicing", "Thermal & Visual Stream Fusion"],
  },
];

// FAQ Data
const FAQS = [
  {
    q: "How does NeuralEye run inference in the browser without sending video to a cloud server?",
    a: "NeuralEye compiles the YOLOv11 deep learning architecture to WebAssembly (WASM) with SIMD multi-threading and WebGL acceleration. Media frames never leave your device: all matrix computations occur directly in client-side WebWorkers.",
  },
  {
    q: "What is SAHI sliced inference and when should I use it?",
    a: "SAHI (Slicing Aided Hyper Inference) divides ultra-high-resolution images (such as 4K or 8K feeds) into overlapping sub-windows, performs inference on each slice, and merges bounding boxes via Non-Maximum Suppression (NMS). This allows detecting tiny distant objects that standard resizing would otherwise erase.",
  },
  {
    q: "Can I connect custom RTSP cameras or external CCTV streams?",
    a: "Yes. In the Live View and Dashboard sections, you can connect your local webcam, USB video capture devices, or paste RTSP/WebRTC stream URLs to analyze live operational security feeds.",
  },
  {
    q: "Is my detection data and video feed private and secure?",
    a: "100% yes. In Edge Mode, video processing is executed locally in memory. NeuralEye does not store, transmit, or record any video feeds to external servers, making it inherently compliant with GDPR and enterprise data privacy regulations.",
  },
];

export default function HomePage({ isBackendReady }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const dark = theme === "dark";

  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Vision Prompting State
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_PRESETS[0]);
  const [customPromptInput, setCustomPromptInput] = useState("");
  const [isPromptRunning, setIsPromptRunning] = useState(false);
  const [promptViewMode, setPromptViewMode] = useState("visual"); // "visual" or "json"

  // Inline Demo Video Playback State
  const [inlineVideoPlaying, setInlineVideoPlaying] = useState(false);
  const inlineVideoRef = useRef(null);

  const toggleInlineVideoPlay = () => {
    if (!inlineVideoRef.current) return;
    if (inlineVideoRef.current.paused) {
      inlineVideoRef.current.play();
      setInlineVideoPlaying(true);
    } else {
      inlineVideoRef.current.pause();
      setInlineVideoPlaying(false);
    }
  };

  // Capabilities tab state
  const [activeCapTab, setActiveCapTab] = useState(CAPABILITY_TABS[0].id);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
  }, []);

  const handleNav = (item) => {
    setActive(item.label);
    setMenuOpen(false);
    if (item.isExternal || item.path.startsWith("http")) {
      window.open(item.path, "_blank", "noopener,noreferrer");
    } else if (item.path === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(item.path);
    }
  };

  const launchDetector = () => {
    navigate("/dashboard");
  };

  const handleRunPrompt = () => {
    setIsPromptRunning(true);
    setTimeout(() => {
      setIsPromptRunning(false);
    }, 450);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPrompt(preset);
    setCustomPromptInput(preset.prompt);
    setIsPromptRunning(true);
    setTimeout(() => {
      setIsPromptRunning(false);
    }, 350);
  };

  return (
    <main className={`neuraleye-shell ${dark ? "neuraleye-dark" : ""}`} id="home">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* Expansive Hero Surveillance Background - CCTV Camera at Top-Right Corner */}
      <div className="hero-expanded-backdrop" aria-hidden="true">
        <img
          src={dark ? "/neuraleye-hero-dark.png" : "/neuraleye-hero.png"}
          alt=""
          className="hero-backdrop-img"
        />
        <div className="hero-backdrop-gradient-left" />
        <div className="hero-backdrop-gradient-bottom" />
        <div className="camera-glow-cone" />
        <div className="telemetry-scan-line" />
      </div>

      {/* NeuralEye Header */}
      <header className="neural-header">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <NeuralEyeLogo size="header" />
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`nav-link ${active === item.label ? "active" : ""}`}
                onClick={() => handleNav(item)}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </button>
            );
          })}
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

          {/* Desktop Theme Toggle - hidden on mobile, placed inside mobile menu */}
          <button
            type="button"
            className="round-action desktop-theme-toggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {/* Desktop User Profile - hidden on mobile header, shown in mobile drawer */}
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
                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileOpen(false)}
                >
                  Portfolio
                </a>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  Settings
                </button>
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
            {/* User Profile Card */}
            <div className="mobile-profile-card">
              <div className="mobile-avatar">
                <Code size={18} strokeWidth={2.5} />
              </div>
              <div className="mobile-profile-info">
                <strong>NeuralEye Workspace</strong>
                <span>AI Vision Platform</span>
              </div>
            </div>

            {/* Mobile Theme Switcher Section (As requested) */}
            <div className="mobile-theme-section">
              <div className="mobile-theme-header">
                <span className="mobile-theme-title">Theme / Mode</span>
                <span className="mobile-theme-curr">{dark ? "Dark Mode 🌙" : "Light Mode ☀️"}</span>
              </div>
              <div className="mobile-theme-pills">
                <button
                  type="button"
                  className={`mobile-theme-pill ${!dark ? "active" : ""}`}
                  onClick={() => {
                    if (dark) toggleTheme();
                  }}
                >
                  <Sun size={15} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`mobile-theme-pill ${dark ? "active" : ""}`}
                  onClick={() => {
                    if (!dark) toggleTheme();
                  }}
                >
                  <Moon size={15} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="mobile-nav-divider" />

            {/* Navigation Links with Icons */}
            <div className="mobile-nav-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.label;
                return (
                  <button
                    key={item.label}
                    className={`mobile-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      handleNav(item);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="mobile-nav-icon">
                      {Icon ? <Icon size={18} /> : <Box size={18} />}
                    </span>
                    <span className="mobile-nav-label">{item.label}</span>
                    <ChevronRight size={16} className="mobile-nav-arrow" />
                  </button>
                );
              })}
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  setMenuOpen(false);
                  setSecurityModalOpen(true);
                }}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="mobile-nav-icon"><ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} /></span>
                <span className="mobile-nav-label">Security Center (6 Layers)</span>
                <ChevronRight size={16} className="mobile-nav-arrow" />
              </button>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="mobile-nav-icon"><Download size={18} style={{ color: 'var(--accent-blue, #0052cc)' }} /></span>
                <span className="mobile-nav-label" style={{ fontWeight: 700, color: 'var(--accent-blue, #0052cc)' }}>Install App (PWA)</span>
                <ChevronRight size={16} className="mobile-nav-arrow" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="mobile-cta-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="mobile-cta-btn"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard");
                }}
              >
                <Play size={15} />
                <span>Launch Live Detector</span>
              </button>

              <button
                type="button"
                className="mobile-install-cta-btn"
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }}
              >
                <Download size={15} />
                <span>Install App on Phone</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="status-pill">
            <Zap size={16} fill="currentColor" />
            <span>Next-Gen AI Vision Platform</span>
            <i />
            <span className="online-text">{isBackendReady ? "Online" : "Online"}</span>
          </div>

          <h1 id="hero-title" className="hero-headline">
            <span className="hero-line-1">Vision for</span>
            <span className="hero-gradient-phrase">
              <span className="word-the">the </span>
              <span className="word-real-world">
                Real World.
                <svg
                  className="brush-swoosh-svg"
                  viewBox="0 0 280 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="brushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#009cf0" />
                      <stop offset="30%" stopColor="#2563eb" />
                      <stop offset="72%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                  {/* Primary sweeping brush stroke */}
                  <path
                    d="M 3 13 C 35 17, 95 20, 160 16 C 205 13, 248 8, 276 3 C 260 7, 215 14, 168 17 C 108 20, 48 17, 3 13 Z"
                    fill="url(#brushGrad)"
                  />
                  {/* Secondary energetic brush stroke underneath World */}
                  <path
                    d="M 160 21 C 190 23, 224 21, 256 15 C 240 18, 206 23, 160 21 Z"
                    fill="url(#brushGrad)"
                    opacity="0.85"
                  />
                </svg>
              </span>
            </span>
          </h1>

          <p className="hero-description">
            Enterprise computer vision and SAHI sliced micro-inference built on continuous edge measurement with client-side WebAssembly and zero cloud latency.
          </p>

          <div className="hero-buttons">
            <button className="primary-button" onClick={launchDetector}>
              <Play size={17} fill="currentColor" />
              Launch Live Detector
              <ArrowRight size={19} />
            </button>
            <button className="secondary-button" onClick={() => setDemoOpen(true)}>
              <Video size={18} />
              Watch Demo
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="metrics-row">
            <div className="metric">
              <Zap className="metric-blue" size={27} fill="currentColor" />
              <div>
                <strong>0.0ms</strong>
                <span>Latency</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric">
              <Rocket className="metric-orange" size={27} fill="currentColor" />
              <div>
                <strong>60 FPS</strong>
                <span>Pipeline</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric">
              <ShieldCheck className="metric-green" size={27} />
              <div>
                <strong>100%</strong>
                <span>Privacy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Telemetry Overlay (transparent over the background scene) */}
        <div className="hero-interactive-stage" aria-label="Interactive surveillance telemetry preview">
          <button
            type="button"
            className="hud-hotspot hotspot-person"
            title="Person Detection (98.7% Confidence) - Click to inspect in Live View"
            onClick={launchDetector}
            aria-label="Inspect person detection"
          >
            <span className="hotspot-pulse" />
            <span className="hotspot-tooltip">Person • 98.7%</span>
          </button>
          <button
            type="button"
            className="hud-hotspot hotspot-car"
            title="Car Detection (97.5% Confidence) - Click to inspect in Live View"
            onClick={launchDetector}
            aria-label="Inspect car detection"
          >
            <span className="hotspot-pulse" />
            <span className="hotspot-tooltip">Car • 97.5%</span>
          </button>
          <button
            type="button"
            className="hud-hotspot hotspot-bike"
            title="Bicycle Detection (95.2% Confidence) - Click to inspect in Live View"
            onClick={launchDetector}
            aria-label="Inspect bicycle detection"
          >
            <span className="hotspot-pulse" />
            <span className="hotspot-tooltip">Bicycle • 95.2%</span>
          </button>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="feature-grid" aria-label="Platform features">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              className="feature-card glass-feature-card"
              key={feature.title}
              onClick={() => navigate(feature.path)}
            >
              <span className={`feature-icon ${feature.tone}`}>
                <Icon size={36} />
              </span>
              <span className="feature-copy">
                <strong>{feature.title}</strong>
                <small>{feature.description}</small>
              </span>
              <span className="feature-arrow">
                <ArrowRight size={19} />
              </span>
            </button>
          );
        })}
      </section>

      {/* =====================================================================
          NEW SECTION 1: INTERACTIVE VISION PROMPTING & INFERENCE CONSOLE
          ===================================================================== */}
      <section className="home-content-section" id="prompting-console">
        <div className="section-header-pill">
          <Sparkles size={16} className="text-cyan" />
          <span>INTERACTIVE VISION PROMPTING</span>
        </div>
        <h2 className="section-heading-primary">
          Ask NeuralEye in <span>Natural Language.</span>
        </h2>
        <p className="section-subtext">
          Zero-shot open-vocabulary detection and spatial reasoning. Type a prompt or select a curated scenario to simulate edge inference telemetry in real time.
        </p>

        {/* Prompt Input Command Bar */}
        <div className="prompt-console-card">
          <div className="prompt-input-row">
            <div className="prompt-input-field-wrap">
              <div className="prompt-input-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="prompt-text-input"
                value={customPromptInput || selectedPrompt.prompt}
                onChange={(e) => setCustomPromptInput(e.target.value)}
                placeholder="e.g. Find all moving vehicles and calculate velocity vectors..."
                title={customPromptInput || selectedPrompt.prompt}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRunPrompt();
                }}
              />
            </div>
            <button
              type="button"
              className="prompt-run-btn"
              onClick={handleRunPrompt}
              disabled={isPromptRunning}
            >
              {isPromptRunning ? (
                <>
                  <RefreshCw size={17} className="spin-animation" />
                  <span>Inferring...</span>
                </>
              ) : (
                <>
                  <Send size={17} />
                  <span>Execute Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Prompt Chips */}
          <div className="prompt-chips-row">
            <span className="chips-label">Preset Prompts:</span>
            {PROMPT_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`prompt-chip-btn ${selectedPrompt.id === preset.id ? "active" : ""}`}
                onClick={() => handlePresetSelect(preset)}
              >
                <span>{preset.tag}</span>
              </button>
            ))}
          </div>

          {/* Telemetry Output HUD Box */}
          <div className="prompt-results-container">
            <div className="prompt-results-header">
              <div className="results-meta-left">
                <span className="live-badge-glow">LIVE TELEMETRY</span>
                <span className="meta-text">Target: <b>{selectedPrompt.title}</b></span>
              </div>
              <div className="results-meta-right">
                <span className="telemetry-stat">
                  <Clock size={14} /> Latency: <b>{selectedPrompt.latency}</b>
                </span>
                <span className="telemetry-stat">
                  <Gauge size={14} /> Pipeline: <b>{selectedPrompt.fps}</b>
                </span>
                <span className="telemetry-stat">
                  <Cpu size={14} /> Tensor: <b>{selectedPrompt.tensor}</b>
                </span>
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`toggle-tab ${promptViewMode === "visual" ? "active" : ""}`}
                    onClick={() => setPromptViewMode("visual")}
                  >
                    Visual
                  </button>
                  <button
                    type="button"
                    className={`toggle-tab ${promptViewMode === "json" ? "active" : ""}`}
                    onClick={() => setPromptViewMode("json")}
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Telemetry Stream */}
            {promptViewMode === "visual" ? (
              <div className="prompt-detections-grid">
                {selectedPrompt.detections.map((det) => (
                  <div key={det.id} className={`telemetry-card border-${det.color}`}>
                    <div className="tc-header">
                      <span className="tc-id">{det.id}</span>
                      <span className={`tc-conf badge-${det.color}`}>{det.conf}</span>
                    </div>
                    <h4 className="tc-label">{det.label}</h4>
                    <div className="tc-details">
                      <div className="tc-detail-item">
                        <span>Status</span>
                        <strong>{det.status}</strong>
                      </div>
                      <div className="tc-detail-item">
                        <span>Kinematics</span>
                        <strong>{det.velocity}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Raw JSON Stream */
              <div className="prompt-json-terminal">
                <div className="terminal-bar">
                  <Terminal size={14} />
                  <span>neuraleye-telemetry-stream.json</span>
                </div>
                <pre className="json-code-block">
                  {JSON.stringify(
                    {
                      timestamp: new Date().toISOString(),
                      prompt: customPromptInput || selectedPrompt.prompt,
                      engine: selectedPrompt.model,
                      latency_ms: parseFloat(selectedPrompt.latency),
                      hardware_accelerator: "WASM SIMD WebWorker",
                      active_entities: selectedPrompt.detections.length,
                      bounding_tensors: selectedPrompt.detections,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          NEW SECTION 2: 4-STAGE TECHNICAL ARCHITECTURE PIPELINE
          ===================================================================== */}
      <section className="home-content-section" id="architecture-pipeline">
        <div className="section-header-pill">
          <Layers size={16} className="text-cyan" />
          <span>TECHNICAL SPECIFICATION</span>
        </div>
        <h2 className="section-heading-primary">
          High-Throughput <span>Edge Architecture.</span>
        </h2>
        <p className="section-subtext">
          Engineered for deterministic sub-3 millisecond computer vision. Explore how frames travel from sensor optics to 3D spatial predictions.
        </p>

        <div className="pipeline-steps-grid">
          {PIPELINE_STEPS.map((pipe) => (
            <div key={pipe.step} className="pipeline-step-card">
              <div className="pipeline-card-top">
                <span className="pipeline-step-number">{pipe.step}</span>
                <span className="pipeline-tag">{pipe.tag}</span>
              </div>
              <h3 className="pipeline-title">{pipe.title}</h3>
              <p className="pipeline-desc">{pipe.desc}</p>
              <div className="pipeline-specs-footer">
                <span className="specs-label">RUNTIME SPEC:</span>
                <code>{pipe.specs}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          NEW SECTION 3: MODEL BENCHMARK & PERFORMANCE MATRIX
          ===================================================================== */}
      <section className="home-content-section" id="model-benchmarks">
        <div className="section-header-pill">
          <Activity size={16} className="text-cyan" />
          <span>YOLOV11 BENCHMARK TELEMETRY</span>
        </div>
        <h2 className="section-heading-primary">
          Benchmarked for <span>Ultra-Low Latency.</span>
        </h2>
        <p className="section-subtext">
          Zero cloud dependencies. Compare edge runtime performance metrics across NeuralEye supported model weights on modern browser WebAssembly runtimes.
        </p>

        <div className="matrix-table-card">
          <div className="matrix-responsive-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>MODEL VARIANT</th>
                  <th>PARAMETERS</th>
                  <th>EDGE LATENCY</th>
                  <th>ACCURACY (mAP)</th>
                  <th>THROUGHPUT</th>
                  <th>RECOMMENDED DEPLOYMENT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_BENCHMARKS.map((model) => (
                  <tr key={model.name}>
                    <td>
                      <div className="model-name-cell">
                        <strong>{model.name}</strong>
                        <span className="model-tier-chip">{model.tag}</span>
                      </div>
                    </td>
                    <td><span className="cell-mono">{model.size}</span></td>
                    <td><span className="cell-metric-highlight latency-color">{model.latency}</span></td>
                    <td><span className="cell-metric-highlight accuracy-color">{model.precision}</span></td>
                    <td><span className="cell-mono">{model.throughput}</span></td>
                    <td><span className="cell-desc">{model.bestFor}</span></td>
                    <td>
                      <button
                        type="button"
                        className="launch-model-btn"
                        onClick={launchDetector}
                        title={`Deploy ${model.name} in Live Workbench`}
                      >
                        <span>Test</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NEW SECTION 4: INTERACTIVE CAPABILITIES & DOMAIN SHOWCASE
          ===================================================================== */}
      <section className="home-content-section" id="capabilities-showcase">
        <div className="section-header-pill">
          <Database size={16} className="text-cyan" />
          <span>REAL-WORLD DOMAIN CAPABILITIES</span>
        </div>
        <h2 className="section-heading-primary">
          Built for <span>Mission-Critical Operations.</span>
        </h2>
        <p className="section-subtext">
          From metropolitan smart traffic corridors to hazardous industrial sites, NeuralEye delivers spatial situational awareness wherever cameras exist.
        </p>

        {/* Domain Tabs */}
        <div className="capabilities-nav-bar">
          {CAPABILITY_TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`cap-tab-btn ${activeCapTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveCapTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Domain Card */}
        {(() => {
          const tab = CAPABILITY_TABS.find((t) => t.id === activeCapTab) || CAPABILITY_TABS[0];
          return (
            <div className="cap-showcase-card">
              <div className="cap-content-col">
                <span className="cap-badge">{tab.label}</span>
                <h3 className="cap-heading">{tab.heading}</h3>
                <p className="cap-description">{tab.desc}</p>

                <div className="cap-features-list">
                  {tab.features.map((feat, idx) => (
                    <div key={idx} className="cap-feature-bullet">
                      <div className="bullet-icon-wrap">
                        <Check size={14} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="cap-cta-row">
                  <button className="primary-button" onClick={launchDetector}>
                    <Play size={16} fill="currentColor" />
                    Open Live Detector
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>

              <div className="cap-metrics-col">
                <h4 className="metrics-col-title">VERIFIED CAPABILITY BENCHMARKS</h4>
                <div className="cap-stats-list">
                  {tab.metrics.map((m, idx) => (
                    <div key={idx} className="cap-stat-box">
                      <span className="stat-label">{m.label}</span>
                      <strong className="stat-value">{m.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* =====================================================================
          NEW SECTION 5: ENTERPRISE ZERO-TRUST SECURITY & PRIVACY
          ===================================================================== */}
      <section className="home-content-section" id="security-privacy">
        <div className="security-banner-card">
          <div className="security-card-content">
            <div className="security-badge">
              <ShieldCheck size={20} />
              <span>ENTERPRISE AIR-GAPPED PRIVACY</span>
            </div>
            <h2 className="security-title">
              100% Client-Side. <span>Zero Video Transmission.</span>
            </h2>
            <p className="security-desc">
              Unlike cloud-hosted computer vision APIs that stream sensitive video streams across the public internet, NeuralEye evaluates all frames locally within your browser sandbox. Your camera feeds never touch external infrastructure.
            </p>
            <div className="security-badges-row">
              <div className="sec-tag">
                <Check size={16} /> <span>Zero Cloud Ingestion</span>
              </div>
              <div className="sec-tag">
                <Check size={16} /> <span>GDPR & CCPA Compliant</span>
              </div>
              <div className="sec-tag">
                <Check size={16} /> <span>Air-Gapped & Offline Ready</span>
              </div>
              <div className="sec-tag">
                <Check size={16} /> <span>WASM Sandboxed Execution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NEW SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)
          ===================================================================== */}
      <section className="home-content-section" id="faq-section">
        <div className="section-header-pill">
          <HelpCircle size={16} className="text-cyan" />
          <span>TECHNICAL QUESTIONS & ARCHITECTURE</span>
        </div>
        <h2 className="section-heading-primary">
          Frequently Asked <span>Questions.</span>
        </h2>
        <p className="section-subtext">
          Everything you need to know about deploying NeuralEye client-side edge computer vision.
        </p>

        <div className="faq-accordion-container">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-card ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-toggle-icon">
                    <ChevronDown size={18} className={isOpen ? "rotate-180" : ""} />
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          CINEMA SHOWCASE SECTION: FULL ENGINE DEMO VIDEO IN ACTION
          ===================================================================== */}
      <section className="demo-showcase-cinema-section" id="platform-demo-section">
        <div className="demo-cinema-ambient-glow-left" />
        <div className="demo-cinema-ambient-glow-right" />

        <div className="section-header-pill">
          <Video size={16} className="text-cyan" />
          <span>FULL ENGINE WALKTHROUGH</span>
        </div>
        <h2 className="section-heading-primary">
          Experience <span>NeuralEye in Real Time.</span>
        </h2>
        <p className="section-subtext">
          Watch full-fidelity YOLOv11 edge inference, SAHI micro-slicing, and real-time tracking executing with zero cloud dependencies.
        </p>

        <div className="demo-player-container-cinema">
          <div className="demo-video-wrapper">
            {/* Transparent Watermark Logo - Bottom Right in all responsive views */}
            <div className="demo-video-watermark-clean">
              <NeuralEyeLogo size="compact" showBadge={false} theme="dark" />
            </div>

            {/* Glowing Center Play Button Overlay */}
            <div
              className={`video-center-play-overlay ${inlineVideoPlaying ? "video-playing" : "video-paused"}`}
              onClick={toggleInlineVideoPlay}
            >
              <button
                type="button"
                className="center-play-btn"
                aria-label={inlineVideoPlaying ? "Pause video" : "Play demo video"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleInlineVideoPlay();
                }}
              >
                <div className="center-play-ripple" />
                <Play size={38} fill="#ffffff" color="#ffffff" className="center-play-icon" />
              </button>
              <span className="center-play-label">Play 1080p Engine Walkthrough</span>
            </div>

            <video
              ref={inlineVideoRef}
              className="demo-video-player"
              src="/neuraleye-demo.mp4"
              poster="/neuraleye-demo-poster.jpg"
              controls
              playsInline
              preload="metadata"
              onPlay={() => setInlineVideoPlaying(true)}
              onPause={() => setInlineVideoPlaying(false)}
            />
          </div>

          <div className="demo-player-footer-cinema">
            <div className="demo-footer-info">
              <span className="live-pulse-dot" />
              <span>Full HD 1080p Engine Walkthrough</span>
              <span className="demo-duration-pill">0:29</span>
            </div>
            <button className="primary-button demo-action-btn" onClick={launchDetector}>
              <Play size={16} fill="currentColor" />
              Launch Live Detector
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NEW SECTION 7: BOTTOM COMMAND CENTER CALL-TO-ACTION
          ===================================================================== */}
      <section className="home-cta-banner">
        <div className="cta-banner-card">
          <div className="cta-ambient-glow" />
          <span className="cta-badge">DEPLOY INTELLIGENT VISION</span>
          <h2 className="cta-headline">
            Ready to Run Computer Vision at the <span>Speed of Edge?</span>
          </h2>
          <p className="cta-subtext">
            Experience real-time YOLOv11 and SAHI sliced inference running directly on your hardware. Launch the console detector in one click.
          </p>
          <div className="cta-buttons-row">
            <button className="primary-button" onClick={launchDetector}>
              <Play size={18} fill="currentColor" />
              Launch Live Workbench
              <ArrowRight size={19} />
            </button>
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              <Cpu size={18} />
              Developer Portfolio
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Standard Default Footer (Full-width, Perfectly Centered, No Box / Card) */}
      <footer className="dashboard-footer-unified">
        <div className="footer-content-wrap">
          <div className="footer-brand-centered">
            <div className="brand" style={{ transform: 'none', cursor: 'default' }}>
              <NeuralEyeLogo size="footer" />
            </div>
          </div>
          <div className="footer-nav-centered">
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-btn"
            >
              Developer Portfolio
            </a>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-btn" onClick={() => navigate("/contact")}>Contact Developer</button>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-btn" onClick={() => navigate("/privacy")}>Privacy Policy</button>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-btn" onClick={() => navigate("/terms")}>Terms of Service</button>
          </div>
          <div className="footer-divider-line" />
          <div className="footer-meta-centered">
            <p className="footer-copyright-text">
              © 2026 NeuralEye 3D Vision Systems. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Watch Demo Modal */}
      {demoOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDemoOpen(false)}>
          <div
            className="demo-modal demo-cinema-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close demo"
              onClick={() => setDemoOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="demo-modal-header">
              <span className="live-demo-pill">
                <span className="live-pulse-dot" />
                PRODUCT WALKTHROUGH
              </span>
              <h2 id="demo-title">NeuralEye YOLOv11 Engine in Action</h2>
            </div>

            <div className="demo-video-wrapper">
              <div className="demo-video-watermark-clean">
                <NeuralEyeLogo size="compact" showBadge={false} theme="dark" />
              </div>
              <video
                className="demo-video-player"
                src="/neuraleye-demo.mp4"
                poster="/neuraleye-demo-poster.jpg"
                controls
                autoPlay
                playsInline
              />
            </div>

            <div className="demo-modal-footer">
              <p className="demo-modal-caption">
                Client-side WebAssembly YOLOv11 inference executing with sub-3ms edge latency and zero cloud dependency.
              </p>
              <button
                className="primary-button modal-button"
                onClick={() => {
                  setDemoOpen(false);
                  launchDetector();
                }}
              >
                <Play size={16} fill="currentColor" />
                Launch Workbench Console <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NeuralEye Enterprise Security Center Modal */}
      <SecurityCenterModal isOpen={securityModalOpen} onClose={() => setSecurityModalOpen(false)} />
    </main>
  );
}
