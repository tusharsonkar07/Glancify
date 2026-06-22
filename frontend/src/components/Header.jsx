import { useState, useRef, useEffect } from 'react';
import DeveloperCard from './DeveloperCard';
import MakerBadge from './MakerBadge';

/*
  Changes from previous version:
  ─────────────────────────────
  1. Added `devCardOpen` state + DeveloperCard import.
  2. Added a small "TS" monogram button on DESKTOP ONLY (hidden md:flex)
     positioned after the LiveClock — same top-right pattern as GitHub avatar.
  3. Zero changes to any other functionality.
*/

export default function Header({ onSearch, onClearSearch, isSearching }) {
  const [open,        setOpen]        = useState(false);   // search open
  const [query,       setQuery]       = useState('');
  const [devCardOpen, setDevCardOpen] = useState(false);   // maker card open
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onClearSearch();
    setOpen(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-newsprint/95 backdrop-blur-md border-b border-rule"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          {!open && (
            <a href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/icons/glancify mobile logo.png"
                alt="glancify"
                className="w-6 h-6 rounded-md"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="font-display font-bold text-xl text-ink tracking-tight">
                glanc<span className="text-scarlet">ify</span>
              </span>
            </a>
          )}

          {/* Search bar */}
          <div className={`flex items-center gap-2 transition-all duration-200 ${open ? 'flex-1' : ''}`}>
            {!open && <MakerBadge onClick={() => setDevCardOpen(true)} />}
            {open && (
              <div className="flex-1 flex items-center gap-2 bg-white border border-rule rounded-xl px-3 h-9 shadow-sm">
                <svg className="w-4 h-4 text-slate shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd"/>
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={handleChange}
                  placeholder="Search stories…"
                  className="flex-1 bg-transparent text-sm text-ink placeholder-slate outline-none font-body"
                />
                {isSearching && (
                  <div className="w-3 h-3 rounded-full border-2 border-cobalt border-t-transparent animate-spin shrink-0" />
                )}
              </div>
            )}

            {open ? (
              <button
                onClick={handleClear}
                className="shrink-0 text-sm text-slate hover:text-ink font-body transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                aria-label="Open search"
                className="w-9 h-9 rounded-full bg-white border border-rule flex items-center justify-center text-slate hover:text-ink hover:border-slate/40 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
          </div>

          {/* Right side: clock + TS monogram (desktop only) */}
          {!open && (
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <LiveClock />

              {/* ── Maker monogram button ─────────────────────────────
                   Same concept as GitHub's avatar in the top-right.
                   Shows "TS" initials; tooltip says "About the maker".
                   Clicking opens the DeveloperCard popover.
                   Completely hidden on mobile — footer handles that.
              ─────────────────────────────────────────────────────── */}
              <button
                onClick={() => setDevCardOpen(true)}
                aria-label="About the maker"
                aria-haspopup="dialog"
                aria-expanded={devCardOpen}
                title="About the maker"
                style={{
                  width:          '30px',
                  height:         '30px',
                  borderRadius:   '50%',
                  border:         '1.5px solid #E7E5E4',
                  background:     '#1C1917',
                  color:          '#FFFFFF',
                  fontFamily:     '"Fraunces", Georgia, serif',
                  fontWeight:     700,
                  fontSize:       '0.6rem',
                  letterSpacing:  '0.01em',
                  cursor:         'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  transition:     'box-shadow 0.18s, transform 0.15s',
                  flexShrink:     0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28,25,23,0.12)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform  = 'scale(1)';
                }}
              >
                TS
              </button>
            </div>
          )}
        </div>
      </header>

      {/* DeveloperCard — rendered outside the header so z-index is clean */}
      <DeveloperCard
        isOpen={devCardOpen}
        onClose={() => setDevCardOpen(false)}
        anchor="header"
      />
    </>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="font-mono text-xs text-slate tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      {' · '}
      {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
    </span>
  );
}
