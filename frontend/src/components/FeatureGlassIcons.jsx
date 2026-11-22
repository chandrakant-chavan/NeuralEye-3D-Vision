/**
 * High-definition 3D Glassmorphic Feature Icons
 * Crafted to match user-provided 3D glassmorphic reference assets:
 * - Icon3DVision: Isometric 3D faceted crystal cube with top specular reflection
 * - IconWebAssembly: High-density microchip with 12 perimeter pins and silicon core
 * - IconEdgeAI: Dual-layer emerald crest shield with glossy white inner emblem
 * - IconAnalytics: Ascending 3-pillar volume chart with soaring dynamic trend arrow
 */

export function Icon3DVision({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`glass-3d-svg icon-3d-cube ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Soft isometric drop shadow */}
        <filter id="cubeDropShadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#6d28d9" floodOpacity="0.32" />
        </filter>
        {/* Top Facet Gradient */}
        <linearGradient id="cubeTopGrad" x1="8" y1="7" x2="40" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        {/* Top Glossy Diamond Highlight */}
        <linearGradient id="cubeHighlightGrad" x1="14" y1="11" x2="34" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="65%" stopColor="#f3e8ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0.6" />
        </linearGradient>
        {/* Left Facet Gradient (Shadow side) */}
        <linearGradient id="cubeLeftGrad" x1="8" y1="16" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        {/* Right Facet Gradient (Lit side) */}
        <linearGradient id="cubeRightGrad" x1="24" y1="16" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
      </defs>

      {/* Ground ambient reflection */}
      <ellipse cx="24" cy="43.5" rx="14" ry="3" fill="rgba(109, 40, 217, 0.22)" filter="blur(2.5px)" />

      <g filter="url(#cubeDropShadow)">
        {/* Left Face */}
        <path
          d="M 8.5 16.5 L 24 25.2 V 41.5 L 8.5 32.8 Z"
          fill="url(#cubeLeftGrad)"
          stroke="#581c87"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Right Face */}
        <path
          d="M 24 25.2 L 39.5 16.5 V 32.8 L 24 41.5 Z"
          fill="url(#cubeRightGrad)"
          stroke="#6b21a8"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Top Face */}
        <path
          d="M 24 7.5 L 39.5 16.5 L 24 25.2 L 8.5 16.5 Z"
          fill="url(#cubeTopGrad)"
          stroke="#e9d5ff"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Inset White Glass Facet on Top (Matches user reference image exactly) */}
        <path
          d="M 24 11.2 L 34.2 16.5 L 24 21.8 L 13.8 16.5 Z"
          fill="url(#cubeHighlightGrad)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Specular Ridge Highlights */}
        <path
          d="M 24 7.5 L 24 25.2"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M 24 25.2 L 24 41.5"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function IconWebAssembly({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`glass-3d-svg icon-wasm-chip ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="wasmChipDropShadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#1d4ed8" floodOpacity="0.34" />
        </filter>
        {/* Chip Body Gradient */}
        <linearGradient id="chipBodyGrad" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        {/* Metal Pins Gradient */}
        <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        {/* Silicon Core Background Gradient */}
        <linearGradient id="siliconCoreGrad" x1="16.5" y1="16.5" x2="31.5" y2="31.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>

      {/* Ground ambient reflection */}
      <ellipse cx="24" cy="43.5" rx="14" ry="2.8" fill="rgba(37, 99, 235, 0.22)" filter="blur(2.5px)" />

      <g filter="url(#wasmChipDropShadow)">
        {/* Top Pins (3 rounded pins) */}
        <rect x="15.8" y="5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />
        <rect x="22.3" y="5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />
        <rect x="28.8" y="5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />

        {/* Bottom Pins (3 rounded pins) */}
        <rect x="15.8" y="36.5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />
        <rect x="22.3" y="36.5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />
        <rect x="28.8" y="36.5" width="3.4" height="6.5" rx="1.7" fill="url(#pinGrad)" />

        {/* Left Pins (3 rounded pins) */}
        <rect x="5" y="15.8" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />
        <rect x="5" y="22.3" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />
        <rect x="5" y="28.8" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />

        {/* Right Pins (3 rounded pins) */}
        <rect x="36.5" y="15.8" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />
        <rect x="36.5" y="22.3" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />
        <rect x="36.5" y="28.8" width="6.5" height="3.4" rx="1.7" fill="url(#pinGrad)" />

        {/* Main Chip Body */}
        <rect
          x="10"
          y="10"
          width="28"
          height="28"
          rx="7"
          fill="url(#chipBodyGrad)"
          stroke="#93c5fd"
          strokeWidth="0.8"
        />

        {/* Specular Top-Edge Sheen */}
        <path
          d="M 14.5 11.5 H 33.5"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Inner Silicon Die / Core */}
        <rect
          x="16.5"
          y="16.5"
          width="15"
          height="15"
          rx="4"
          fill="url(#siliconCoreGrad)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="0.8"
        />

        {/* Stylized Micro-Engine / CPU Core Emblem */}
        <path
          d="M 21.5 21 C 21.5 19.8 22.4 19 23.5 19 H 24.5 C 25.6 19 26.5 19.8 26.5 21 V 23 C 26.5 24.2 25.6 25 24.5 25 H 23.5 C 22.4 25 21.5 24.2 21.5 23 Z"
          fill="#1d4ed8"
        />
        <circle cx="24" cy="22" r="1.4" fill="#ffffff" />
        {/* Core nodes */}
        <rect x="23" y="26" width="2" height="2" rx="0.5" fill="#1d4ed8" />
        <rect x="18.5" y="22" width="1.8" height="1.8" rx="0.4" fill="#1d4ed8" />
        <rect x="27.7" y="22" width="1.8" height="1.8" rx="0.4" fill="#1d4ed8" />
      </g>
    </svg>
  );
}

export function IconEdgeAI({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`glass-3d-svg icon-edge-shield ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="shieldDropShadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#047857" floodOpacity="0.32" />
        </filter>
        {/* Outer Emerald Shield Gradient */}
        <linearGradient id="shieldEmeraldGrad" x1="7" y1="6.5" x2="41" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        {/* Inner White Shield Gradient */}
        <linearGradient id="innerWhiteShieldGrad" x1="13" y1="13" x2="35" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
      </defs>

      {/* Ground ambient reflection */}
      <ellipse cx="24" cy="43.5" rx="14" ry="2.8" fill="rgba(5, 150, 105, 0.22)" filter="blur(2.5px)" />

      <g filter="url(#shieldDropShadow)">
        {/* Outer Shield Body */}
        <path
          d="M 24 6.5 C 33 6.5, 40 8.8, 41 12.8 C 41 26.5, 33 37.2, 24 41.5 C 15 37.2, 7 26.5, 7 12.8 C 8 8.8, 15 6.5, 24 6.5 Z"
          fill="url(#shieldEmeraldGrad)"
          stroke="#6ee7b7"
          strokeWidth="0.8"
        />

        {/* Specular Curved Arch Highlight */}
        <path
          d="M 12 11.5 C 17 8.8, 31 8.8, 36 11.5"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Inner Solid White Shield Crest (Matches user reference image exactly) */}
        <path
          d="M 24 13.5 C 30 13.5, 34 15.2, 34.8 18 C 34.8 27.2, 29 33.8, 24 36.8 C 19 33.8, 13.2 27.2, 13.2 18 C 14 15.2, 18 13.5, 24 13.5 Z"
          fill="url(#innerWhiteShieldGrad)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
}

export function IconAnalytics({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`glass-3d-svg icon-analytics-bars ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="analyticsDropShadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#6d28d9" floodOpacity="0.32" />
        </filter>
        {/* Bars Gradient */}
        <linearGradient id="analyticsBarsGrad" x1="10" y1="12" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        {/* Dynamic Trend Arrow Gradient */}
        <linearGradient id="analyticsArrowGrad" x1="8" y1="8" x2="38" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Ground ambient reflection */}
      <ellipse cx="24" cy="43.5" rx="14" ry="2.8" fill="rgba(109, 40, 217, 0.22)" filter="blur(2.5px)" />

      <g filter="url(#analyticsDropShadow)">
        {/* Bar 1 (Left - Shortest) */}
        <rect x="9.5" y="27" width="7" height="15" rx="3.5" fill="url(#analyticsBarsGrad)" />

        {/* Bar 2 (Middle - Medium) */}
        <rect x="20.5" y="20" width="7" height="22" rx="3.5" fill="url(#analyticsBarsGrad)" />

        {/* Bar 3 (Right - Tallest) */}
        <rect x="31.5" y="14" width="7" height="28" rx="3.5" fill="url(#analyticsBarsGrad)" />

        {/* Ascending Trend Line (Matches user reference image exactly) */}
        <path
          d="M 9 26 C 13.5 23.5, 16 19, 21.5 18 C 26 17, 28 14.5, 34.5 8.5"
          stroke="url(#analyticsArrowGrad)"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bold Arrowhead pointing to top-right */}
        <path
          d="M 27 7.5 H 35.8 V 16.2"
          stroke="url(#analyticsArrowGrad)"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
