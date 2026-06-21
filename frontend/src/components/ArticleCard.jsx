import { useState } from 'react';

/** Format a Newsdata.io pubDate string → relative time label */
function relativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
    const mins  = Math.round(diff / 60000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs  < 24)  return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

/** Placeholder gradient when image is missing or broken */
const PLACEHOLDER_CLASSES = [
  'from-blue-50 to-blue-100',
  'from-amber-50 to-orange-100',
  'from-emerald-50 to-teal-100',
  'from-violet-50 to-purple-100',
  'from-rose-50 to-pink-100',
];

function placeholderFor(id = '') {
  const i = id.charCodeAt(0) % PLACEHOLDER_CLASSES.length;
  return PLACEHOLDER_CLASSES[i];
}

export default function ArticleCard({ article, variant = 'standard', onClick, bookmarked, onBookmark }) {
  const [imgError, setImgError] = useState(false);

  const {
    article_id, title, description, image_url,
    source_name, pubDate, category,
  } = article;

  const isHero    = variant === 'hero';
  const isCompact = variant === 'compact';
  const isBreaking = category?.includes('top') || false;

  const handleBookmark = (e) => {
    e.stopPropagation();
    onBookmark?.(article);
  };

  const hasImage = image_url && !imgError;

  return (
    <article
      onClick={() => onClick?.(article)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(article)}
      aria-label={`Read: ${title}`}
      className={`
        card-lift cursor-pointer bg-white rounded-2xl overflow-hidden
        border border-rule group select-none outline-none
        focus-visible:ring-2 focus-visible:ring-cobalt
        ${isBreaking ? '' : ''}
      `}
    >
      {/* Image / placeholder */}
      {!isCompact && (
        <div className={`
          relative overflow-hidden bg-gradient-to-br ${placeholderFor(article_id)}
          ${isHero ? 'h-56 sm:h-72' : 'h-36'}
        `}>
          {hasImage && (
            <img
              src={image_url}
              alt=""
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Category badge */}
          {category?.[0] && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ink text-xs font-mono font-medium px-2 py-0.5 rounded-md capitalize">
              {category[0]}
            </span>
          )}

          {/* Breaking live dot */}
          {isBreaking && (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-scarlet text-white text-xs font-mono px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
              LIVE
            </span>
          )}

          {/* Gradient overlay for text legibility on hero */}
          {isHero && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          )}
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${isCompact ? 'flex gap-3 items-start' : ''}`}>
        {/* Compact: small image thumbnail on right */}
        {isCompact && hasImage && (
          <img
            src={image_url}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-16 h-16 rounded-lg object-cover shrink-0 order-last"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Breaking accent for compact cards */}
          {isBreaking && isCompact && (
            <span className="inline-flex items-center gap-1 text-scarlet text-xs font-mono font-medium mb-1">
              <span className="w-1.5 h-1.5 bg-scarlet rounded-full animate-pulse-dot" />
              Breaking
            </span>
          )}

          <h3 className={`
            font-display font-semibold text-ink leading-snug mb-1
            ${isHero ? 'text-xl sm:text-2xl' : isCompact ? 'text-sm' : 'text-base'}
            group-hover:text-cobalt transition-colors duration-150
            line-clamp-${isHero ? '3' : isCompact ? '2' : '3'}
          `}>
            {title}
          </h3>

          {!isCompact && description && (
            <p className="text-slate text-sm font-body line-clamp-2 mb-3 leading-relaxed">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-slate truncate">{source_name}</span>
              {pubDate && (
                <>
                  <span className="text-rule text-xs">·</span>
                  <span className="text-xs font-mono text-slate/70 shrink-0">{relativeTime(pubDate)}</span>
                </>
              )}
            </div>

            <button
              onClick={handleBookmark}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              className="shrink-0 text-slate hover:text-cobalt transition-colors"
            >
              {bookmarked
                ? <BookmarkFilledIcon />
                : <BookmarkIcon />
              }
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookmarkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
  );
}

function BookmarkFilledIcon() {
  return (
    <svg className="w-4 h-4 text-cobalt" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
  );
}
