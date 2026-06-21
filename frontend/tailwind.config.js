/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        newsprint: '#F7F6F3',
        ink:       '#1C1917',
        slate:     '#78716C',
        scarlet:   '#DC2626',
        cobalt:    '#1D4ED8',
        parchment: '#F3F2EF',
        rule:      '#E7E5E4',
      },
      animation: {
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':     'fadeIn 0.3s ease',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'intro-reveal':'introReveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        slideUp:    { from: { transform: 'translateY(100%)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideRight: { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)',  opacity: 1 } },
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseDot:   { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.6)', opacity: 0.5 } },
        introReveal:{ from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
