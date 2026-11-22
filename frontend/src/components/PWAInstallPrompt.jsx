import { useState, useEffect } from 'react';
import { Download, X, Share2, Sparkles, Shield, Cpu, MoreVertical, PlusSquare, Smartphone, Check } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Derive device platforms directly without effect setState
  const ua = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
  const isIOS = /iphone|ipad|ipod/.test(ua);

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // 3. Native beforeinstallprompt handler (fires on HTTPS & localhost in Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-show prompt after 2 seconds
      setTimeout(() => {
        const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
        if (!isDismissed) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Fallback for mobile devices (including HTTP IP local testing & iOS Safari where beforeinstallprompt doesn't fire)
    const fallbackTimer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed && !isStandalone) {
        setShowPrompt(true);
      }
    }, 2500);

    // 5. Global listener so navbar or any button can open the install prompt anytime
    const handleManualOpen = () => {
      setShowPrompt(true);
      if (!deferredPrompt) {
        setShowManualModal(true);
      }
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.debug('[PWA] Native prompt error, showing manual steps:', err);
        setShowManualModal(true);
      }
    } else {
      // On iOS Safari, or on local HTTP IP testing where browser blocks native prompt
      setShowManualModal(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
    setShowManualModal(false);
  };

  if (!showPrompt && !showManualModal) return null;

  return (
    <>
      {/* 1. Sleek Floating Install Banner */}
      {showPrompt && !showManualModal && (
        <aside 
          aria-label="Install NeuralEye App"
          className="pwa-install-banner"
        >
          <div className="pwa-card-glass">
            {/* Ambient Aura Glow */}
            <div className="pwa-aura-glow" />

            {/* Top Header Row */}
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
                  Install on your phone for instant fullscreen access and zero cloud latency.
                </p>
              </div>

              {/* Clean circular close button */}
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
              <button
                type="button"
                onClick={handleInstallClick}
                className="pwa-install-btn"
              >
                <Download size={15} />
                <span>Install App</span>
              </button>

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
      )}

      {/* 2. Step-by-Step Installation Modal (When native 1-click is restricted by browser) */}
      {showManualModal && (
        <div 
          className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowManualModal(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl border border-white/20 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Accent Glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-1 flex items-center justify-center shadow-md">
                  <img src="/neuraleye-icon.png" alt="NeuralEye" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Install NeuralEye <Sparkles size={13} className="text-blue-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add to your Phone Home Screen</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Instruction Steps based on device */}
            <div className="space-y-3 my-5">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">1</span>
                    <div className="text-xs leading-relaxed">
                      Tap the <Share2 size={13} className="inline mx-1 text-blue-500" /> <strong>Share</strong> button at the bottom of Safari.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">2</span>
                    <div className="text-xs leading-relaxed">
                      Scroll down and tap <PlusSquare size={13} className="inline mx-1 text-indigo-500" /> <strong>&quot;Add to Home Screen&quot;</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">3</span>
                    <div className="text-xs leading-relaxed">
                      Tap <strong>&quot;Add&quot;</strong> at the top right corner. The app icon will appear on your screen!
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">1</span>
                    <div className="text-xs leading-relaxed">
                      Tap the browser menu <MoreVertical size={13} className="inline mx-1 text-blue-500" /> <strong>(Three Dots)</strong> at top-right.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">2</span>
                    <div className="text-xs leading-relaxed">
                      Tap <Smartphone size={13} className="inline mx-1 text-indigo-500" /> <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">3</span>
                    <div className="text-xs leading-relaxed">
                      Confirm <strong>&quot;Install&quot;</strong>. NeuralEye 3D Vision will be installed as a fullscreen app!
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Got It Button */}
            <button
              type="button"
              onClick={() => { setShowManualModal(false); setShowPrompt(false); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} /> Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
