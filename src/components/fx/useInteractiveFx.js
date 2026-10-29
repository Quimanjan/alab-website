import { useEffect } from 'react';
import { prefersReducedMotion } from '../../lib/fx.js';

/**
 * One global pointer listener that powers three effects (event delegation, so it's cheap):
 *  • .card / .glass  → a warm spotlight follows the cursor inside the card (CSS vars --mx/--my)
 *  • .tilt           → the card tilts in 3D toward the cursor
 *  • .btn.fire, .magnetic → the button is gently pulled toward the cursor
 */
export default function useInteractiveFx() {
  useEffect(() => {
    if (!(window.matchMedia?.('(pointer: fine)').matches ?? false)) return;
    const reduced = prefersReducedMotion();
    let tiltEl = null;
    let magEl = null;

    const resetTilt = () => {
      if (!tiltEl) return;
      tiltEl.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      tiltEl.style.transform = '';
      tiltEl = null;
    };
    const resetMag = () => {
      if (!magEl) return;
      magEl.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
      magEl.style.transform = '';
      magEl = null;
    };

    const onMove = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;

      const card = t.closest('.card, .glass, .tpill');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      if (reduced) return;

      const tilt = t.closest('.tilt');
      if (tilt !== tiltEl) resetTilt();
      if (tilt) {
        tiltEl = tilt;
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transition = 'transform .12s ease-out';
        tilt.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) translateY(-4px)`;
      }

      const mag = t.closest('.btn.fire, .magnetic');
      if (mag !== magEl) resetMag();
      if (mag) {
        magEl = mag;
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transition = 'transform .15s ease-out';
        mag.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`;
      }
    };
    const onLeaveWindow = () => { resetTilt(); resetMag(); };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeaveWindow);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeaveWindow);
    };
  }, []);
}
