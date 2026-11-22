import { useRef, useEffect } from 'react';

/**
 * Neural3DScene: "God's Eye" 3D Earth Reconnaissance & Planetary Sensor Grid
 * Designed for borderless, organic presentation matching minimalist luxury AI landing pages (e.g. EON reference).
 * Renders transparently with no bounding boxes, borders, or outer framing.
 */
export default function Neural3DScene({ width = '100%', height = 440, interactive = true }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let isMounted = true;

    // Handle High DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dynamic globe sizing based on canvas bounds
    const getGlobeRadius = () => {
      const rect = canvas.getBoundingClientRect();
      return Math.min(rect.width, rect.height) * 0.27;
    };

    // Latitude & Longitude grid rings
    const latitudeBands = 8;
    const longitudeBands = 14;

    const latRings = [];
    for (let i = 1; i < latitudeBands; i++) {
      const phi = (i / latitudeBands) * Math.PI;
      const ring = [];
      const steps = 36;
      for (let j = 0; j <= steps; j++) {
        const theta = (j / steps) * 2 * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        ring.push([x, y, z]);
      }
      latRings.push(ring);
    }

    const lonRings = [];
    for (let i = 0; i < longitudeBands; i++) {
      const theta = (i / longitudeBands) * 2 * Math.PI;
      const ring = [];
      const steps = 36;
      for (let j = 0; j <= steps; j++) {
        const phi = (j / steps) * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        ring.push([x, y, z]);
      }
      lonRings.push(ring);
    }

    // Continents / Landmass Point Cloud
    const rawLandmass = [
      { lat: 40, lon: -100, span: 22 }, { lat: 50, lon: -115, span: 18 }, { lat: 32, lon: -90, span: 16 }, { lat: 60, lon: -140, span: 15 },
      { lat: -15, lon: -60, span: 18 }, { lat: -30, lon: -65, span: 14 }, { lat: 2, lon: -70, span: 12 },
      { lat: 50, lon: 10, span: 16 }, { lat: 60, lon: 25, span: 14 }, { lat: 42, lon: 15, span: 12 },
      { lat: 8, lon: 20, span: 20 }, { lat: -20, lon: 25, span: 18 }, { lat: 25, lon: 10, span: 18 },
      { lat: 35, lon: 100, span: 26 }, { lat: 55, lon: 85, span: 24 }, { lat: 22, lon: 78, span: 18 }, { lat: 45, lon: 130, span: 16 }, { lat: 15, lon: 105, span: 14 },
      { lat: -25, lon: 135, span: 16 }, { lat: -32, lon: 145, span: 12 }
    ];

    const landDots = [];
    rawLandmass.forEach(region => {
      const count = 18;
      for (let k = 0; k < count; k++) {
        const lat = (region.lat + (Math.random() - 0.5) * region.span) * (Math.PI / 180);
        const lon = (region.lon + (Math.random() - 0.5) * region.span) * (Math.PI / 180);
        landDots.push({
          x: Math.cos(lat) * Math.cos(lon),
          y: Math.sin(lat),
          z: Math.cos(lat) * Math.sin(lon)
        });
      }
    });

    // Detected Tactical Objects
    const detectedObjects = [
      { lat: 38, lon: -77, label: 'MIL_CONVOY', conf: '98.7%', type: 'GROUND', code: 'T-01' },
      { lat: 51, lon: 0, label: 'AIR_CARRIER', conf: '99.2%', type: 'VESSEL', code: 'T-02' },
      { lat: 35, lon: 139, label: 'DRONE_SURV', conf: '96.5%', type: 'AERIAL', code: 'T-03' },
      { lat: 25, lon: 55, label: 'DEF_RADAR', conf: '94.8%', type: 'INSTALL', code: 'T-04' },
      { lat: -33, lon: 151, label: 'NAVAL_GRP', conf: '97.1%', type: 'VESSEL', code: 'T-05' },
      { lat: 28, lon: 77, label: 'HYPERSENSOR', conf: '99.5%', type: 'INTEL', code: 'T-06' },
      { lat: -22, lon: -43, label: 'ORBIT_UPLINK', conf: '93.4%', type: 'GROUND', code: 'T-07' }
    ];

    const targets = detectedObjects.map(obj => {
      const lat = obj.lat * (Math.PI / 180);
      const lon = obj.lon * (Math.PI / 180);
      return {
        ...obj,
        origX: Math.cos(lat) * Math.cos(lon),
        origY: Math.sin(lat),
        origZ: Math.cos(lat) * Math.sin(lon),
        pingRadius: 0,
        pingAlpha: 1.0
      };
    });

    // Ambient floating dust particles (EON aesthetic)
    const particleCount = 130;
    const particles = Array.from({ length: particleCount }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      distFactor: 1.1 + Math.random() * 1.1,
      speed: 0.001 + Math.random() * 0.0025,
      yOffset: (Math.random() - 0.5) * 40,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.5 + 0.2
    }));

    let rotY = 0;
    let rotX = 0.22;
    let satelliteAngle = 0;
    let radarSweep = 0;

    const render = (time) => {
      if (!isMounted) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const globeRadius = getGlobeRadius();

      // Clear transparently
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse interaction
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      rotY += 0.007 + mouseRef.current.x * 0.00012;
      rotX = 0.22 + mouseRef.current.y * 0.00018;
      satelliteAngle += 0.018;
      radarSweep += 0.035;

      // 3D Perspective Projection
      const fov = 380;
      const distance = 300;

      const project = (x, y, z) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = fov / (distance + z2);
        return {
          x: cx + x1 * scale,
          y: cy - y2 * scale,
          scale,
          z: z2,
          isFront: z2 > -15
        };
      };

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // --- 1. Organic Undulating Ripple Rings (EON Style) ---
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const baseR = globeRadius * (1.32 + r * 0.28);
        const wavePhase = (time || 0) * 0.0016 + r * 1.3;
        ctx.beginPath();
        const steps = 72;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const undulation = Math.sin(theta * 5 + wavePhase) * (7 + r * 3) + Math.cos(theta * 3 - wavePhase * 0.7) * 4;
          const rad = baseR + undulation;
          const px = cx + Math.cos(theta) * rad;
          const py = cy + Math.sin(theta) * (rad * 0.94);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = isDark
          ? (r === 0 ? 'rgba(0, 242, 254, 0.22)' : r === 1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)')
          : (r === 0 ? 'rgba(2, 132, 199, 0.32)' : r === 1 ? 'rgba(59, 130, 246, 0.22)' : 'rgba(99, 102, 241, 0.15)');
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // --- 2. Floating Ambient Particle Dust ---
      particles.forEach(p => {
        p.angle += p.speed;
        const currentR = globeRadius * p.distFactor;
        const px = cx + Math.cos(p.angle) * currentR;
        const py = cy + Math.sin(p.angle) * (currentR * 0.9) + p.yOffset;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#00F2FE' : '#0284C7';
        ctx.globalAlpha = isDark ? p.alpha : Math.min(1.0, p.alpha * 1.3);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // --- 3. Atmosphere Glowing Corona & Earth Silhouette Disc ---
      const earthProj = project(0, 0, 0);
      const scaledRadius = globeRadius * earthProj.scale;

      const atmosphereGrad = ctx.createRadialGradient(
        earthProj.x, earthProj.y, scaledRadius * 0.8,
        earthProj.x, earthProj.y, scaledRadius * 1.45
      );
      if (isDark) {
        atmosphereGrad.addColorStop(0, 'rgba(0, 242, 254, 0.32)');
        atmosphereGrad.addColorStop(0.45, 'rgba(37, 99, 235, 0.18)');
        atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        atmosphereGrad.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
        atmosphereGrad.addColorStop(0.45, 'rgba(37, 99, 235, 0.14)');
        atmosphereGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.beginPath();
      ctx.arc(earthProj.x, earthProj.y, scaledRadius * 1.45, 0, Math.PI * 2);
      ctx.fillStyle = atmosphereGrad;
      ctx.fill();

      // Earth Body Occlusion Disc
      ctx.beginPath();
      ctx.arc(earthProj.x, earthProj.y, scaledRadius, 0, Math.PI * 2);
      if (isDark) {
        ctx.fillStyle = '#070D18';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else {
        const earthGrad = ctx.createRadialGradient(
          earthProj.x - scaledRadius * 0.25, earthProj.y - scaledRadius * 0.25, scaledRadius * 0.1,
          earthProj.x, earthProj.y, scaledRadius
        );
        earthGrad.addColorStop(0, '#2563EB');
        earthGrad.addColorStop(0.65, '#1D4ED8');
        earthGrad.addColorStop(1, '#1E3A8A');
        ctx.fillStyle = earthGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // --- 4. 3D Wireframe Longitude & Latitude Rings ---
      const drawRing = (ringPoints, color, width) => {
        ctx.beginPath();
        let first = true;
        ringPoints.forEach(pt => {
          const proj = project(pt[0] * globeRadius, pt[1] * globeRadius, pt[2] * globeRadius);
          if (proj.isFront) {
            if (first) {
              ctx.moveTo(proj.x, proj.y);
              first = false;
            } else {
              ctx.lineTo(proj.x, proj.y);
            }
          } else {
            first = true;
          }
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      };

      const ringColor = isDark ? 'rgba(0, 242, 254, 0.16)' : 'rgba(255, 255, 255, 0.35)';
      latRings.forEach(ring => drawRing(ring, ringColor, 1));
      lonRings.forEach(ring => drawRing(ring, ringColor, 1));

      // --- 5. Continents / Landmass Points ---
      landDots.forEach(d => {
        const proj = project(d.x * globeRadius, d.y * globeRadius, d.z * globeRadius);
        if (proj.isFront) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 1.3 * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#00F2FE' : '#93C5FD';
          ctx.globalAlpha = Math.min(0.95, Math.max(0.2, (proj.z + globeRadius) / (2 * globeRadius)));
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // --- 6. Polar Satellite Orbit Path & Satellite Unit ---
      const orbitRadius = globeRadius * 1.55;
      const orbitSteps = 50;
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      for (let i = 0; i <= orbitSteps; i++) {
        const ang = (i / orbitSteps) * Math.PI * 2;
        const ox = Math.cos(ang) * orbitRadius;
        const oy = Math.sin(ang) * (orbitRadius * 0.42);
        const oz = Math.sin(ang) * (orbitRadius * 0.85);

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = oy * cosX - oz * sinX;
        const z2 = oy * sinX + oz * cosX;
        const scale = fov / (distance + z2);
        const sx = cx + ox * scale;
        const sy = cy - y2 * scale;

        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite Position
      const satX = Math.cos(satelliteAngle) * orbitRadius;
      const satY = Math.sin(satelliteAngle) * (orbitRadius * 0.42);
      const satZ = Math.sin(satelliteAngle) * (orbitRadius * 0.85);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const sY2 = satY * cosX - satZ * sinX;
      const sZ2 = satY * sinX + satZ * cosX;
      const sScale = fov / (distance + sZ2);
      const sPx = cx + satX * sScale;
      const sPy = cy - sY2 * sScale;

      // Draw Satellite Icon
      ctx.beginPath();
      ctx.arc(sPx, sPy, 3.5 * sScale, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Satellite Scanning Laser Ray to Earth Surface
      ctx.beginPath();
      ctx.moveTo(sPx, sPy);
      ctx.lineTo(earthProj.x + (sPx - earthProj.x) * 0.55, earthProj.y + (sPy - earthProj.y) * 0.55);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // --- 7. Detected Surface Objects with Coordinates & Tactical Brackets ---
      targets.forEach(t => {
        const proj = project(t.origX * globeRadius, t.origY * globeRadius, t.origZ * globeRadius);
        if (proj.isFront) {
          // Sonar Ping Ring
          t.pingRadius += 0.45;
          t.pingAlpha -= 0.015;
          if (t.pingRadius > 14) {
            t.pingRadius = 0;
            t.pingAlpha = 1.0;
          }

          ctx.beginPath();
          ctx.arc(proj.x, proj.y, t.pingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(0, 242, 254, ${Math.max(0, t.pingAlpha)})`
            : `rgba(255, 255, 255, ${Math.max(0, t.pingAlpha * 0.95)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Target Center Dot (High-contrast luminous)
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 2.8 * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#00F2FE' : '#FFFFFF';
          ctx.fill();
          if (!isDark) {
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Cybernetic Mini Brackets [ ]
          const bs = 6.5 * proj.scale;
          ctx.strokeStyle = isDark ? 'rgba(0, 242, 254, 0.9)' : 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 1.4;
          // Left bracket [
          ctx.beginPath();
          ctx.moveTo(proj.x - bs, proj.y - bs);
          ctx.lineTo(proj.x - bs - 2.5, proj.y - bs);
          ctx.lineTo(proj.x - bs - 2.5, proj.y + bs);
          ctx.lineTo(proj.x - bs, proj.y + bs);
          ctx.stroke();
          // Right bracket ]
          ctx.beginPath();
          ctx.moveTo(proj.x + bs, proj.y - bs);
          ctx.lineTo(proj.x + bs + 2.5, proj.y - bs);
          ctx.lineTo(proj.x + bs + 2.5, proj.y + bs);
          ctx.lineTo(proj.x + bs, proj.y + bs);
          ctx.stroke();

          // Tactical HUD Pill Badge for 100% Crisp Legibility in Both Modes
          const codeText = `[${t.code}:${t.label}]`;
          const confText = `CONF: ${t.conf}`;

          ctx.font = '700 10.5px "JetBrains Mono", monospace';
          const wCode = ctx.measureText(codeText).width;
          ctx.font = '700 9.5px "JetBrains Mono", monospace';
          const wConf = ctx.measureText(confText).width;

          const boxW = Math.max(wCode, wConf) + 14;
          const boxH = 28;

          // Boundary-safe placement: flip left if near right canvas edge
          const placeLeft = (proj.x + bs + 8 + boxW > w - 8);
          const boxX = placeLeft ? (proj.x - bs - boxW - 8) : (proj.x + bs + 8);
          const boxY = Math.max(8, Math.min(h - boxH - 8, proj.y - boxH / 2));

          // Hairline connecting bracket to HUD pill
          ctx.beginPath();
          ctx.moveTo(placeLeft ? (proj.x - bs - 2.5) : (proj.x + bs + 2.5), proj.y);
          ctx.lineTo(placeLeft ? (boxX + boxW) : boxX, boxY + boxH / 2);
          ctx.strokeStyle = isDark ? 'rgba(0, 242, 254, 0.6)' : 'rgba(2, 132, 199, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Pill Background with Depth Shadow
          ctx.save();
          if (isDark) {
            ctx.fillStyle = 'rgba(7, 13, 24, 0.92)';
            ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
            ctx.shadowColor = 'rgba(0, 242, 254, 0.3)';
            ctx.shadowBlur = 8;
          } else {
            // High-contrast solid white pill for total legibility on blue globe
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
            ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
          }
          ctx.lineWidth = 1.2;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 5);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
          }
          ctx.restore();

          // Left indicator strip
          ctx.fillStyle = isDark ? '#00F2FE' : '#0284C7';
          ctx.fillRect(boxX, boxY, 3, boxH);

          // Line 1: Target Code & Label
          ctx.textBaseline = 'top';
          ctx.font = '700 10.5px "JetBrains Mono", monospace';
          ctx.fillStyle = isDark ? '#00F2FE' : '#020617';
          ctx.fillText(codeText, boxX + 7, boxY + 3.5);

          // Line 2: Confidence
          ctx.font = '700 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = isDark ? '#10B981' : '#047857';
          ctx.fillText(confText, boxX + 7, boxY + 15);
        }
      });

      // --- 8. 360° Radar Sweep Line ---
      const rx = earthProj.x + Math.cos(radarSweep) * scaledRadius;
      const ry = earthProj.y + Math.sin(radarSweep) * scaledRadius;
      ctx.beginPath();
      ctx.moveTo(earthProj.x, earthProj.y);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = isDark ? 'rgba(0, 242, 254, 0.45)' : 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !interactive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.targetX = (e.clientX - rect.left) - rect.width / 2;
    mouseRef.current.targetY = (e.clientY - rect.top) - rect.height / 2;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  return (
    <div
      className="neural-3d-boxless"
      style={{
        position: 'relative',
        width,
        height,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        overflow: 'visible',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      />
    </div>
  );
}
