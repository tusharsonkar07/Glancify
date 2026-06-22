import { useEffect, useRef } from 'react';

function relativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'long', day: 'numeric' });
  } catch { return ''; }
}

export default function ArticleReader({ article, onClose, bookmarked, onBookmark }) {
  const panelRef   = useRef(null);
  const overlayRef = useRef(null);
  const dragRef    = useRef({ dragging: null, startY: 0, startX: 0, startScrollTop: 0, lastDelta: 0 });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!article) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // Lock body scroll on mobile
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [article, onClose]);

  // Swipe-down-to-close — mobile bottom sheet only.
  // We manipulate the DOM directly (instead of React state) so the panel
  // tracks the finger 1:1 every frame without re-rendering the component.
  useEffect(() => {
    const panel = panelRef.current;
    if (!article || !panel || !isMobile) return;

    const CLOSE_THRESHOLD = 110; // px of downward drag needed to dismiss
    const MOVE_THRESHOLD  = 6;   // px of movement before we decide intent

    const setDragPosition = (deltaY) => {
      panel.style.transition = 'none';
      panel.style.transform  = `translateY(${deltaY}px)`;
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'none';
        overlayRef.current.style.opacity = String(Math.max(0, 1 - deltaY / 400));
      }
    };

    const snapBack = () => {
      panel.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1)';
      panel.style.transform  = '';
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'opacity 0.25s ease';
        overlayRef.current.style.opacity = '';
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragRef.current = {
        dragging: null,
        startY: t.clientY,
        startX: t.clientX,
        startScrollTop: panel.scrollTop,
        lastDelta: 0,
      };
    };

    const onTouchMove = (e) => {
      const ds = dragRef.current;
      if (ds.startY === undefined) return;
      const t = e.touches[0];
      const deltaY = t.clientY - ds.startY;
      const deltaX = t.clientX - ds.startX;

      // Decide gesture intent once, the first time the finger moves enough.
      if (ds.dragging === null) {
        if (Math.abs(deltaY) < MOVE_THRESHOLD && Math.abs(deltaX) < MOVE_THRESHOLD) return;
        const isDownward = deltaY > 0;
        const isVertical  = Math.abs(deltaY) > Math.abs(deltaX);
        // Only start a close-drag if the sheet is already scrolled to the
        // top — otherwise this is just the user scrolling the article.
        ds.dragging = isDownward && isVertical && ds.startScrollTop <= 0;
      }

      if (ds.dragging) {
        e.preventDefault();
        const clamped = Math.max(0, deltaY);
        ds.lastDelta = clamped;
        setDragPosition(clamped);
      }
    };

    const onTouchEnd = () => {
      const ds = dragRef.current;
      if (ds.dragging) {
        if (ds.lastDelta > CLOSE_THRESHOLD) {
          onClose();
        } else {
          snapBack();
        }
      }
      dragRef.current = { dragging: null, startY: 0, startX: 0, startScrollTop: 0, lastDelta: 0 };
    };

    panel.addEventListener('touchstart', onTouchStart, { passive: true });
    panel.addEventListener('touchmove',  onTouchMove,  { passive: false });
    panel.addEventListener('touchend',   onTouchEnd,   { passive: true });
    panel.addEventListener('touchcancel', onTouchEnd,  { passive: true });

    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove',  onTouchMove);
      panel.removeEventListener('touchend',   onTouchEnd);
      panel.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [article, onClose, isMobile]);

  if (!article) return null;

  const { title, description, content, link, image_url, source_name, source_url, pubDate, creator, category } = article;

  const displayContent = content?.startsWith('ONLY AVAILABLE') ? null : content;

  const handleReadFull = () => window.open(link, '_blank', 'noopener,noreferrer');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="bottom-sheet-overlay animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, side panel on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`
          ${isMobile
            ? 'bottom-sheet animate-slide-up'
            : 'side-panel animate-slide-right'
          }
        `}
      >
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-rule" />
          </div>
        )}

        {/* Toolbar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-rule z-10 px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <button
              onClick={() => onBookmark?.(article)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this story'}
              className="w-9 h-9 rounded-full border border-rule flex items-center justify-center text-slate hover:text-cobalt hover:border-cobalt/30 transition-colors"
            >
              {bookmarked
                ? <BookmarkFilledIcon />
                : <BookmarkIcon />
              }
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-9 h-9 rounded-full border border-rule flex items-center justify-center text-slate hover:text-cobalt hover:border-cobalt/30 transition-colors"
            >
              <ShareIcon />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-rule flex items-center justify-center text-slate hover:text-ink hover:border-slate/40 transition-colors ml-auto"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Article content */}
        <div className="px-5 pt-5 pb-10">
          {/* Category + source */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {category?.[0] && (
              <span className="text-xs font-mono font-medium text-cobalt bg-cobalt/8 px-2 py-0.5 rounded-md capitalize">
                {category[0]}
              </span>
            )}
            <span className="text-xs font-mono text-slate">{source_name}</span>
            {pubDate && (
              <>
                <span className="text-rule">·</span>
                <span className="text-xs font-mono text-slate/70">{relativeTime(pubDate)}</span>
              </>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight mb-4">
            {title}
          </h1>

          {/* Author */}
          {creator?.length > 0 && (
            <p className="text-sm font-body text-slate mb-4">
              By <span className="font-medium text-ink">{creator.join(', ')}</span>
            </p>
          )}

          {/* Hero image */}
          {image_url && (
            <figure className="mb-5 -mx-5">
              <img
                src={image_url}
                alt=""
                className="w-full max-h-64 object-cover"
                loading="eager"
              />
            </figure>
          )}

          {/* Description */}
          {description && (
            <p className="text-base font-body text-ink/80 leading-relaxed mb-4 border-l-2 border-cobalt/30 pl-4 italic">
              {description}
            </p>
          )}

          {/* Content */}
          {displayContent ? (
            <div className="article-body text-base font-body text-ink/90 leading-relaxed">
              {displayContent.split(/\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate font-body text-sm mb-6 italic">
              Full content available at the source. Tap below to read the complete story.
            </p>
          )}

          {/* Read full story CTA */}
          <button
            onClick={handleReadFull}
            className="
              mt-6 w-full py-3.5 rounded-xl
              bg-ink text-white text-sm font-body font-semibold
              flex items-center justify-center gap-2
              hover:bg-ink/80 active:scale-95 transition-all
            "
          >
            Read full story on {source_name}
            <ExternalIcon />
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Micro icons ──────────────────────────────────────────────────────────── */
function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
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
