import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, sfx } from '../../lib/fx.js';

/**
 * Full-screen canvas of glowing embers.
 *  • a few embers always drift up from the bottom of the screen
 *  • moving the mouse leaves a short ember trail (desktop)
 *  • window event "alab:burst" throws a burst of sparks at a point
 *  • window event "alab:inferno" sends a wave of fire up the whole screen
 * Also renders a soft warm glow that follows the cursor.
 */
export default function EmberField() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now();
    const parts = [];
    const MAX = 650;
    const mouse = { x: -999, y: -999, tx: -999, ty: -999, lastX: 0, lastY: 0, seen: false };
    let infernoUntil = 0;

    // Pre-rendered glow sprite (fast to draw many times)
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sg = sprite.getContext('2d');
    const g = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,245,215,1)');
    g.addColorStop(0.18, 'rgba(255,190,110,0.9)');
    g.addColorStop(0.45, 'rgba(242,120,40,0.35)');
    g.addColorStop(1, 'rgba(226,84,30,0)');
    sg.fillStyle = g;
    sg.fillRect(0, 0, 64, 64);

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const add = (x, y, vx, vy, life, size) => {
      if (parts.length >= MAX) parts.shift();
      parts.push({ x, y, vx, vy, life, max: life, size, seed: Math.random() * 1000 });
    };

    const onBurst = (e) => {
      const { x, y, count = 40, power = 1, spread = Math.PI * 2, angle = -Math.PI / 2 } = e.detail || {};
      const n = reduced ? Math.min(8, count) : count;
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const s = (1.5 + Math.random() * 5.5) * power;
        add(x, y, Math.cos(a) * s, Math.sin(a) * s - 1, 45 + Math.random() * 55, 3 + Math.random() * 6);
      }
      wake();
    };
    const onInferno = () => {
      if (reduced) return;
      infernoUntil = performance.now() + 2600;
      wake();
    };
    const onToast = (e) => { setToastMsg(e.detail?.message || ''); clearTimeout(onToast.t); onToast.t = setTimeout(() => setToastMsg(''), 3200); };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      if (!mouse.seen) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.seen = true; }
      if (reduced) return;
      const dx = e.clientX - mouse.lastX, dy = e.clientY - mouse.lastY;
      const speed = Math.hypot(dx, dy);
      mouse.lastX = e.clientX; mouse.lastY = e.clientY;
      const n = Math.min(3, Math.floor(speed / 14));
      for (let i = 0; i < n; i++) {
        add(e.clientX + (Math.random() - 0.5) * 6, e.clientY + (Math.random() - 0.5) * 6,
          -dx * 0.03 + (Math.random() - 0.5) * 0.8, -dy * 0.03 - Math.random() * 0.8, 26 + Math.random() * 22, 2 + Math.random() * 3);
      }
      wake();
    };
    const onLeave = () => { mouse.tx = mouse.ty = -999; };

    let running = false;
    const wake = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };

    const tick = (t) => {
      const dt = Math.min(48, t - last) / 16.67;
      last = t;
      ctx.clearRect(0, 0, w, h);

      // Ambient embers rising from the bottom
      if (!reduced && Math.random() < 0.28 * dt) {
        add(Math.random() * w, h + 10, (Math.random() - 0.5) * 0.4, -(0.6 + Math.random() * 1.2), 160 + Math.random() * 160, 1.5 + Math.random() * 2.5);
      }
      // Inferno wave
      if (t < infernoUntil) {
        for (let i = 0; i < 9 * dt; i++) {
          add(Math.random() * w, h + 20, (Math.random() - 0.5) * 1.5, -(4 + Math.random() * 9), 70 + Math.random() * 60, 5 + Math.random() * 12);
        }
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0 || p.y < -40) { parts.splice(i, 1); continue; }
        const k = p.life / p.max;
        p.vy -= 0.035 * dt; // buoyancy
        p.vx += Math.sin((t + p.seed) * 0.004) * 0.025 * dt; // flicker drift
        p.vx *= 0.985; p.vy *= 0.985;
        // embers shy away from the cursor
        const mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 12000 && md > 1) { const f = (1 - md / 12000) * 0.25; p.vx += (mx / Math.sqrt(md)) * f; p.vy += (my / Math.sqrt(md)) * f; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        const s = p.size * (0.6 + 0.6 * k) * 4;
        ctx.globalAlpha = Math.min(1, k * 1.6) * (0.55 + 0.45 * Math.sin((t + p.seed) * 0.02) ** 2);
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Cursor glow (eased)
      if (finePointer && glowRef.current) {
        mouse.x += (mouse.tx - mouse.x) * 0.18 * dt;
        mouse.y += (mouse.ty - mouse.y) * 0.18 * dt;
        glowRef.current.style.transform = `translate3d(${mouse.x - 200}px, ${mouse.y - 200}px, 0)`;
        glowRef.current.style.opacity = mouse.tx < -500 ? '0' : '1';
      }

      const idle = parts.length === 0 && reduced && t > infernoUntil;
      if (idle || document.hidden) { running = false; return; }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => { if (!document.hidden) wake(); };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('alab:burst', onBurst);
    window.addEventListener('alab:inferno', onInferno);
    window.addEventListener('alab:toast', onToast);
    document.addEventListener('visibilitychange', onVis);
    wake();

    // Easter egg: type "alab" anywhere (not in a text field)
    let typed = '';
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === 'alab') {
        typed = '';
        onInferno();
        sfx('ignite');
        onToast({ detail: { message: 'Alab means flame. You found the secret fire!' } });
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('alab:burst', onBurst);
      window.removeEventListener('alab:inferno', onInferno);
      window.removeEventListener('alab:toast', onToast);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="ember-canvas" aria-hidden="true" />
      <div className={`toast${toastMsg ? ' show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </>
  );
}
