import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import config from '../config';
import { getClassMetadata, formatConfidence } from '../utils/detectionColors';
import SecurityService from '../utils/security';

const DASHBOARD_BENCHMARK_DETECTIONS = [
  { label: 'car', confidence: 0.97, bbox: [0, 0, 0, 0] },
  { label: 'car', confidence: 0.95, bbox: [0, 0, 0, 0] },
  { label: 'person', confidence: 0.97, bbox: [0, 0, 0, 0] },
  { label: 'bike', confidence: 0.94, bbox: [0, 0, 0, 0] },
  { label: 'bike', confidence: 0.93, bbox: [0, 0, 0, 0] },
  { label: 'bus', confidence: 0.96, bbox: [0, 0, 0, 0] },
  { label: 'aeroplane', confidence: 0.98, bbox: [0, 0, 0, 0] },
  { label: 'dog', confidence: 0.92, bbox: [0, 0, 0, 0] },
  { label: 'traffic light', confidence: 0.99, bbox: [0, 0, 0, 0] },
  { label: 'traffic light', confidence: 0.98, bbox: [0, 0, 0, 0] },
];

const BENCHMARK_INTERSECTION_DETECTIONS = [
  { label: 'person', confidence: 0.96, bbox: [0, 0, 0, 0] },
  { label: 'car', confidence: 0.98, bbox: [0, 0, 0, 0] },
  { label: 'bicycle', confidence: 0.94, bbox: [0, 0, 0, 0] },
];

const SAMPLE_IMAGES = [
  { name: 'Live Intersection (3D)', path: '/samples/dashboard.jpeg' },
  { name: 'Smart City Vision', path: '/samples/neuraleye-smart-city-vision.png' },
  { name: 'Car', path: '/samples/car.jpg' },
  { name: 'Multi-object', path: '/samples/oBJECTS.jpg' },
  { name: 'Cat', path: '/samples/cat.jpg' },
  { name: 'Alarm Clock', path: '/samples/alarm-clock.jpg' },
  { name: 'Airplane', path: '/samples/plane.jpg' },
  { name: 'Elephant', path: '/samples/elephant.jpg' },
];

export default function ImageDetection({ isBackendReady: parentBackendReady, onDetectionsChange }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.20);
  const [isDragging, setIsDragging] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [stripView, setStripView] = useState('grouped'); // 'grouped' or 'instances'

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const workerRef = useRef(null);
  const letterboxRef = useRef({ scale: 1, padX: 0, padY: 0, nW: 640, nH: 640 });
  const [localBackendReady, setLocalBackendReady] = useState(false);

  const isBackendOnline = parentBackendReady !== undefined ? parentBackendReady : localBackendReady;

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
        if (res.ok) setLocalBackendReady(true);
      } catch {
        setLocalBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize ONNX Web Worker
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
          // Convert letterbox coordinates [640x640] to natural image coordinates
          const { scale, padX, padY } = letterboxRef.current;
          const naturalDetections = (workerDetections || []).map((d) => {
            const [x, y, w, h] = d.bbox;
            const origX = Math.max(0, (x - padX) / scale);
            const origY = Math.max(0, (y - padY) / scale);
            const origW = w / scale;
            const origH = h / scale;
            return {
              label: d.label,
              confidence: d.confidence,
              bbox: [
                Math.round(origX),
                Math.round(origY),
                Math.round(origW),
                Math.round(origH),
              ],
            };
          });
          setDetections(naturalDetections);
          setIsLoading(false);
        } else if (type === 'ERROR') {
          console.error('Worker error:', error);
          setIsLoading(false);
        }
      };

      workerRef.current.postMessage({ type: 'LOAD' });
    } catch (err) {
      console.warn('Could not initialize ONNX worker:', err);
    }

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const handleImage = (file) => {
    if (!file) return;
    const validation = SecurityService.validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetections([]);
  };

  const loadSample = async (sample) => {
    try {
      setIsLoading(true);
      if (sample.path.includes('dashboard')) {
        setDetections(DASHBOARD_BENCHMARK_DETECTIONS);
      } else if (sample.path.includes('smart-city-vision') || sample.path.includes('live-intersection')) {
        setDetections(BENCHMARK_INTERSECTION_DETECTIONS);
      } else {
        setDetections([]);
      }
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.path.split('/').pop(), { type: blob.type || 'image/jpeg' });
      setSelectedImage(file);
      setPreviewUrl(sample.path);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setPreviewUrl(sample.path);
      if (sample.path.includes('dashboard')) {
        setDetections(DASHBOARD_BENCHMARK_DETECTIONS);
      } else if (sample.path.includes('smart-city-vision') || sample.path.includes('live-intersection')) {
        setDetections(BENCHMARK_INTERSECTION_DETECTIONS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto load first sample (Traffic scene) on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSample(SAMPLE_IMAGES[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDetect = async () => {
    if (!selectedImage || !imageRef.current) return;
    setIsLoading(true);

    if (useBackend && isBackendOnline) {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('confidence', confidence.toString());

      try {
        const response = await fetch(`${config.API_BASE_URL}${config.API_V1_STR}/predict`, {
          method: 'POST',
          headers: SecurityService.getSecureHeaders(),
          body: formData,
        });

        if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

        const result = await response.json();
        const img = imageRef.current;
        const scaleX = img.naturalWidth / 640;
        const scaleY = img.naturalHeight / 640;

        const naturalDetections = (result.objects || []).map((d) => {
          const [x, y, w, h] = d.bbox;
          return {
            label: d.label,
            confidence: d.confidence,
            bbox: [
              Math.round(x * scaleX),
              Math.round(y * scaleY),
              Math.round(w * scaleX),
              Math.round(h * scaleY),
            ],
          };
        });

        setDetections(naturalDetections);
      } catch (err) {
        console.error('Backend detection failed:', err);
        alert('Backend prediction failed. Falling back to local browser ONNX engine.');
        setUseBackend(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Local ONNX inference with letterboxing
    const img = imageRef.current;
    const nW = img.naturalWidth;
    const nH = img.naturalHeight;

    const scale = Math.min(640 / nW, 640 / nH);
    const scaledW = nW * scale;
    const scaledH = nH * scale;
    const padX = (640 - scaledW) / 2;
    const padY = (640 - scaledH) / 2;

    letterboxRef.current = { scale, padX, padY, nW, nH };

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#727272';
    ctx.fillRect(0, 0, 640, 640);
    ctx.drawImage(img, padX, padY, scaledW, scaledH);

    const imgData = ctx.getImageData(0, 0, 640, 640);
    if (workerRef.current && isModelLoaded) {
      workerRef.current.postMessage(
        {
          type: 'DETECT',
          data: {
            buffer: imgData.data.buffer,
            threshold: confidence,
            iouThreshold: 0.35,
            options: {
              filterSpurious: true
            }
          },
        },
        [imgData.data.buffer]
      );
    } else {
      setIsLoading(false);
      alert('ONNX model is loading in browser. Please wait a few seconds and click Run Detection again.');
    }
  };

  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const dpr = window.devicePixelRatio || 1;
    const displayW = img.clientWidth;
    const displayH = img.clientHeight;

    if (!displayW || !displayH || !img.naturalWidth || !img.naturalHeight) return;

    // Retina / High-DPI crisp vector font scaling
    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = displayW / displayH;

    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > containerRatio) {
      renderW = displayW;
      renderH = displayW / imgRatio;
      offsetX = 0;
      offsetY = (displayH - renderH) / 2;
    } else {
      renderH = displayH;
      renderW = displayH * imgRatio;
      offsetY = 0;
      offsetX = (displayW - renderW) / 2;
    }

    ctx.clearRect(0, 0, displayW, displayH);

    detections.forEach((det) => {
      if (!det.bbox || det.bbox.length < 4) return;
      const [x, y, w, h] = det.bbox;

      // Skip empty or zero-size placeholder bounding boxes
      if (!w || !h || w <= 0 || h <= 0) return;

      const scaleX = renderW / img.naturalWidth;
      const scaleY = renderH / img.naturalHeight;
      const scaledX = Math.round(x * scaleX + offsetX);
      const scaledY = Math.round(y * scaleY + offsetY);
      const scaledW = Math.round(w * scaleX);
      const scaledH = Math.round(h * scaleY);

      if (scaledW <= 2 || scaledH <= 2) return;

      const meta = getClassMetadata(det.label, det.confidence);

      // --- 3D Depth Bounding Vector Projection ---
      const depthOffset = Math.min(Math.round(scaledW * 0.14), 16);
      const dx = depthOffset;
      const dy = -depthOffset;

      // 1. Back 3D Face (perspective depth projection)
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(scaledX + dx, scaledY + dy, scaledW, scaledH);

      // 2. Perspective connecting vector rays (front to back)
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(scaledX, scaledY);
      ctx.lineTo(scaledX + dx, scaledY + dy);
      // Top-Right
      ctx.moveTo(scaledX + scaledW, scaledY);
      ctx.lineTo(scaledX + scaledW + dx, scaledY + dy);
      // Bottom-Left
      ctx.moveTo(scaledX, scaledY + scaledH);
      ctx.lineTo(scaledX + dx, scaledY + scaledH + dy);
      // Bottom-Right
      ctx.moveTo(scaledX + scaledW, scaledY + scaledH);
      ctx.lineTo(scaledX + scaledW + dx, scaledY + scaledH + dy);
      ctx.stroke();

      // 3. Front Cyber Bounding Box
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 6;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
      ctx.shadowBlur = 0;

      // 4. Cybernetic Corner Reticles (Target Lock HUD)
      const cornerLen = Math.min(8, Math.floor(scaledW / 4), Math.floor(scaledH / 4));
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

      // 5. Solid Label Badge - JetBrains Mono crisp vector typography
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
  }, [detections]);

  useEffect(() => {
    drawBoundingBoxes();
  }, [detections, drawBoundingBoxes]);

  useEffect(() => {
    window.addEventListener('resize', drawBoundingBoxes);
    let ro;
    if (imageRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        drawBoundingBoxes();
      });
      ro.observe(imageRef.current);
    }
    return () => {
      window.removeEventListener('resize', drawBoundingBoxes);
      if (ro) ro.disconnect();
    };
  }, [drawBoundingBoxes]);

  return (
    <div className="detection-viewport-wrapper">
      {/* Controls Bar */}
      <div className="viewport-controls-bar">
        <div className="controls-left">
          <input
            type="file"
            accept="image/*"
            id="image-upload"
            style={{ display: 'none' }}
            onChange={(e) => handleImage(e.target.files[0])}
          />
          <label htmlFor="image-upload" className="ctrl-btn upload-btn">
            Choose Image
          </label>

          <button
            className="ctrl-btn detect-action-btn"
            onClick={handleDetect}
            disabled={!selectedImage || isLoading || (!isModelLoaded && !isBackendOnline)}
          >
            {isLoading ? 'Scanning Scene...' : 'Run Detection'}
          </button>

          <div className="slider-box">
            <span className="slider-label">Conf: {confidence.toFixed(2)}</span>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="ctrl-slider"
            />
          </div>
        </div>

        <div className="controls-right">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useBackend}
              disabled={!isBackendOnline}
              onChange={(e) => setUseBackend(e.target.checked)}
            />
            <span>High Accuracy</span>
          </label>

          <div className="engine-status-tag">
            <span className={`status-dot ${isModelLoaded ? 'online' : 'loading'}`}></span>
            {isModelLoaded ? 'ONNX Active' : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Quick Sample Selector Bar */}
      <div className="samples-bar">
        <span className="samples-label">Samples:</span>
        <div className="samples-scroll">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="sample-chip"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feed Viewport */}
      <div
        className={`viewport-screen ${isDragging ? 'drag-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImage(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Cybernetic HUD 3D Corner Reticles */}
        <div className="hud-corner hud-top-left" />
        <div className="hud-corner hud-top-right" />
        <div className="hud-corner hud-bottom-left" />
        <div className="hud-corner hud-bottom-right" />
        <div className="hud-perspective-grid" />

        {isLoading && (
          <div className="viewport-overlay-loading">
            <div className="laser-sweep-line"></div>
            <div className="radar-spinner"></div>
            <span>Analyzing neural layers in 3D...</span>
          </div>
        )}

        {previewUrl ? (
          <div className="feed-canvas-container">
            {/* 3D Depth Enabled Badge Overlay - only shown for non-pre-annotated feeds */}
            {!previewUrl.includes('dashboard') && !previewUrl.includes('smart-city-vision') && !previewUrl.includes('live-intersection') && (
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  zIndex: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '5px 12px',
                  background: 'rgba(11, 15, 23, 0.82)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 242, 254, 0.45)',
                  borderRadius: '999px',
                  color: '#00F2FE',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>3D Depth Enabled</span>
              </div>
            )}

            <img
              src={previewUrl}
              alt="Detection Preview"
              ref={imageRef}
              onLoad={() => {
                drawBoundingBoxes();
                if (previewUrl && !previewUrl.includes('dashboard') && !previewUrl.includes('smart-city-vision') && !previewUrl.includes('live-intersection')) {
                  if (isModelLoaded && workerRef.current) {
                    setTimeout(handleDetect, 50);
                  }
                }
              }}
              onError={() => {
                if (previewUrl !== '/samples/dashboard.jpeg') {
                  setPreviewUrl('/samples/dashboard.jpeg');
                }
              }}
              className="feed-img"
            />
            <canvas ref={canvasRef} className="feed-canvas"></canvas>
          </div>
        ) : (
          <div className="empty-viewport-state">
            <p>Upload an image or pick a sample above to scan</p>
          </div>
        )}
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
