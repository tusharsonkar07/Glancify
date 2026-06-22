import { useState } from 'react';

/* ─── Feature data ───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⚡',
    title: 'Always fresh',
    desc:  'Stories refresh every 20 minutes, server-side',
    color: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.2)',
  },
  {
    icon: '🗂️',
    title: 'Seven categories',
    desc:  'Tech · Sports · Business · Health & more',
    color: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.2)',
  },
  {
    icon: '📲',
    title: 'Install & go',
    desc:  'Add to home screen, works perfectly offline',
    color: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    icon: '✦',
    title: 'Zero ads',
    desc:  'Pure, clean news — nothing else',
    color: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.2)',
  },
];

/* ─── Title split: "Glanc" white + "ify" scarlet ────────────────────────── */
const TITLE_PARTS = [
  { text: 'Glanc', color: '#FFFFFF' },
  { text: 'ify',   color: '#DC2626' },
];

export default function IntroPage({ onComplete }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'exiting'

  const handleStart = () => {
    if (phase === 'exiting') return;
    setPhase('exiting');
    setTimeout(onComplete, 650);
  };

  return (
    <>
      {/* ── All keyframes defined inline so no Tailwind config changes needed ── */}
      <style>{`
        /* Background orb drift */
        @keyframes gOrb1 {
          0%,100% { transform: translate(0,0)   scale(1);    }
          33%      { transform: translate(50px,-40px) scale(1.06); }
          66%      { transform: translate(-30px,25px) scale(0.97); }
        }
        @keyframes gOrb2 {
          0%,100% { transform: translate(0,0)   scale(1);    }
          40%      { transform: translate(-60px,40px) scale(1.1);  }
          70%      { transform: translate(35px,-50px) scale(0.94); }
        }
        @keyframes gOrb3 {
          0%,100% { transform: translate(0,0)  scale(1);    }
          50%      { transform: translate(25px,45px) scale(1.04); }
        }

        /* Logo spring in */
        @keyframes logoBounce {
          0%   { opacity:0; transform:scale(0.3) translateY(-24px); }
          55%  { opacity:1; transform:scale(1.1) translateY(0);     }
          75%  { transform:scale(0.94);                             }
          90%  { transform:scale(1.03);                             }
          100% { opacity:1; transform:scale(1) translateY(0);       }
        }

        /* Per-letter blur + rise */
        @keyframes letterIn {
          from { opacity:0; transform:translateY(18px); filter:blur(10px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0);    }
        }

        /* Tagline gentle drift up */
        @keyframes tagUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        /* Feature card slide up */
        @keyframes cardUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        /* Button shimmer sweep */
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* Subtle button pulse glow */
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 6px 24px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 8px 36px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.5); }
        }

        /* Scroll ticker */
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Page exit */
        @keyframes pageExit {
          0%   { opacity:1; transform:scale(1);    filter:blur(0);   }
          40%  { opacity:1; transform:scale(0.97); filter:blur(0);   }
          100% { opacity:0; transform:scale(0.93); filter:blur(6px); }
        }

        .g-orb-1 { animation: gOrb1 14s ease-in-out infinite; }
        .g-orb-2 { animation: gOrb2 17s ease-in-out infinite; }
        .g-orb-3 { animation: gOrb3 11s ease-in-out infinite; }

        .intro-logo { animation: logoBounce 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }

        .intro-tag  { animation: tagUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.85s both; }

        .intro-cta-wrap { animation: tagUp 0.55s cubic-bezier(0.22,1,0.36,1) 1.5s both; }

        .intro-cta-btn {
          animation: btnPulse 3s ease-in-out 2s infinite;
          position: relative;
          overflow: hidden;
        }
        .intro-cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0.35) 55%,
            transparent 100%);
          background-size: 200% auto;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .intro-cta-btn:hover::after {
          opacity: 1;
          animation: shimmerSweep 0.65s linear forwards;
        }
        .intro-cta-btn:active {
          transform: scale(0.96) !important;
        }

        .ticker-track { animation: ticker 28s linear infinite; }

        .intro-exit { animation: pageExit 0.65s cubic-bezier(0.4,0,1,1) forwards !important; }
      `}</style>

      {/* ── Root container ────────────────────────────────────────────────── */}
      <div
        className={phase === 'exiting' ? 'intro-exit' : ''}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     50,
          display:    'flex',
          flexDirection: 'column',
          overflow:   'hidden',
          userSelect: 'none',
          /* Rich deep background */
          background: 'radial-gradient(ellipse at 30% 0%, #0d1f3c 0%, #07070f 55%, #0a0005 100%)',
        }}
      >

        {/* ── Floating background orbs ─────────────────────────────────── */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          {/* Cobalt — top-left */}
          <div className="g-orb-1" style={{
            position: 'absolute', top: '-10%', left: '-5%',
            width: '55vmax', height: '55vmax', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,78,216,0.38) 0%, transparent 68%)',
          }} />
          {/* Scarlet — bottom-right */}
          <div className="g-orb-2" style={{
            position: 'absolute', bottom: '-15%', right: '-10%',
            width: '50vmax', height: '50vmax', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.22) 0%, transparent 65%)',
          }} />
          {/* Violet — upper-right */}
          <div className="g-orb-3" style={{
            position: 'absolute', top: '5%', right: '5%',
            width: '35vmax', height: '35vmax', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
          }} />

          {/* Fine dot-grid texture for depth */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* Horizontal hairline across mid-screen — editorial "horizon" */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)',
          }} />
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div style={{
          position:   'relative',
          zIndex:     1,
          flex:       1,
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding:    'max(env(safe-area-inset-top, 0px), 1.5rem) 1.5rem 1.5rem',
        }}>

          {/* Logo mark */}
          <div className="intro-logo" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: 22,
              background: 'linear-gradient(145deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              boxShadow: '0 20px 60px rgba(29,78,216,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <img
                src="/icons/glancify mobile logo.png"
                alt="Glancify"
                style={{ width: 48, height: 48, objectFit: 'contain', position: 'relative', zIndex: 1 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span style={{ display: 'none', fontSize: '2.25rem', zIndex: 1 }}>🌊</span>
              {/* Glass shine */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)',
              }} />
            </div>
          </div>

          {/* App name — letter by letter */}
          <h1 aria-label="Glancify" style={{
            display: 'flex', alignItems: 'flex-end',
            marginBottom: '0.6rem',
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}>
            {TITLE_PARTS.map((part) =>
              part.text.split('').map((char, ci) => {
                /* Global character index for stagger timing */
                const globalIdx = part === TITLE_PARTS[0]
                  ? ci
                  : TITLE_PARTS[0].text.length + ci;
                return (
                  <span
                    key={`${part.color}-${ci}`}
                    style={{
                      display:   'inline-block',
                      color:     part.color,
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 700,
                      fontSize:  'clamp(2.8rem, 11vw, 4.25rem)',
                      animation: `letterIn 0.52s cubic-bezier(0.22,1,0.36,1) ${0.3 + globalIdx * 0.055}s both`,
                    }}
                  >
                    {char}
                  </span>
                );
              })
            )}
          </h1>

          {/* Tagline */}
          <p className="intro-tag" style={{
            color: 'rgba(255,255,255,0.42)',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: '1rem',
            marginBottom: '2.25rem',
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}>
            Read the world, beautifully.
          </p>

          {/* Feature cards */}
          <div style={{
            width: '100%', maxWidth: 340,
            display: 'flex', flexDirection: 'column', gap: '10px',
            marginBottom: '2rem',
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderRadius: 16,
                  padding: '12px 14px',
                  background: f.color,
                  border: `1px solid ${f.border}`,
                  backdropFilter: 'blur(12px)',
                  animation: `cardUp 0.5s cubic-bezier(0.22,1,0.36,1) ${1.02 + i * 0.085}s both`,
                }}
              >
                <span style={{ fontSize: '1.25rem', width: 28, textAlign: 'center', flexShrink: 0 }}>
                  {f.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3,
                  }}>
                    {f.title}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.38)',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: '0.75rem', marginTop: 2, lineHeight: 1.4,
                  }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="intro-cta-wrap" style={{ width: '100%', maxWidth: 340 }}>
            <button
              className="intro-cta-btn"
              onClick={handleStart}
              style={{
                width: '100%',
                padding: '15px 0',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                color: '#080810',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'transform 0.12s ease',
              }}
            >
              Start Reading
              <svg width={18} height={18} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            <p style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.18)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.68rem',
              letterSpacing: '0.12em',
              marginTop: '1rem',
            }}>
              FREE FOREVER · NO ACCOUNT NEEDED
            </p>
          </div>
        </div>

        {/* ── Scrolling headline ticker at the very bottom ──────────────── */}
        <div style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)',
          overflow: 'hidden',
        }}>
          <div className="ticker-track" style={{
            display: 'flex', gap: '2.5rem',
            padding: '10px 0',
            width: 'max-content',
          }}>
            {/* Duplicate the set so it loops seamlessly */}
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{
                color: 'rgba(255,255,255,0.2)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ color: 'rgba(220,38,38,0.5)', marginRight: 8 }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Ticker content — feels like a real live news bar ───────────────────── */
const TICKER_ITEMS = [
  'BREAKING: Global markets react to latest Fed decision',
  'Tech giants unveil next-gen AI models',
  'World Cup qualifiers shake up standings',
  'Scientists discover new deep-sea species',
  'Business leaders weigh in on economic outlook',
  'Health officials release updated guidelines',
  'Entertainment awards season kicks off',
  'Climate summit reaches landmark agreement',
];
