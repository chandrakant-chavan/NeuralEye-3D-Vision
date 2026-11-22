import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import config from '../config';
import { getClassMetadata, formatConfidence } from '../utils/detectionColors';
import SecurityService from '../utils/security';

const TECH_CLASSES = [
  'person', 'laptop', 'cell phone', 'mouse', 'keyboard', 'bottle', 'cup',
  'chair', 'tv', 'book', 'clock', 'scissors', 'backpack', 'handbag'
];

export default function WebcamDetection({ isBackendReady: parentBackendReady, onDetectionsChange }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [confidence, setConfidence] = useState(0.25);
  const [useBackend, setUseBackend] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detections, setDetections] = useState([]);
  const [modelMode, setModelMode] = useState('smart');
  const [filterSpurious, setFilterSpurious] = useState(true);
  const [yoloPrompt, setYoloPrompt] = useState('smartphone, person, hand, cap, glasses');
  const [cameraError, setCameraError] = useState(null);
  const [stripView, setStripView] = useState('grouped'); // 'grouped' or 'instances'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isProcessing = useRef(false);
  const streamRef = useRef(null);
  const letterboxRef = useRef({ scale: 1, padX: 0, padY: 0, vW: 640, vH: 640 });
  const [backendReady, setBackendReady] = useState(false);

  const ready = parentBackendReady !== undefined ? parentBackendReady : backendReady;

  // Notify parent dashboard whenever detections change
  useEffect(() => {
    if (onDetectionsChange) {
      onDetectionsChange(detections);
    }
  }, [detections, onDetectionsChange]);

  // Aggregate detections by class count for grouped view (e.g. Cars: 2, Bus: 1...)
  const groupedDetections = useMemo(() => {
    if (!detections || detections.length === 0) return [];

    const counts = {};
    detections.forEach((d) => {
      const meta = getClassMetadata(d.label);
      const cat = meta.displayLabel || d.label;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const getPluralName = (name, count) => {
      if (count <= 1) return name;
      if (name.toLowerCase() === 'bus') return 'Buses';
      if (name.toLowerCase().endsWith('s')) return name;
      return `${name}s`;
    };

    return Object.keys(counts)
      .map((cat) => {
        const meta = getClassMetadata(cat.toLowerCase());
        const count = counts[cat];
        return {
          label: cat,
          pluralLabel: getPluralName(cat, count),
          count,
          color: meta.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [detections]);

  // Background health check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/`);
        if (res.ok) setBackendReady(true);
      } catch {
        setBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Web Worker for client-side ONNX detection
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('../workers/detection.worker.js', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (e) => {
        const { type, detections: workerDetections, error } = e.data;
        if (type === 'LOADED') {
          setIsModelLoaded(true);
        } else if (type === 'RESULTS') {
          setDetections(workerDetections || []);
          isProcessing.current = false;
        } else if (type === 'ERROR') {
          console.error("Worker detection error:", error);
          isProcessing.current = false;
        }
      };

      workerRef.current.postMessage({ type: 'LOAD' });
    } catch (err) {
      console.warn("Could not initialize ONNX worker:", err);
    }

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const startWebcam = async () => {
    setCameraError(null);

    // Check for Secure Context / getUserMedia availability
    if (!navigator?.mediaDevices?.getUserMedia) {
      const isInsecureRemote = !window.isSecureContext && window.location.hostname !== 'localhost';
      setCameraError({
        type: isInsecureRemote ? 'insecure_origin' : 'unsupported',
        message: isInsecureRemote
          ? 'Camera access is blocked because this page is served over plain HTTP on a network IP.'
          : 'Webcam mediaDevices API is not supported in this browser environment.'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsStreaming(true);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      const isInsecureRemote = !window.isSecureContext && window.location.hostname !== 'localhost';
      if (isInsecureRemote) {
        setCameraError({
          type: 'insecure_origin',
          message: 'Camera access blocked: Mobile browsers require HTTPS or localhost for camera hardware permissions.'
        });
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError({
          type: 'permission_denied',
          message: 'Camera permission was denied. Please allow camera access in your browser site settings.'
        });
      } else {
        setCameraError({
          type: 'generic',
          message: `Unable to access camera (${err.message || 'Check camera connection and browser permissions'}).`
        });
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsStreaming(false);
    setDetections([]);
    setCameraError(null);
    isProcessing.current = false;
  };

  const detectFrame = useCallback(async () => {
    if (!videoRef.current || !isStreaming || isProcessing.current) return;

    const video = videoRef.current;
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 640;
    if (vW === 0 || vH === 0) return;

    isProcessing.current = true;

    // Aspect-ratio preserving letterbox for maximum YOLO accuracy
    const scale = Math.min(640 / vW, 640 / vH);
    const scaledW = vW * scale;
    const scaledH = vH * scale;
    const padX = (640 - scaledW) / 2;
    const padY = (640 - scaledH) / 2;

    letterboxRef.current = { scale, padX, padY, vW, vH };

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    
    // Fill with neutral YOLO letterbox background
    ctx.fillStyle = '#727272';
    ctx.fillRect(0, 0, 640, 640);
    ctx.drawImage(video, padX, padY, scaledW, scaledH);

    if (useBackend) {
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'webcam.jpg');
        formData.append('confidence', confidence.toString());

        try {
          const response = await fetch(`${config.API_BASE_URL}${config.API_V1_STR}/predict`, {
            method: 'POST',
            headers: SecurityService.getSecureHeaders(),
            body: formData,
          });
          const result = await response.json();
          setDetections(result.objects || []);
        } catch (error) {
          console.error("Backend detection error:", error);
        } finally {
          isProcessing.current = false;
        }
      }, 'image/jpeg', 0.85);
    } else {
      const imageData = ctx.getImageData(0, 0, 640, 640);
      let allowed = null;
      if (modelMode === 'smart') {
        allowed = TECH_CLASSES;
      }
      workerRef.current.postMessage({
        type: 'DETECT',
        data: {
          buffer: imageData.data.buffer,
          threshold: confidence,
          iouThreshold: 0.35,
          options: {
            filterSpurious: filterSpurious,
            allowedClasses: allowed,
            yoloPrompt: modelMode === 'yoloworld' ? yoloPrompt : null
          }
        }
      }, [imageData.data.buffer]);
    }
  }, [isStreaming, confidence, useBackend, modelMode, filterSpurious, yoloPrompt]);

  // Real-time animation loop
  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;
      if (isStreaming && !isProcessing.current) {
        detectFrame();
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    if (isStreaming) {
      loop();
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, detectFrame]);

  // Draw Bounding Boxes with Class Colors and Badges
  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    const dpr = window.devicePixelRatio || 1;
    const rect = video.getBoundingClientRect();
    const dispW = rect.width || video.clientWidth;
    const dispH = rect.height || video.clientHeight;

    const vW = video.videoWidth || letterboxRef.current.vW || 640;
    const vH = video.videoHeight || letterboxRef.current.vH || 480;

    if (!dispW || !dispH || !vW || !vH) return;

    // High-DPI canvas scaling for razor sharp vector rendering matching video element
    canvas.width = Math.round(dispW * dpr);
    canvas.height = Math.round(dispH * dpr);
    canvas.style.width = `${dispW}px`;
    canvas.style.height = `${dispH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, dispW, dispH);

    // Compute exact rendered video sub-rectangle inside video container (matching object-fit: contain)
    const videoRatio = vW / vH;
    const elemRatio = dispW / dispH;

    let renderW = dispW;
    let renderH = dispH;
    let offsetX = 0;
    let offsetY = 0;

    if (Math.abs(videoRatio - elemRatio) > 0.01) {
      if (videoRatio > elemRatio) {
        // Video is wider than element box: black bars top & bottom
        renderW = dispW;
        renderH = dispW / videoRatio;
        offsetY = (dispH - renderH) / 2;
      } else {
        // Video is taller than element box: black bars left & right
        renderH = dispH;
        renderW = dispH * videoRatio;
        offsetX = (dispW - renderW) / 2;
      }
    }

    const { scale, padX, padY } = letterboxRef.current;
    const effScale = scale || Math.min(640 / vW, 640 / vH);
    const effPadX = padX !== undefined ? padX : (640 - vW * effScale) / 2;
    const effPadY = padY !== undefined ? padY : (640 - vH * effScale) / 2;

    const scaleX = renderW / vW;
    const scaleY = renderH / vH;

    detections.forEach((det) => {
      if (!det.bbox || det.bbox.length < 4) return;
      const [x, y, w, h] = det.bbox;

      // Extract original coordinates in original video space [0..vW, 0..vH]
      const origX = Math.max(0, Math.min(vW, (x - effPadX) / effScale));
      const origY = Math.max(0, Math.min(vH, (y - effPadY) / effScale));
      const origW = Math.min(vW - origX, Math.max(0, w / effScale));
      const origH = Math.min(vH - origY, Math.max(0, h / effScale));

      if (origW <= 2 || origH <= 2) return;

      // Map to exact pixel location on screen relative to visible video frame
      let scaledX;
      if (isMirrored) {
        scaledX = Math.round(renderW - (origX + origW) * scaleX + offsetX);
      } else {
        scaledX = Math.round(origX * scaleX + offsetX);
      }
      const scaledY = Math.round(origY * scaleY + offsetY);
      const scaledW = Math.round(origW * scaleX);
      const scaledH = Math.round(origH * scaleY);

      if (scaledW <= 4 || scaledH <= 4) return;

      const meta = getClassMetadata(det.label, det.confidence);

      // 1. Neon Cyber Bounding Box
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 5;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
      ctx.shadowBlur = 0;

      // 2. Cybernetic Corner Reticles (Target Lock HUD)
      const cornerLen = Math.min(10, Math.floor(scaledW / 4), Math.floor(scaledH / 4));
      if (cornerLen >= 4) {
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(scaledX, scaledY + cornerLen);
        ctx.lineTo(scaledX, scaledY);
        ctx.lineTo(scaledX + cornerLen, scaledY);
        // Top-right
        ctx.moveTo(scaledX + scaledW - cornerLen, scaledY);
        ctx.lineTo(scaledX + scaledW, scaledY);
        ctx.lineTo(scaledX + scaledW, scaledY + cornerLen);
        // Bottom-left
        ctx.moveTo(scaledX, scaledY + scaledH - cornerLen);
        ctx.lineTo(scaledX, scaledY + scaledH);
        ctx.lineTo(scaledX + cornerLen, scaledY + scaledH);
        // Bottom-right
        ctx.moveTo(scaledX + scaledW - cornerLen, scaledY + scaledH);
        ctx.lineTo(scaledX + scaledW, scaledY + scaledH);
        ctx.lineTo(scaledX + scaledW, scaledY + scaledH - cornerLen);
        ctx.stroke();
      }

      // 3. Solid Label Badge
      const confFormatted = formatConfidence(det.confidence);
      const badgeText = `${meta.displayLabel}: ${confFormatted}`;
      ctx.font = '600 12px "JetBrains Mono", Menlo, Consolas, monospace';
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = Math.round(textWidth + 14);
      const badgeH = 20;
      const badgeY = scaledY >= badgeH + 3 ? scaledY - badgeH - 3 : scaledY + 3;

      ctx.fillStyle = meta.bg;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillRect(scaledX, badgeY, badgeW, badgeH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = meta.text || '#000000';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, scaledX + 7, badgeY + badgeH / 2);
    });

    ctx.restore();
  }, [detections, isMirrored]);

  useEffect(() => {
    drawBoundingBoxes();
  }, [detections, drawBoundingBoxes]);

  useEffect(() => {
    window.addEventListener('resize', drawBoundingBoxes);
    return () => window.removeEventListener('resize', drawBoundingBoxes);
  }, [drawBoundingBoxes]);

  return (
    <div className="detection-viewport-wrapper">
      {/* Controls Bar */}
      <div className="viewport-controls-bar">
        <div className="controls-left">
          {!isStreaming ? (
            <button className="ctrl-btn start-camera-btn" onClick={startWebcam}>
              <span className="rec-dot"></span> Start Camera Feed
            </button>
          ) : (
            <button className="ctrl-btn stop-camera-btn" onClick={stopWebcam}>
              Stop Feed
            </button>
          )}

          <div className="slider-box">
            <span className="slider-label">Conf: {confidence.toFixed(2)}</span>
            <input 
              type="range" 
              min="0.10" max="0.95" step="0.05" 
              value={confidence} 
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="ctrl-slider"
            />
          </div>

          {isStreaming && (
            <button
              type="button"
              className={`ctrl-btn flip-btn ${isMirrored ? 'active' : ''}`}
              onClick={() => setIsMirrored((prev) => !prev)}
              title="Mirror camera view horizontally"
            >
              <span>⇄</span> {isMirrored ? 'Mirrored' : 'Mirror Feed'}
            </button>
          )}
        </div>

        <div className="controls-right">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={useBackend} 
              onChange={(e) => setUseBackend(e.target.checked)}
              disabled={!ready}
            />
            <span>Backend Server</span>
          </label>

          <div className="engine-status-tag">
            <span className={`status-dot ${isStreaming ? 'online' : (isModelLoaded ? 'online' : 'loading')}`}></span>
            {isStreaming ? 'Streaming Live' : isModelLoaded ? 'ONNX Standby' : 'Loading Engine...'}
          </div>
        </div>
      </div>

      {/* Target Architecture Toolbar */}
      <div className="architecture-toolbar">
        <div className="architecture-select-group">
          <span className="arch-label">Target Architecture:</span>
          <select
            value={modelMode}
            onChange={(e) => setModelMode(e.target.value)}
            className="arch-select"
          >
            <option value="smart">Smart Desk & Gadgets (Suppresses Noise)</option>
            <option value="coco80">COCO 80 Standard Objects (Raw)</option>
            <option value="yoloworld">YOLO-World Zero-Shot Prompting</option>
            <option value="openimages">OpenImages 600 Categories (Extended)</option>
          </select>
        </div>

        <label className="spurious-toggle">
          <input
            type="checkbox"
            checked={filterSpurious}
            onChange={(e) => setFilterSpurious(e.target.checked)}
          />
          <span>Suppress False Positives (Prevents Hallucinated Toys)</span>
        </label>
      </div>

      {modelMode === 'yoloworld' && (
        <div className="yolo-prompt-bar">
          <span className="yolo-prompt-label">Zero-Shot Classes:</span>
          <input
            type="text"
            value={yoloPrompt}
            onChange={(e) => setYoloPrompt(e.target.value)}
            placeholder="e.g. smartphone, person, hand, cap, mask"
            className="yolo-prompt-input"
          />
        </div>
      )}

      {/* Camera Security / Permission Guidance Banner */}
      {cameraError && (
        <div className="camera-security-banner">
          <div className="camera-security-header">
            <div className="camera-security-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="camera-security-title-wrap">
              <h4>
                {cameraError.type === 'insecure_origin'
                  ? 'Browser Security Restriction (HTTP on Local IP)'
                  : cameraError.type === 'permission_denied'
                  ? 'Camera Permission Denied'
                  : 'Camera Access Notice'}
              </h4>
              <p className="camera-security-desc">{cameraError.message}</p>
            </div>
            <button 
              type="button"
              className="camera-security-close" 
              onClick={() => setCameraError(null)}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>

          {cameraError.type === 'insecure_origin' && (
            <div className="camera-security-tips">
              <div className="security-tip-item">
                <span className="tip-badge">Fix 1 (Direct Click)</span>
                <span>
                  <strong>Laptop / PC Par Ho?</strong> Bas is link par click karo:{' '}
                  <a 
                    href={`http://localhost:${typeof window !== 'undefined' ? (window.location.port || '4173') : '4173'}${typeof window !== 'undefined' ? window.location.pathname : '/live'}`} 
                    className="security-link-btn"
                  >
                    Open on localhost:{typeof window !== 'undefined' ? (window.location.port || '4173') : '4173'} ↗
                  </a>
                  {' '}(Localhost par camera hamesha allowed hota hai).
                </span>
              </div>
              <div className="security-tip-item">
                <span className="tip-badge">Fix 2 (Mobile)</span>
                <span>
                  <strong>Phone par chalana hai?</strong> Phone Chrome me{' '}
                  <code className="security-code">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>{' '}
                  khol kar <strong>Enabled</strong> karein,{' '}
                  <code className="security-code">{typeof window !== 'undefined' ? window.location.origin : 'http://10.22.50.64:4173'}</code> add karein aur <strong>Relaunch</strong> dabayein.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Video Viewport */}
      <div className="viewport-screen">
        {/* Cybernetic HUD 3D Corner Reticles */}
        <div className="hud-corner hud-top-left" />
        <div className="hud-corner hud-top-right" />
        <div className="hud-corner hud-bottom-left" />
        <div className="hud-corner hud-bottom-right" />
        <div className="hud-perspective-grid" />

        {!isStreaming && (
          <div className="empty-viewport-state">
            <div className="camera-off-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <p>Live camera stream offline. Click "Start Camera Feed" above to begin 3D real-time neural detection.</p>
          </div>
        )}
        
        <div 
          className="feed-canvas-container" 
          style={{ 
            display: isStreaming ? 'inline-flex' : 'none',
            position: 'relative',
            maxWidth: '100%',
            lineHeight: 0
          }}
        >
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="feed-img"
            style={{
              transform: isMirrored ? 'scaleX(-1)' : 'none',
              maxWidth: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
          <canvas ref={canvasRef} className="feed-canvas"></canvas>
        </div>
      </div>

      {/* Detection Pills Bar */}
      {detections.length > 0 && (
        <div className="active-detections-strip">
          <div className="strip-header-row">
            <div className="strip-title">
              Detected in Scene ({detections.length} Total • {groupedDetections.length} Classes):
            </div>
            <div className="strip-view-toggles">
              <button
                type="button"
                className={`strip-toggle-btn ${stripView === 'grouped' ? 'active' : ''}`}
                onClick={() => setStripView('grouped')}
              >
                Grouped Count
              </button>
              <button
                type="button"
                className={`strip-toggle-btn ${stripView === 'instances' ? 'active' : ''}`}
                onClick={() => setStripView('instances')}
              >
                All Instances ({detections.length})
              </button>
            </div>
          </div>

          <div className="strip-pills">
            {stripView === 'grouped' ? (
              groupedDetections.map((item, idx) => (
                <span
                  key={idx}
                  className="det-chip det-chip-grouped"
                  style={{ borderColor: item.color, color: item.color }}
                >
                  <span className="chip-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="chip-grouped-label">{item.pluralLabel}</span>
                  <span className="chip-qty-pill" style={{ backgroundColor: item.color }}>
                    {item.count}
                  </span>
                </span>
              ))
            ) : (
              detections.map((det, idx) => {
                const meta = getClassMetadata(det.label, det.confidence);
                return (
                  <span
                    key={idx}
                    className="det-chip"
                    style={{ borderColor: meta.color, color: meta.color }}
                  >
                    <span className="chip-dot" style={{ backgroundColor: meta.color }}></span>
                    {meta.displayLabel}: {formatConfidence(det.confidence)}
                  </span>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
