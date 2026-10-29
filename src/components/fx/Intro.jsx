import { useEffect, useState } from 'react';
import { burst, prefersReducedMotion } from '../../lib/fx.js';

/**
 * First-visit cinematic: a spark flickers, catches, grows into the ALAB flame,
 * the wordmark appears, then the black screen burns away from the center.
 * Shown once per browser session; click / key / "Skip" ends it early.
 */
export default function Intro() {
  const [phase, setPhase] = useState(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return 'done';
    try { if (sessionStorage.getItem('alab-intro')) return 'done'; } catch { /* storage blocked */ }
    if (window.location.pathname !== '/') return 'done';
    return 'spark';
  });

  useEffect(() => {
    if (phase === 'done') return undefined;
    try { sessionStorage.setItem('alab-intro', '1'); } catch { /* ignore */ }
    document.documentElement.style.overflow = 'hidden';
    const t = [
      setTimeout(() => setPhase('flame'), 700),
      setTimeout(() => setPhase('word'), 1500),
      setTimeout(() => { setPhase('burn'); burst(window.innerWidth / 2, window.innerHeight * 0.48, { count: 160, power: 2.2 }); }, 2700),
      setTimeout(() => setPhase('done'), 3800),
    ];
    const skip = () => { t.forEach(clearTimeout); setPhase('burn'); setTimeout(() => setPhase('done'), 900); };
    window.addEventListener('keydown', skip, { once: true });
    return () => { t.forEach(clearTimeout); window.removeEventListener('keydown', skip); document.documentElement.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'done']);

  useEffect(() => { if (phase === 'done') document.documentElement.style.overflow = ''; }, [phase]);

  if (phase === 'done') return null;
  return (
    <div className={`intro p-${phase}`} onClick={() => { setPhase('burn'); setTimeout(() => setPhase('done'), 900); }} aria-hidden="true">
      <div className="intro-core">
        <span className="intro-spark" />
        <svg className="intro-flame" viewBox="0 0 40 46">
          <defs>
            <linearGradient id="introFl" x1="20" y1="2" x2="20" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE2A8" /><stop offset=".45" stopColor="#FF9A3C" /><stop offset="1" stopColor="#E2541E" /></linearGradient>
          </defs>
          <path d="M20 2c6 8 14 13 14 25a14 14 0 01-28 0c0-7 4-11 7-16 2 4 4 7 7 7 0-7-3-11 0-16z" fill="url(#introFl)" />
          <path d="M20 24c3 4 6 6 6 11a6 6 0 01-12 0c0-4 3-6 6-11z" fill="#FFF3D6" />
        </svg>
        <div className="intro-word">ALAB</div>
        <div className="intro-tag">Waste to Warmth</div>
      </div>
      <span className="intro-skip">Click to skip</span>
    </div>
  );
}
