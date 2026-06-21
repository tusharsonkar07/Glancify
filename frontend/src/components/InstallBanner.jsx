/**
 * InstallBanner — shown once per session until dismissed.
 * On iOS it shows manual instructions (iOS doesn't support beforeinstallprompt).
 * On Android/Chrome it shows a one-tap install button.
 */
export default function InstallBanner({ isIOS, onInstall, onDismiss }) {
  return (
    <div
      role="banner"
      className="
        sticky top-14 z-20
        mx-4 mt-2 mb-0
        bg-cobalt text-white
        rounded-2xl px-4 py-3
        flex items-center gap-3 shadow-lg shadow-cobalt/20
        animate-slide-up
      "
    >
      {/* Icon */}
      <img src="/icons/glancify mobile logo.png" alt="NewsWave" className="w-9 h-9 rounded-xl shrink-0" />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-semibold leading-tight">
          Add Glancify to your home screen
        </p>
        {isIOS ? (
          <p className="text-xs text-white/70 font-body mt-0.5 leading-snug">
            Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
          </p>
        ) : (
          <p className="text-xs text-white/70 font-body mt-0.5">
            One tap · Works offline · No app store
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!isIOS && (
          <button
            onClick={onInstall}
            className="
              text-xs font-body font-semibold
              bg-white text-cobalt
              px-3 py-1.5 rounded-lg
              hover:bg-white/90 active:scale-95 transition-all
            "
          >
            Install
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
