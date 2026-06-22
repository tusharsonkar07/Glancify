/**
 * DeveloperCard
 * ─────────────
 * A polished popover that reveals the maker's identity.
 *
 * Pattern reference: Linear "About" panel, Raycast credits,
 * Craft's "Meet the team" — always triggered by a discrete element
 * (a name link, a monogram avatar), never pushed on the user.
 *
 * Props:
 *   isOpen  (bool)     — controlled open state
 *   onClose (fn)       — called when user dismisses
 *   anchor  ('header'|'footer') — slightly adjusts entry direction
 */

import { useEffect, useRef } from 'react';

/* ── Update this URL with your real LinkedIn profile ── */
const LINKEDIN_URL = 'https://www.linkedin.com/in/tusharsonkar/';

export default function DeveloperCard({ isOpen, onClose, anchor = 'footer' }) {
  const cardRef = useRef(null);

  /* Close on Escape; return focus to body on unmount */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    /* Move focus into the card so screen readers announce it */
    cardRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes dcReveal {
          from { opacity: 0; transform: scale(0.93) translateY(${anchor === 'header' ? '-8px' : '8px'}); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes dcExit {
          to { opacity: 0; transform: scale(0.95); }
        }
        .dc-card {
          animation: dcReveal 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .dc-linkedin:hover {
          background: #1D4ED8;
          color: #fff;
          border-color: #1D4ED8;
        }
        @media (max-width: 768px) {
          .dc-card {
            width: 280px !important;
            max-width: 280px !important;
          }
        }
      `}</style>

      {/* ── Backdrop — light-dismiss ─────────────────────────────────── */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     60,
          background: 'rgba(28,25,23,0.18)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="About the maker"
        tabIndex={-1}
        className="dc-card"
        style={{
          position:     'fixed',
          top:          anchor === 'header' ? 'calc(3.5rem + env(safe-area-inset-top, 0px) + 0.5rem)' : '50%',
          left:         anchor === 'header' ? 'calc(50% - 46px)' : '50%',
          transform:    anchor === 'header' ? 'translateX(-50%)' : 'translate(-50%, -50%)',
          zIndex:       61,
          width:        anchor === 'header' ? '280px' : 'min(340px, calc(100vw - 2rem))',
          maxWidth:     anchor === 'header' ? '280px' : 'none',
          background:   '#FFFFFF',
          border:       '1px solid #E7E5E4',
          borderRadius: '1.25rem',
          boxShadow:    '0 24px 64px rgba(28,25,23,0.14), 0 4px 16px rgba(28,25,23,0.08)',
          outline:      'none',
          overflow:     'hidden',
        }}
      >
        {/* Close button — top right */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        '14px',
            right:      '14px',
            width:      '28px',
            height:     '28px',
            borderRadius: '50%',
            border:     '1px solid #E7E5E4',
            background: 'transparent',
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color:      '#78716C',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* ── Header section ───────────────────────────────────────── */}
        <div style={{ padding: anchor === 'header' ? '20px 18px 16px' : '28px 24px 20px' }}>

          {/* Monogram + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: anchor === 'header' ? '12px' : '14px', marginBottom: anchor === 'header' ? '12px' : '16px' }}>
            {/* Avatar — monogram initials */}
            <div
              aria-hidden
              style={{
                width:        anchor === 'header' ? '42px' : '52px',
                height:       anchor === 'header' ? '42px' : '52px',
                borderRadius: '50%',
                background:   'linear-gradient(135deg, #1C1917 0%, #374151 100%)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                flexShrink:   0,
                boxShadow:    '0 4px 12px rgba(28,25,23,0.2)',
              }}
            >
              <span style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 700,
                fontSize:   anchor === 'header' ? '0.9rem' : '1.1rem',
                color:      '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                TS
              </span>
            </div>

            <div>
              <p style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 700,
                fontSize:   anchor === 'header' ? '1rem' : '1.1rem',
                color:      '#1C1917',
                lineHeight: 1.2,
                marginBottom: '3px',
              }}>
                Tushar Sonkar
              </p>
              <p style={{
                fontFamily:    '"DM Mono", monospace',
                fontSize:      anchor === 'header' ? '0.6rem' : '0.68rem',
                color:         '#78716C',
                letterSpacing: '0.04em',
                lineHeight:    1.4,
              }}>
                DEVELOPER
              </p>
              <p style={{
                fontFamily:    '"DM Mono", monospace',
                fontSize:      anchor === 'header' ? '0.6rem' : '0.68rem',
                color:         '#DC2626',
                letterSpacing: '0.04em',
                marginTop:     '2px',
              }}>
                GLANCIFY
              </p>
            </div>
          </div>

          {/* Thin rule */}
          <div style={{ height: '1px', background: '#E7E5E4', marginBottom: '16px' }} />

          {/* Quote */}
          <blockquote style={{
            fontFamily:  '"DM Sans", system-ui, sans-serif',
            fontSize:    anchor === 'header' ? '0.75rem' : '0.875rem',
            color:       '#78716C',
            fontStyle:   'italic',
            lineHeight:  1.65,
            margin:      '0 0 ' + (anchor === 'header' ? '14px' : '20px'),
            paddingLeft: anchor === 'header' ? '10px' : '12px',
            borderLeft:  '2px solid #E7E5E4',
          }}>
            "I believe great products are built by people who care deeply — about code, craft, and the people who use it."
          </blockquote>

          {/* LinkedIn CTA */}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="dc-linkedin"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              width:          '100%',
              padding:        anchor === 'header' ? '9px 0' : '10px 0',
              borderRadius:   '10px',
              border:         '1.5px solid #1D4ED8',
              background:     'transparent',
              color:          '#1D4ED8',
              fontFamily:     '"DM Sans", system-ui, sans-serif',
              fontWeight:     600,
              fontSize:       anchor === 'header' ? '0.8rem' : '0.875rem',
              textDecoration: 'none',
              cursor:         'pointer',
              transition:     'background 0.18s, color 0.18s, border-color 0.18s',
              letterSpacing:  '-0.01em',
            }}
          >
            <LinkedInIcon />
            Connect on LinkedIn
          </a>
        </div>

        {/* ── Footer section ───────────────────────────────────────── */}
        <div style={{
          padding:    anchor === 'header' ? '10px 16px' : '12px 24px',
          background: '#F7F6F3',
          borderTop:  '1px solid #E7E5E4',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{
            fontFamily:    '"DM Mono", monospace',
            fontSize:      anchor === 'header' ? '0.58rem' : '0.65rem',
            color:         '#A8A29E',
            letterSpacing: '0.04em',
          }}>
            Made with <HeartSpan /> in India
          </p>
          <p style={{
            fontFamily:    '"DM Mono", monospace',
            fontSize:      anchor === 'header' ? '0.58rem' : '0.65rem',
            color:         '#A8A29E',
            letterSpacing: '0.04em',
          }}>
            Glancify · 2025–26
          </p>
        </div>
      </div>
    </>
  );
}

/* ── Small reusable atoms ─────────────────────────────────────────────────── */

function HeartSpan() {
  return (
    <>
      <style>{`
        @keyframes hb {
          0%,100%{ transform:scale(1) }
          20%    { transform:scale(1.3) }
          40%    { transform:scale(1) }
          60%    { transform:scale(1.15) }
        }
      `}</style>
      <span
        aria-label="love"
        style={{
          color:    '#DC2626',
          display:  'inline-block',
          animation:'hb 2s ease-in-out infinite',
        }}
      >♥</span>
    </>
  );
}

function LinkedInIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
