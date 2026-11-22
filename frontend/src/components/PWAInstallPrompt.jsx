import { useState, useEffect } from 'react';
import { Download, X, Share2, Sparkles } from 'lucide-react';

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
      // Slight delay so the user first sees the loaded page smoothly
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
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
      }, 4000);
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
      className="pwa-install-banner fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[9999] animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl transition-all">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden shadow-md border border-white/30 dark:border-slate-700 bg-gradient-to-br from-blue-600 to-indigo-700 p-1 flex items-center justify-center">
            <img 
              src="/neuraleye-icon.png" 
              alt="NeuralEye App Icon" 
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Install NeuralEye
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-2.5 h-2.5" /> App
              </span>
            </div>
            
            {showPrompt && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                Install on your device for instant fullscreen access and zero cloud latency.
              </p>
            )}

            {showIOSTip && isIOS && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                Tap <Share2 className="w-3 h-3 inline mx-0.5 text-blue-500" /> <strong>Share</strong> and select <strong>&quot;Add to Home Screen&quot;</strong> to install.
              </p>
            )}

            {/* Actions */}
            {showPrompt && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Install App
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Not now
                </button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
