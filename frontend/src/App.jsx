import { useState, useEffect } from 'react';
import IntroPage   from './pages/IntroPage';
import HomePage    from './pages/HomePage';

export default function App() {
  // Show intro only for first-time visitors
  const [showIntro, setShowIntro] = useState(false);
  const [ready,     setReady]     = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('nw_visited');
    if (!visited) setShowIntro(true);
    setReady(true);

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // SW registration failure is non-fatal
        });
      });
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('nw_visited', '1');
    setShowIntro(false);
  };

  if (!ready) return null;

  return (
    <>
      {showIntro
        ? <IntroPage onComplete={handleIntroComplete} />
        : <HomePage />
      }
    </>
  );
}
