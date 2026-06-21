import { useState, useRef, useEffect } from 'react';

export default function Header({ onSearch, onClearSearch, isSearching }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input when search bar opens
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
    <header className="sticky top-0 z-30 bg-newsprint/90 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        {!open && (
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/icons/glancify mobile logo.png" alt="NewsWave" className="w-6 h-6" />
            <span className="font-display font-bold text-xl text-ink tracking-tight">
              Glanc<span className="text-scarlet">ify</span>
            </span>
          </a>
        )}

        {/* Search bar (inline expand) */}
        <div className={`flex items-center gap-2 transition-all duration-200 ${open ? 'flex-1' : ''}`}>
          {open ? (
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
          ) : null}

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

        {/* Time — desktop only */}
        {!open && (
          <LiveClock />
        )}
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="hidden md:block font-mono text-xs text-slate tabular-nums shrink-0">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      {' · '}
      {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
    </span>
  );
}
