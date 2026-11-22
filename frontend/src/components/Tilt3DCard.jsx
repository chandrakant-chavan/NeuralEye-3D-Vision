import { useRef, useState } from 'react';

export default function Tilt3DCard({ children, className = '', style = {}, maxTilt = 6 }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
      glareX,
      glareY,
      glareOpacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-3d-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: tiltStyle.transform,
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Specular 3D glare reflection overlay */}
      <div
        className="tilt-3d-glare"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${tiltStyle.glareX}% ${tiltStyle.glareY}%, rgba(0, 242, 254, ${tiltStyle.glareOpacity}) 0%, transparent 65%)`,
          transition: 'opacity 0.25s ease',
          zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </div>
  );
}
