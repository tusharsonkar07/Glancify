import { useEffect, useRef } from 'react';
import ArticleCard from './ArticleCard';

/** Skeleton placeholder shown while articles are loading */
function SkeletonCard({ tall = false }) {
  return (
    <div className="bg-white rounded-2xl border border-rule overflow-hidden">
      <div className={`skeleton ${tall ? 'h-64' : 'h-36'}`} />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/5" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

/** Compact skeleton rows shown at the bottom while loading more */
function LoadMoreSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-rule overflow-hidden flex gap-3 p-3">
          <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
            <div className="skeleton h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * BentoGrid
 *
 * Props:
 *  articles       - array of article objects
 *  loading        - true on initial fetch
 *  loadingMore    - true when fetching the next page
 *  hasMore        - whether more pages exist
 *  onLoadMore     - callback to trigger next page fetch
 *  onArticleClick - open article reader
 *  bookmarks      - current bookmarked articles
 *  onBookmark     - toggle bookmark
 */
export default function BentoGrid({
  articles,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onArticleClick,
  bookmarks,
  onBookmark,
}) {
  // ─── Infinite scroll sentinel ─────────────────────────────────────────────
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: '300px' }   // start fetching 300 px before sentinel is visible
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  // ─── Loading state (initial) ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bento-grid p-4">
        <div className="bento-hero"><SkeletonCard tall /></div>
        <div className="bento-side"><SkeletonCard /></div>
        <div className="bento-side"><SkeletonCard /></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bento-quarter"><SkeletonCard /></div>
        ))}
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="font-display text-xl text-ink font-semibold mb-2">No stories yet</h2>
        <p className="text-slate text-sm font-body">Pull down to refresh or try another category.</p>
      </div>
    );
  }

  const isBookmarked = (a) => bookmarks?.some(b => b.article_id === a.article_id);

  const cardProps = (article) => ({
    article,
    onClick:    onArticleClick,
    bookmarked: isBookmarked(article),
    onBookmark,
  });

  // ─── Slice into visual zones ──────────────────────────────────────────────
  // First 7 articles → bento layout (hero + 2 side + 4 quarter)
  // Articles 8-10    → "More stories" compact list (first page)
  // Articles 11+     → appended to compact list as more pages load
  const [hero, ...rest] = articles;
  const sideCards    = rest.slice(0, 2);
  const quarterCards = rest.slice(2, 6);
  const listCards    = rest.slice(6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 animate-fade-in">

      {/* ── Zone 1: Bento grid ── */}
      <div className="bento-grid">
        {hero && (
          <div className="bento-hero">
            <ArticleCard {...cardProps(hero)} variant="hero" />
          </div>
        )}
        {sideCards.map((a) => (
          <div key={a.article_id} className="bento-side">
            <ArticleCard {...cardProps(a)} variant="standard" />
          </div>
        ))}
        {quarterCards.map((a) => (
          <div key={a.article_id} className="bento-quarter">
            <ArticleCard {...cardProps(a)} variant="standard" />
          </div>
        ))}
      </div>

      {/* ── Zone 2: Compact list (articles 7+, grows with each page load) ── */}
      {listCards.length > 0 && (
        <>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-rule" />
            <span className="text-xs font-mono text-slate uppercase tracking-widest">More stories</span>
            <div className="flex-1 h-px bg-rule" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listCards.map((a) => (
              <ArticleCard key={a.article_id} {...cardProps(a)} variant="compact" />
            ))}
          </div>
        </>
      )}

      {/* ── Infinite scroll sentinel ── */}
      {/* Sits just below the list; IntersectionObserver fires onLoadMore */}
      <div ref={sentinelRef} className="h-1" aria-hidden />

      {/* ── Loading more indicator ── */}
      {loadingMore && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-rule" />
            <span className="text-xs font-mono text-slate uppercase tracking-widest animate-pulse">
              Loading more…
            </span>
            <div className="flex-1 h-px bg-rule" />
          </div>
          <LoadMoreSkeleton />
        </div>
      )}

      {/* ── End-of-feed indicator ── */}
      {!hasMore && !loadingMore && articles.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-rule" />
          <span className="text-[11px] font-mono text-slate/50 uppercase tracking-widest">
            You're all caught up
          </span>
          <div className="flex-1 h-px bg-rule" />
        </div>
      )}
    </div>
  );
}
