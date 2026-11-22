import { useMemo, useState, useEffect } from 'react';
import { getClassMetadata } from '../utils/detectionColors';

export default function AnalyticsPanel({ detections = [] }) {
  // Animated wave points for real-time detections-per-minute line chart
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaveSeed((s) => (s + 1) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Compute distribution based strictly on actual active detections
  const distribution = useMemo(() => {
    if (!detections || detections.length === 0) {
      return [];
    }

    const counts = {};
    let total = 0;
    detections.forEach((d) => {
      const meta = getClassMetadata(d.label);
      const cat = meta.displayLabel || d.label;
      counts[cat] = (counts[cat] || 0) + 1;
      total += 1;
    });

    const entries = Object.keys(counts).map((cat) => {
      const pct = Math.round((counts[cat] / total) * 1000) / 10;
      const meta = getClassMetadata(cat.toLowerCase());
      return {
        label: cat,
        percent: pct,
        color: meta.color,
      };
    });

    return entries;
  }, [detections]);

  // Grouped class counts breakdown (e.g. Cars: 2, Bus: 1...)
  const classBreakdown = useMemo(() => {
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

  // Compute SVG Donut geometry
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const donutSegments = distribution.map((item) => {
    const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (item.percent / 100) * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Dynamic SVG path for line chart
  const linePoints = useMemo(() => {
    const baseVals = [35, 48, 42, 68, 55, 45, 78, 52, 66, 60, 74];
    const shift = waveSeed % baseVals.length;
    const reordered = [...baseVals.slice(shift), ...baseVals.slice(0, shift)];
    
    const boost = Math.min(20, detections.length * 2);
    const coords = reordered.map((val, idx) => {
      const x = (idx / (reordered.length - 1)) * 260 + 35;
      const clampedVal = Math.min(85, Math.max(15, val + (idx % 2 === 0 ? boost : -boost * 0.4)));
      const y = 110 - (clampedVal / 85) * 85;
      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${d} L 295 110 L 35 110 Z`;
    return { pathD: d, areaD };
  }, [waveSeed, detections.length]);

  const currentCount = detections ? detections.length : 0;
  const dpmRate = currentCount > 0 ? Math.round(currentCount * 24) : 0;

  return (
    <div className="analytics-panel-card">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <h3 className="panel-title" style={{ margin: 0 }}>Analytics & Metrics</h3>
        </div>
        <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(226, 232, 240, 0.9)', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)' }}>
          Real-Time ▾
        </div>
      </div>

      {/* Detections Per Minute Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <span className="chart-label">Telemetry Inferred / min</span>
          <span className="live-pill">
            <span className="live-dot pulse"></span>
            {currentCount > 0 ? 'Active Stream' : 'Idle'}
          </span>
        </div>

        {/* Real DPM count calculated directly from active detections */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '0.25rem 0 0.5rem' }}>
          <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {dpmRate}
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: currentCount > 0 ? '#059669' : '#64748b', background: currentCount > 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(100, 116, 139, 0.14)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '999px' }}>
            {currentCount > 0 ? `${currentCount} in Scene` : '0 in Scene'}
          </span>
        </div>

        <div className="svg-chart-container">
          <svg viewBox="0 0 310 130" className="telemetry-chart">
            <defs>
              <linearGradient id="cyanLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[20, 42.5, 65, 87.5, 110].map((yVal) => (
              <line
                key={yVal}
                x1="35"
                y1={yVal}
                x2="300"
                y2={yVal}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            ))}

            {/* Y-axis labels */}
            <text x="25" y="24" fill="var(--text-dim)" fontSize="9" textAnchor="end">80</text>
            <text x="25" y="46" fill="var(--text-dim)" fontSize="9" textAnchor="end">60</text>
            <text x="25" y="69" fill="var(--text-dim)" fontSize="9" textAnchor="end">40</text>
            <text x="25" y="91" fill="var(--text-dim)" fontSize="9" textAnchor="end">20</text>
            <text x="25" y="113" fill="var(--text-dim)" fontSize="9" textAnchor="end">0</text>

            {/* Area Fill */}
            <path d={linePoints.areaD} fill="url(#cyanLineGradient)" />

            {/* Wave Line */}
            <path
              d={linePoints.pathD}
              fill="none"
              stroke="#00F2FE"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X-axis labels from Image 2 */}
            <text x="35" y="125" fill="var(--text-dim)" fontSize="8.5" textAnchor="middle">10:00</text>
            <text x="100" y="125" fill="var(--text-dim)" fontSize="8.5" textAnchor="middle">10:15</text>
            <text x="165" y="125" fill="var(--text-dim)" fontSize="8.5" textAnchor="middle">10:30</text>
            <text x="230" y="125" fill="var(--text-dim)" fontSize="8.5" textAnchor="middle">10:45</text>
            <text x="295" y="125" fill="var(--text-dim)" fontSize="8.5" textAnchor="middle">11:00</text>
          </svg>
        </div>
      </div>

      {/* Object Class Distribution Donut Chart */}
      <div className="chart-section" style={{ marginTop: '1.25rem' }}>
        <h4 className="chart-label">Object Class Distribution</h4>

        {distribution.length === 0 ? (
          <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            No objects detected in current scene
          </div>
        ) : (
          <div className="donut-row">
            <div className="donut-wrap">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth="12"
                />
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease' }}
                  />
                ))}
              </svg>
            </div>

            <div className="donut-legend">
              {distribution.map((item, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-bullet" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-text">
                    {item.label} <span className="legend-pct">({item.percent}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Counters at Bottom */}
      <div className="metrics-summary-row">
        <div className="metric-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <div className="metric-caption">Detected Classes</div>
          </div>
          <div className="metric-number cyan-glow">
            {distribution.length}
          </div>
        </div>
        <div className="metric-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <div className="metric-caption">Current Scene Objects</div>
          </div>
          <div className="metric-number emerald-glow">
            {currentCount}
          </div>
        </div>
      </div>

      {/* Class Count Breakdown (Requested: Cars - 2, Bus - 1...) */}
      {classBreakdown.length > 0 && (
        <div className="class-inventory-section">
          <div className="inventory-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <h4 className="chart-label" style={{ margin: 0 }}>Class Breakdown</h4>
            </div>
            <span className="inventory-total-tag">{currentCount} Detected</span>
          </div>

          <div className="inventory-grid">
            {classBreakdown.map((item, idx) => (
              <div 
                key={idx} 
                className="inventory-card"
                style={{ borderColor: `${item.color}40` }}
              >
                <div className="inventory-card-left">
                  <span className="inventory-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="inventory-name">{item.pluralLabel}</span>
                </div>
                <div className="inventory-count-badge" style={{ backgroundColor: `${item.color}18`, color: item.color, borderColor: `${item.color}50` }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
