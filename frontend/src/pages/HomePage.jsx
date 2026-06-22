import { useState, useRef, useCallback } from 'react';
import Header        from '../components/Header';
import CategoryBar   from '../components/CategoryBar';
import BottomNav     from '../components/BottomNav';
import BentoGrid     from '../components/BentoGrid';
import ArticleReader from '../components/ArticleReader';
import InstallBanner from '../components/InstallBanner';
import { Footer }    from '../pages/IntroPage';          // shared footer
import { useNews, useSearch } from '../hooks/useNews';
import { usePWA }    from '../hooks/usePWA';

const CATEGORY_ORDER = ['top', 'technology', 'business', 'sports', 'entertainment', 'science', 'health'];
const SWIPE_THRESHOLD = 52;
const SWIPE_Y_LIMIT   = 80;

export default function HomePage() {
  const [category,        setCategory]        = useState('top');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [swipeDir,        setSwipeDir]        = useState(null);
  const [bookmarks,       setBookmarks]       = useState(
    () => JSON.parse(localStorage.getItem('nw_bookmarks') || '[]')
  );

  const { articles, loading, error, refresh } = useNews(category);
  const { query, results, loading: searching, search, clearSearch } = useSearch();
  const { showBanner, isIOS, triggerInstall, dismiss } = usePWA();

  /* ─── Swipe gesture ─────────────────────────────────────────────────────── */
  const touchStart  = useRef(null);
  const touchActive = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStart.current  = { x: t.clientX, y: t.clientY };
    touchActive.current = true;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchActive.current || !touchStart.current) return;
    touchActive.current = false;
    const t  = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = Math.abs(t.clientY - touchStart.current.y);
    touchStart.current = null;
    if (dy > SWIPE_Y_LIMIT || Math.abs(dx) < SWIPE_THRESHOLD) return;
    const idx = CATEGORY_ORDER.indexOf(category);
    if (dx < 0 && idx < CATEGORY_ORDER.length - 1) {
      setSwipeDir('left');
      changeCategory(CATEGORY_ORDER[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      setSwipeDir('right');
      changeCategory(CATEGORY_ORDER[idx - 1]);
    }
    setTimeout(() => setSwipeDir(null), 320);
  }, [category]);

  /* ─── Helpers ───────────────────────────────────────────────────────────── */
  const changeCategory = (cat) => { clearSearch(); setCategory(cat); };

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.article_id === article.article_id);
      const next   = exists
        ? prev.filter(b => b.article_id !== article.article_id)
        : [article, ...prev];
      localStorage.setItem('nw_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const displayArticles = query.trim().length >= 2 ? results : articles;
  const isLoading       = query.trim().length >= 2 ? searching : loading;
  const swipeClass      = swipeDir === 'left'  ? 'animate-swipe-left'
                        : swipeDir === 'right' ? 'animate-swipe-right' : '';

  return (
    <div className="min-h-dvh bg-newsprint">

      {/* Header */}
      <Header onSearch={search} onClearSearch={clearSearch} isSearching={searching} />

      {/* Install banner */}
      {showBanner && (
        <InstallBanner isIOS={isIOS} onInstall={triggerInstall} onDismiss={dismiss} />
      )}

      {/* Desktop category bar */}
      {!query && (
        <div
          className="hidden md:block sticky z-20 bg-newsprint/90 backdrop-blur-md border-b border-rule"
          style={{ top: 'var(--header-h, 3.5rem)' }}
        >
          <CategoryBar active={category} onChange={changeCategory} />
        </div>
      )}

      {/* Mobile: current category + swipe hint */}
      {!query && (
        <div className="md:hidden px-4 pt-3 pb-1 flex items-center gap-2">
          <span className="text-xs font-mono text-slate capitalize">
            {CATEGORY_ORDER.indexOf(category) > 0 ? '← ' : ''}
            {category === 'top' ? 'Top Stories' : category}
            {CATEGORY_ORDER.indexOf(category) < CATEGORY_ORDER.length - 1 ? ' →' : ''}
          </span>
          <SwipeHint />
        </div>
      )}

      {/* Search heading */}
      {query && (
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-mono text-slate">
            {searching ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for`}
          </span>
          <span className="text-sm font-body font-semibold text-ink">"{query}"</span>
          <button onClick={clearSearch} className="ml-auto text-xs text-cobalt font-body hover:underline">
            Clear
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 bg-scarlet/8 border border-scarlet/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-scarlet text-lg">⚠️</span>
          <p className="text-sm font-body text-scarlet flex-1">{error}</p>
          <button
            onClick={refresh}
            className="text-xs font-body font-semibold text-scarlet border border-scarlet/30 px-2.5 py-1 rounded-lg hover:bg-scarlet/10 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bookmarks shelf */}
      {!query && bookmarks.length > 0 && (
        <BookmarksShelf
          bookmarks={bookmarks}
          onOpen={setSelectedArticle}
          onRemove={toggleBookmark}
        />
      )}

      {/* Main swipeable content */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
        className="md:pb-8"
      >
        <div className={swipeClass}>
          <BentoGrid
            articles={displayArticles}
            loading={isLoading}
            onArticleClick={setSelectedArticle}
            bookmarks={bookmarks}
            onBookmark={toggleBookmark}
          />
        </div>

        {/* ── Page footer — only shown when there are articles loaded ────── */}
        {!isLoading && displayArticles.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-2 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-rule" />
              <img
                src="/icons/glancify mobile logo.png"
                alt=""
                className="w-3.5 h-3.5 opacity-25"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="flex-1 h-px bg-rule" />
            </div>
            <Footer />
          </div>
        )}
      </main>

      {/* Desktop refresh FAB */}
      {!isLoading && (
        <button
          onClick={refresh}
          aria-label="Refresh"
          className="fixed bottom-6 right-4 z-30 hidden md:flex w-12 h-12 rounded-full bg-ink text-white shadow-lg shadow-black/20 items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      )}

      {/* Floating bottom nav (mobile) */}
      <BottomNav active={category} onChange={changeCategory} />

      {/* Article reader */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          bookmarked={bookmarks.some(b => b.article_id === selectedArticle.article_id)}
          onBookmark={toggleBookmark}
        />
      )}
    </div>
  );
}

/* ─── Swipe hint ─────────────────────────────────────────────────────────── */
function SwipeHint() {
  const seen = sessionStorage.getItem('nw_swipe_seen');
  if (seen) return null;
  return (
    <span
      onClick={() => sessionStorage.setItem('nw_swipe_seen', '1')}
      className="ml-auto flex items-center gap-1 text-[10px] font-mono text-slate/50 bg-parchment border border-rule px-2 py-0.5 rounded-full select-none cursor-pointer"
    >
      ← swipe to switch →
    </span>
  );
}

/* ─── Bookmarks shelf ────────────────────────────────────────────────────── */
function BookmarksShelf({ bookmarks, onOpen, onRemove }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="border-b border-rule bg-parchment">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-left"
      >
        <span className="text-sm font-mono text-slate">📌</span>
        <span className="text-sm font-body font-medium text-ink">Bookmarks ({bookmarks.length})</span>
        <svg
          className={`w-4 h-4 text-slate ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-3 animate-fade-in">
          {bookmarks.map(article => (
            <div
              key={article.article_id}
              className="shrink-0 w-52 bg-white rounded-xl border border-rule p-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onOpen(article)}
            >
              <p className="text-xs font-display font-semibold text-ink line-clamp-2 mb-2 leading-snug">
                {article.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate truncate">{article.source_name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(article); }}
                  className="text-slate hover:text-scarlet transition-colors ml-2 shrink-0"
                  aria-label="Remove bookmark"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
