import { useState, useEffect } from 'react';
import DeveloperCard from '../components/DeveloperCard';

/*
  Only the Footer export is changed — the trigger text now opens DeveloperCard.
  Everything else in this file is identical to the previous version.
*/

const STATS = [
  { value: '7',    label: 'Categories'    },
  { value: '200',  label: 'Stories / day' },
  { value: '0',    label: 'Ads. Ever.'    },
  { value: '∞',    label: 'Readers'       },
];

export default function IntroPage({ onComplete }) {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleStart = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 420);
  };

  return (
    <>
      <style>{`
        @keyframes wordUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes drawLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes statIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position:  200% center; }
        }
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        .intro-word {
          display: inline-block;
          opacity: 0;
        }
        .intro-mounted .intro-word {
          animation: wordUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .intro-underline {
          display: block;
          height: 2px;
          background: #DC2626;
          transform-origin: left center;
          transform: scaleX(0);
        }
        .intro-mounted .intro-underline {
          animation: drawLine 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both;
        }
        .intro-stat { opacity: 0; }
        .intro-mounted .intro-stat {
          animation: statIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .intro-exit { animation: fadeOut 0.42s ease forwards; }
        .intro-cta  { position: relative; overflow: hidden; }
        .intro-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%);
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .intro-cta:hover::after { opacity: 1; animation: shimmer 0.55s ease forwards; }
        .intro-cta:active { transform: scale(0.975); }
      `}</style>

      <div
        className={[
          'fixed inset-0 z-50 flex flex-col',
          'bg-newsprint',
          mounted ? 'intro-mounted' : '',
          exiting ? 'intro-exit'   : '',
        ].join(' ')}
        style={{
          paddingTop:    'env(safe-area-inset-top,    0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft:   'env(safe-area-inset-left,   0px)',
          paddingRight:  'env(safe-area-inset-right,  0px)',
        }}
      >
        {/* Dot-grid texture */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(28,25,23,0.055) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top bar */}
        <div
          className="intro-word relative z-10 flex items-center gap-2.5 px-6 pt-6"
          style={{ animationDelay: '0.05s' }}
        >
          <img
            src="/icons/glancify mobile logo.png"
            alt=""
            className="w-7 h-7 rounded-lg"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="font-display font-bold text-lg text-ink tracking-tight">
            glanc<span className="text-scarlet">ify</span>
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col flex-1 justify-center px-6 max-w-2xl mx-auto w-full">

          <div className="intro-word mb-5" style={{ animationDelay: '0.12s' }}>
            <span className="font-mono text-xs text-slate uppercase tracking-[0.18em]">
              Your intelligent news reader
            </span>
          </div>

          <h1
            className="font-display font-bold text-ink leading-[1.08] mb-2"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 3.75rem)' }}
          >
            {[
              { word: 'The',      delay: '0.18s' },
              { word: "world's", delay: '0.26s' },
              { word: 'stories,', delay: '0.34s' },
            ].map(({ word, delay }) => (
              <span key={word}>
                <span className="intro-word" style={{ animationDelay: delay }}>{word}</span>
                {' '}
              </span>
            ))}
            <br className="hidden sm:block" />
            {[
              { word: 'beautifully', delay: '0.42s' },
              { word: 'at',          delay: '0.50s' },
              { word: 'a',           delay: '0.56s' },
              { word: 'glance.',     delay: '0.63s', scarlet: true },
            ].map(({ word, delay, scarlet }) => (
              <span key={word}>
                <span
                  className="intro-word"
                  style={{
                    animationDelay: delay,
                    color:     scarlet ? '#DC2626' : 'inherit',
                    fontStyle: scarlet ? 'italic'  : 'normal',
                  }}
                >
                  {word}
                </span>
                {' '}
              </span>
            ))}
          </h1>

          <div className="mb-7 w-16">
            <span className="intro-underline" />
          </div>

          <p
            className="intro-word font-body text-slate leading-relaxed mb-10"
            style={{ animationDelay: '0.72s', fontSize: '1.05rem', maxWidth: '36ch' }}
          >
            Seven categories. Smart caching. Zero noise.
            News that respects your time — installable, offline-ready, free.
          </p>

          <div className="grid grid-cols-4 gap-4 mb-10 max-w-sm">
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className="intro-stat"
                style={{ animationDelay: `${0.8 + i * 0.07}s` }}
              >
                <p className="font-display font-bold text-ink" style={{ fontSize: '1.55rem', lineHeight: 1 }}>
                  {value}
                </p>
                <p className="font-mono text-slate mt-0.5" style={{ fontSize: '0.65rem', lineHeight: 1.4, letterSpacing: '0.04em' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="intro-word flex flex-col sm:flex-row items-start gap-3"
            style={{ animationDelay: '1.08s' }}
          >
            <button
              onClick={handleStart}
              className="intro-cta font-body font-semibold text-white bg-ink rounded-xl transition-transform active:scale-[0.975]"
              style={{
                padding:      '13px 28px',
                fontSize:     '0.95rem',
                display:      'flex',
                alignItems:   'center',
                gap:          8,
                letterSpacing:'-0.01em',
              }}
            >
              Start reading
              <svg width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            <p className="font-mono text-slate self-center" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              Free · No account · No app store
            </p>
          </div>
        </div>

        {/* Rule + footer */}
        <div
          className="intro-word relative z-10 px-6 pb-5"
          style={{ animationDelay: '1.2s' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-rule" />
            <img
              src="/icons/glancify mobile logo.png"
              alt=""
              className="w-4 h-4 opacity-30"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="flex-1 h-px bg-rule" />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Footer — shared between IntroPage and HomePage.
   "Tushar Sonkar" is now a clickable trigger for the DeveloperCard popover.
   Everything else looks identical to the previous plain-text version.
   ────────────────────────────────────────────────────────────────────────── */
export function Footer() {
  const [cardOpen, setCardOpen] = useState(false);

  return (
    <>
      <p
        className="text-center font-mono text-slate"
        style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}
      >
        Crafted with{' '}
        <HeartBeat />{' '}
        by{' '}

        {/*
          The name is a subtle button — underline on hover only,
          so it reads as plain text unless the user looks closely.
          This follows the same pattern as Vercel's "Powered by" links.
        */}
        <button
          onClick={() => setCardOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={cardOpen}
          style={{
            background:     'none',
            border:         'none',
            padding:        0,
            cursor:         'pointer',
            fontFamily:     'inherit',
            fontSize:       'inherit',
            letterSpacing:  'inherit',
            color:          '#1C1917',
            fontWeight:     500,
            textDecoration: 'none',
            borderBottom:   '1px dotted transparent',
            transition:     'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderBottomColor = '#78716C'}
          onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
        >
          Tushar Sonkar
        </button>
      </p>

      <DeveloperCard
        isOpen={cardOpen}
        onClose={() => setCardOpen(false)}
        anchor="footer"
      />
    </>
  );
}

function HeartBeat() {
  return (
    <>
      <style>{`
        @keyframes hbIntro {
          0%,100%{ transform:scale(1) }
          14%    { transform:scale(1.28) }
          28%    { transform:scale(1) }
          42%    { transform:scale(1.14) }
          56%    { transform:scale(1) }
        }
      `}</style>
      <span
        aria-label="love"
        style={{
          color:     '#DC2626',
          display:   'inline-block',
          animation: 'hbIntro 1.8s ease-in-out infinite',
        }}
      >♥</span>
    </>
  );
}
