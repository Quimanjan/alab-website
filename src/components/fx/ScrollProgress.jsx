import { useEffect, useRef, useState } from 'react';

/** Ember-colored reading progress bar at the top + a "back to top" flame button. */
export default function ScrollProgress() {
  const bar = useRef(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setShowTop(window.scrollY > window.innerHeight * 1.2);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><i ref={bar} /></div>
      <button
        type="button"
        className={`to-top magnetic${showTop ? ' show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <svg width="22" height="25" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2c6 8 14 13 14 25a14 14 0 01-28 0c0-7 4-11 7-16 2 4 4 7 7 7 0-7-3-11 0-16z" fill="currentColor" /></svg>
      </button>
    </>
  );
}
