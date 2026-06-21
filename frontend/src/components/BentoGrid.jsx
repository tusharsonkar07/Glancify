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

export default function BentoGrid({ articles, loading, onArticleClick, bookmarks, onBookmark }) {

  /* ─── Loading state ─────────────────────────────────────────────────────── */
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

  /* ─── Empty state ───────────────────────────────────────────────────────── */
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

  /* Slice articles into visual zones */
  const [hero, ...rest]            = articles;
  const sideCards                  = rest.slice(0, 2);
  const quarterCards               = rest.slice(2, 6);
  const listCards                  = rest.slice(6);

  const cardProps = (article) => ({
    article,
    onClick:    onArticleClick,
    bookmarked: isBookmarked(article),
    onBookmark,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 animate-fade-in">

      {/* ── Zone 1: Bento grid (hero + side + quarters) ── */}
      <div className="bento-grid">

        {/* Hero — large featured card */}
        {hero && (
          <div className="bento-hero">
            <ArticleCard {...cardProps(hero)} variant="hero" />
          </div>
        )}

        {/* Side cards — stacked to the right of hero */}
        {sideCards.map((a) => (
          <div key={a.article_id} className="bento-side">
            <ArticleCard {...cardProps(a)} variant="standard" />
          </div>
        ))}

        {/* Quarter-width cards — second row */}
        {quarterCards.map((a) => (
          <div key={a.article_id} className="bento-quarter">
            <ArticleCard {...cardProps(a)} variant="standard" />
          </div>
        ))}
      </div>

      {/* ── Zone 2: Compact list for remaining articles ── */}
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
    </div>
  );
}
