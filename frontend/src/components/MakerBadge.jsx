/**
 * MakerBadge
 * ──────────
 * A persistent, unobtrusive floating attribution chip — always visible,
 * never blocks content. Inspired by Vercel's "▲ Powered by Vercel" corner badge.
 *
 * Positioning:
 *   Mobile  → above the BottomNav pill (which is fixed bottom-4, ~52 px tall)
 *   Desktop → bottom-left corner, clear of the refresh FAB (bottom-right)
 *
 * Clicking anywhere on the badge opens the full DeveloperCard dialog.
 */

import { useState } from 'react';
import DeveloperCard from './DeveloperCard';

export default function MakerBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        /* Delayed entrance so it doesn't compete with page-load animations */
        @keyframes badgeEntrance {
          from { opacity: 0; transform: translateY(8px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        .maker-badge-btn {
          animation: badgeEntrance 0.45s cubic-bezier(0.22, 1, 0.36, 1) 1.6s both;
          transition: box-shadow 0.2s ease, transform 0.2s ease, background 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .maker-badge-btn:hover {
          box-shadow: 0 6px 20px rgba(28, 25, 23, 0.13);
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.98) !important;
        }
        .maker-badge-btn:active {
          transform: scale(0.96) !important;
          transition-duration: 0.08s !important;
        }
        .maker-badge-btn:focus-visible {
          outline: 2px solid #1D4ED8;
          outline-offset: 2px;
        }

        /* Heartbeat on the ♥ glyph */
        @keyframes hbBadge {
          0%,  100% { transform: scale(1);    }
          16%        { transform: scale(1.35); }
          32%        { transform: scale(1);    }
          48%        { transform: scale(1.18); }
          64%        { transform: scale(1);    }
        }
        .maker-hb {
          display:   inline-block;
          color:     #DC2626;
          animation: hbBadge 2.4s ease-in-out infinite;
          line-height: 1;
        }

        /* On ≥ md screens there's no BottomNav, so drop to the viewport edge */
        @media (min-width: 768px) {
          .maker-badge-positioner {
            bottom: 1.375rem !important;
          }
        }
      `}</style>

      {/* ── Positioner ──────────────────────────────────────────────────── */}
      <div
        className="maker-badge-positioner"
        style={{
          position: 'fixed',
          /*
           * Mobile: BottomNav sits at bottom-4 (1rem) with ~52 px height
           * → its top edge is ~4.25 rem from the viewport bottom.
           * We add another 0.625 rem gap so the badge floats visibly above it.
           */
          bottom: 'calc(4.875rem + env(safe-area-inset-bottom, 0px))',
          left:   '0.875rem',
          zIndex: 55,           /* above BottomNav (z-40) and page content */
        }}
      >
        <button
          className="maker-badge-btn"
          onClick={() => setOpen(true)}
          aria-label="About the maker — opens Tushar Sonkar's profile"
          aria-haspopup="dialog"
          style={{
            display:           'flex',
            alignItems:        'center',
            gap:               '5px',
            padding:           '5px 11px 5px 9px',
            background:        'rgba(255, 255, 255, 0.86)',
            backdropFilter:    'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border:            '1px solid rgba(231, 229, 228, 0.85)',
            borderRadius:      '99px',
            boxShadow:         '0 2px 10px rgba(28, 25, 23, 0.09)',
            cursor:            'pointer',
            outline:           'none',
          }}
        >
          {/* Animated heart */}
          <span className="maker-hb" aria-hidden="true" style={{ fontSize: '0.63rem' }}>
            ♥
          </span>

          {/* Name label */}
          <span
            style={{
              fontFamily:    '"DM Mono", monospace',
              fontSize:      '0.63rem',
              fontWeight:    500,
              color:         '#1C1917',
              letterSpacing: '0.035em',
              lineHeight:    1,
              whiteSpace:    'nowrap',
              userSelect:    'none',
            }}
          >
            Tushar Sonkar
          </span>

          {/* External-link arrow — signals "click for more" */}
          <svg
            aria-hidden="true"
            width={8}
            height={8}
            viewBox="0 0 10 10"
            fill="none"
            style={{ color: '#A8A29E', flexShrink: 0 }}
          >
            <path
              d="M2 8L8 2M8 2H4M8 2V6"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Developer card dialog (shared component) ────────────────────── */}
      <DeveloperCard
        isOpen={open}
        onClose={() => setOpen(false)}
        anchor="footer"
      />
    </>
  );
}
