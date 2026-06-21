import { useState } from 'react';
import Header       from '../components/Header';
import CategoryBar  from '../components/CategoryBar';
import BentoGrid    from '../components/BentoGrid';
import ArticleReader from '../components/ArticleReader';
import InstallBanner from '../components/InstallBanner';
import { useNews, useSearch } from '../hooks/useNews';
import { usePWA } from '../hooks/usePWA';

export default function HomePage() {
  const [category,         setCategory]         = useState('top');
  const [selectedArticle,  setSelectedArticle]  = useState(null);
  const [bookmarks,        setBookmarks]         = useState(
    () => JSON.parse(localStorage.getItem('nw_bookmarks') || '[]')
  );

  const { articles, loading, error, refresh } = useNews(category);
  const { query, results, loading: searching, search, clearSearch } = useSearch();
  const { showBanner, isIOS, triggerInstall, dismiss } = usePWA();

  /* ─── Bookmark toggle ──────────────────────────────────────────────────── */
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

  /* ─── Displayed articles: search results OR category feed ──────────────── */
  const displayArticles = query.trim().length >= 2 ? results : articles;
  const isLoading       = query.trim().length >= 2 ? searching : loading;

  /* ─── Category change clears search ───────────────────────────────────── */
  const handleCategoryChange = (cat) => {
    clearSearch();
    setCategory(cat);
  };

  return (
    <div className="min-h-dvh bg-newsprint">
      {/* Sticky header */}
      <Header
        onSearch={search}
        onClearSearch={clearSearch}
        isSearching={searching}
      />

      {/* Install banner */}
      {showBanner && (
        <InstallBanner
          isIOS={isIOS}
          onInstall={triggerInstall}
          onDismiss={dismiss}
        />
      )}

      {/* Category bar */}
      {!query && (
        <div className="sticky top-14 z-20 bg-newsprint/90 backdrop-blur-md border-b border-rule">
          <CategoryBar active={category} onChange={handleCategoryChange} />
        </div>
      )}

      {/* Search heading */}
      {query && (
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="text-sm font-mono text-slate">
            {searching
              ? 'Searching…'
              : `${results.length} result${results.length !== 1 ? 's' : ''} for`
            }
          </span>
          <span className="text-sm font-body font-semibold text-ink">"{query}"</span>
          <button
            onClick={clearSearch}
            className="ml-auto text-xs text-cobalt font-body hover:underline"
          >
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

      {/* Bookmarks shelf — shown only when no search and category tab doesn't hide it */}
      {!query && bookmarks.length > 0 && (
        <BookmarksShelf
          bookmarks={bookmarks}
          onOpen={setSelectedArticle}
          onRemove={toggleBookmark}
        />
      )}

      {/* Main bento grid */}
      <main>
        <BentoGrid
          articles={displayArticles}
          loading={isLoading}
          onArticleClick={setSelectedArticle}
          bookmarks={bookmarks}
          onBookmark={toggleBookmark}
        />
      </main>

      {/* Refresh FAB (mobile) */}
      {!isLoading && (
        <button
          onClick={refresh}
          aria-label="Refresh"
          className="
            fixed bottom-6 right-4 z-30
            md:hidden
            w-12 h-12 rounded-full
            bg-ink text-white shadow-lg shadow-black/25
            flex items-center justify-center
            active:scale-90 transition-transform
          "
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      )}

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

/* ─── Bookmarks horizontal shelf ─────────────────────────────────────────── */
function BookmarksShelf({ bookmarks, onOpen, onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-b border-rule bg-parchment">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-left"
      >
        <span className="text-sm font-mono text-slate">📌</span>
        <span className="text-sm font-body font-medium text-ink">
          Bookmarks ({bookmarks.length})
        </span>
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
