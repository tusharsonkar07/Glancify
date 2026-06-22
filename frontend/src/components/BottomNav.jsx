/**
 * BottomNav — floating bottom navigation for mobile.
 * Sits above the bottom edge as a frosted-glass pill bar.
 * Shows icons for all categories; active one expands to show its label.
 * Hidden on md+ screens (desktop uses CategoryBar in the header).
 */

const NAV_ITEMS = [
  { id: 'top',           label: 'Top',     icon: FlameIcon },
  { id: 'technology',    label: 'Tech',    icon: ChipIcon },
  { id: 'business',      label: 'Business',icon: TrendIcon },
  { id: 'sports',        label: 'Sports',  icon: BallIcon },
  { id: 'entertainment', label: 'Watch',   icon: ClapperIcon },
  { id: 'science',       label: 'Science', icon: AtomIcon },
  { id: 'health',        label: 'Health',  icon: HeartIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    /* Wrapper: fixed to bottom, only visible on small screens */
    <nav
      aria-label="News categories"
      className="
        md:hidden
        fixed bottom-4 left-1/2 -translate-x-1/2
        z-40
        flex items-center gap-1
        bg-white/80 backdrop-blur-xl
        border border-rule/60
        rounded-full
        px-2 py-2
        shadow-xl shadow-ink/10
        max-w-[calc(100vw-2rem)]
        overflow-x-auto no-scrollbar
      "
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-pressed={isActive}
            aria-label={item.label}
            className={`
              flex items-center gap-1.5
              rounded-full shrink-0
              transition-all duration-250 ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt
              ${isActive
                ? 'bg-ink text-white px-4 py-2'
                : 'text-slate px-2.5 py-2 hover:text-ink hover:bg-parchment'
              }
            `}
          >
            <Icon active={isActive} />
            {isActive && (
              <span className="text-xs font-body font-semibold whitespace-nowrap leading-none">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ─── SVG icon components ─────────────────────────────────────────────────── */

function FlameIcon({ active }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-orange-400' : ''}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
    </svg>
  );
}

function ChipIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3V1m6 2h2a2 2 0 012 2v2m0 0V9m0-2h2M3 9v2m0 0v4m0-4H1m2 4v2a2 2 0 002 2h2m0 0h4m-4 0V23m4-2h2a2 2 0 002-2v-2m0 0V15m0 2h2M21 15v-4m0 0V9m0 2h-2M7 21h2m0-18v2m4-2v2m4 16v-2m-4 2v-2M7 7h10v10H7z"/>
    </svg>
  );
}

function TrendIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  );
}

function BallIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c2.5 2.5 4 5.5 4 10m-4-10C9.5 4.5 8 7.5 8 12m4-10v20M2 12h20M4.93 4.93l4.24 4.24m9.66-4.24l-4.24 4.24m0 6.34l4.24 4.24M4.93 19.07l4.24-4.24"/>
    </svg>
  );
}

function ClapperIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
    </svg>
  );
}

function AtomIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <path strokeLinecap="round"
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" strokeDasharray="4 2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" strokeDasharray="4 2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" strokeDasharray="4 2"/>
    </svg>
  );
}

function HeartIcon({ active }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={active ? '#DC2626' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  );
}

export { NAV_ITEMS };
