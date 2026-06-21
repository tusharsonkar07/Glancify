import { useState } from 'react';

const FEATURES = [
  { icon: '⚡', label: 'Live stories, always fresh' },
  { icon: '🗂️', label: 'Tech, Sports, Business & more' },
  { icon: '📱', label: 'Installable — works like a native app' },
  { icon: '🔇', label: 'No ads. Just news.' },
];

export default function IntroPage({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        intro-bg text-white px-6 transition-opacity duration-500
        ${exiting ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cobalt/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-scarlet/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center space-y-8">

        {/* Logo mark */}
        <div className="flex justify-center">
          <img src="/icons/glancify mobile logo.png" alt="glancify" className="w-16 h-16 rounded-2xl shadow-xl" />
        </div>

        {/* Headline */}
        <div style={{ animationDelay: '0.1s' }} className="animate-intro-reveal">
          <h1 className="font-display text-5xl font-bold leading-none tracking-tight mb-2">
            Glanc<span className="text-scarlet">ify</span>
          </h1>
          <p className="text-white/60 font-body text-lg">
            Read the world's stories, beautifully.
          </p>
        </div>

        {/* Feature pills */}
        <ul
          className="space-y-3 text-left"
          style={{ animationDelay: '0.25s' }}
        >
          {FEATURES.map((f, i) => (
            <li
              key={f.label}
              className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-sm font-body animate-intro-reveal"
              style={{ animationDelay: `${0.25 + i * 0.08}s`, opacity: 0 }}
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-white/80">{f.label}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="animate-intro-reveal" style={{ opacity: 0, animationDelay: '0.65s', animationFillMode: 'forwards' }}>
          <button
            onClick={handleEnter}
            className="
              w-full py-4 rounded-xl font-body font-semibold text-base
              bg-white text-ink
              hover:bg-white/90 active:scale-95
              transition-all duration-150
              shadow-lg shadow-black/20
            "
          >
            Start Reading →
          </button>
          <p className="mt-4 text-white/30 text-xs font-mono">
            Free forever · No account needed
          </p>
        </div>
      </div>
    </div>
  );
}
