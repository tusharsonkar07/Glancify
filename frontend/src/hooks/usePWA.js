import { useState, useEffect } from 'react';

/**
 * usePWA — captures the beforeinstallprompt event so we can
 * trigger it from our own Install button instead of the browser's default.
 *
 * Returns:
 *   installPrompt  — the deferred prompt object (null if already installed or not supported)
 *   isInstalled    — true when running in standalone / TWA mode
 *   isIOS          — true on iOS (which shows custom "Add to Home Screen" instructions)
 *   triggerInstall — call this to show the native install dialog
 *   dismiss        — hides the install banner until next session
 */
export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dismissed,     setDismissed]     = useState(
    () => sessionStorage.getItem('nw_install_dismissed') === '1'
  );

  // Detect standalone mode (PWA already installed)
  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  // Detect iOS (Safari shows a manual "Share → Add to Home Screen" flow)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();          // Prevent Chrome's mini infobar
      setInstallPrompt(e);         // Save for later
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Clean up the prompt after install
    window.addEventListener('appinstalled', () => setInstallPrompt(null));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const dismiss = () => {
    sessionStorage.setItem('nw_install_dismissed', '1');
    setDismissed(true);
  };

  const showBanner = !isInstalled && !dismissed && (installPrompt || isIOS);

  return { installPrompt, isInstalled, isIOS, showBanner, triggerInstall, dismiss };
}
