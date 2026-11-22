import './NeuralEyeLogo.css';

/**
 * Official NeuralEye 3D Vision Brand Logo Component
 * Automatically switches between Light Mode and Dark Mode assets,
 * and includes the "3D VISION" badge chip as requested.
 * 
 * @param {string} [props.size='default'] - 'header' | 'footer' | 'compact' | 'default'
 * @param {boolean} [props.showBadge=true] - Whether to show the 3D VISION badge
 * @param {string} [props.theme] - Optional explicit override: 'light' | 'dark'
 * @param {string} [props.className] - Additional CSS class names
 * @param {object} [props.style] - Inline styles
 */
export default function NeuralEyeLogo({
  size = 'default',
  showBadge = true,
  theme,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`neuraleye-brand-logo logo-${size} ${theme ? `theme-${theme}` : ''} ${className}`}
      style={style}
      aria-label="NeuralEye 3D Vision"
    >
      <img
        src="/neuraleye-logo-light.png"
        alt="NeuralEye"
        className="logo-img logo-img-light"
        width="2119"
        height="480"
        loading="eager"
      />
      <img
        src="/neuraleye-logo-dark.png"
        alt="NeuralEye"
        className="logo-img logo-img-dark"
        width="2042"
        height="480"
        loading="eager"
      />
      {showBadge && (
        <span className="brand-chip">3D VISION</span>
      )}
    </div>
  );
}
