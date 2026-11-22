import { useState, useEffect } from 'react';
import { Download, X, Share2, Sparkles, Shield, Cpu } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed prompt in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) {
      return;
    }

    // 3. Android / Chrome / Edge beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Display smoothly after page load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Safari detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = isAppleDevice && !/crios|fxios|optios/.test(userAgent) && !window.MSStream;

    if (isSafari && !isStandalone) {
      const timer = setTimeout(() => {
        setIsIOS(true);
        setShowIOSTip(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
    setShowIOSTip(false);
  };

  if (!showPrompt && !showIOSTip) return null;

  return (
    <aside 
      aria-label="Install NeuralEye App"
      className="pwa-install-banner"
    >
      <div className="pwa-card-glass">
        {/* Ambient Aura Glow */}
        <div className="pwa-aura-glow" />

        {/* Top Header Row: Icon + Title + Non-overlapping Close Button */}
        <div className="pwa-header-row">
          <div className="pwa-app-icon-wrap">
            <img 
              src="/neuraleye-icon.png" 
              alt="NeuralEye 3D Vision" 
              className="pwa-app-icon"
              onError={(e) => {
                e.target.src = '/apple-touch-icon.png';
              }}
            />
          </div>

          <div className="pwa-title-wrap">
            <div className="pwa-badge-row">
              <span className="pwa-app-title">NeuralEye</span>
              <span className="pwa-pill-badge">
                <Sparkles size={10} /> 3D VISION
              </span>
            </div>
            
            <p className="pwa-app-subtitle">
              {showPrompt 
                ? "Install on your device for instant fullscreen access and zero cloud latency." 
                : "Add to Home Screen for fast standalone app access."}
            </p>
          </div>

          {/* Clean circular close button with guaranteed clearance */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="pwa-close-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Feature Micro-Badges */}
        <div className="pwa-pills-row">
          <span className="pwa-micro-pill inline-flex items-center gap-1">
            <Cpu size={11} className="text-blue-500" /> 0.0ms WASM SIMD
          </span>
          <span className="pwa-micro-pill inline-flex items-center gap-1">
            <Shield size={11} className="text-emerald-500" /> 100% On-Device
          </span>
        </div>

        {/* Actions Row */}
        <div className="pwa-actions-row">
          {showPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="pwa-install-btn"
            >
              <Download size={15} />
              <span>Install App</span>
            </button>
          )}

          {showIOSTip && isIOS && (
            <div className="pwa-ios-instructions">
              Tap <Share2 size={13} className="inline mx-1 text-blue-500" /> then select <strong>&quot;Add to Home Screen&quot;</strong>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="pwa-dismiss-btn"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
