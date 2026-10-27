import { useCallback, useEffect, useRef, useState } from 'react';
import { CoconutArt } from './Art.jsx';
import { Move, Refresh } from './Icons.jsx';

/**
 * A draggable coconut with simple physics.
 * Drag it, fling it, and it bounces around the arena (the hero section),
 * spinning with its speed and throwing sparks when it hits a wall.
 * Keyboard: arrow keys to nudge, Enter/Space to toss, Escape to bring it home.
 */
export default function Coconut({ arenaRef }) {
  const homeRef = useRef(null);
  const btnRef = useRef(null);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, dragging: false, raf: 0, last: 0, px: 0, py: 0, ox: 0, oy: 0, bounds: null, hist: [] });
  const [moved, setMoved] = useState(false);
  const [hot, setHot] = useState(false);
  const [sparks, setSparks] = useState([]);
  const reduced = useRef(false);
  const hotRef = useRef(false);
  const setHotOnce = useCallback((v) => { if (hotRef.current !== v) { hotRef.current = v; setHot(v); } }, []);

  useEffect(() => {
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const paint = useCallback(() => {
    const s = st.current;
    if (btnRef.current) btnRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.angle}deg)`;
  }, []);

  // Bounds = arena box expressed relative to the coconut's home position.
  const measure = useCallback(() => {
    const arena = arenaRef.current?.getBoundingClientRect();
    const home = homeRef.current?.getBoundingClientRect();
    const size = btnRef.current?.offsetWidth || 200;
    if (!arena || !home) return null;
    const pad = 8;
    const b = {
      minX: arena.left - home.left + pad,
      maxX: arena.right - home.left - size - pad,
      minY: arena.top - home.top + pad,
      maxY: arena.bottom - home.top - size - pad,
    };
    st.current.bounds = b;
    return b;
  }, [arenaRef]);

  const spark = useCallback((x, y) => {
    if (reduced.current) return;
    const size = btnRef.current?.offsetWidth || 200;
    const id = Math.random().toString(36).slice(2);
    const pieces = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      const d = 40 + Math.random() * 50;
      return { k: `${id}-${i}`, left: x + size / 2, top: y + size / 2, ex: Math.cos(a) * d, ey: Math.sin(a) * d };
    });
    setSparks((p) => [...p.slice(-30), ...pieces]);
    setTimeout(() => setSparks((p) => p.filter((s) => !s.k.startsWith(id))), 850);
  }, []);

  const step = useCallback(
    (t) => {
      const s = st.current;
      const dt = Math.min(32, t - (s.last || t)) / 16.67;
      s.last = t;
      const b = s.bounds || measure();
      if (!b) return;

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const friction = Math.pow(0.986, dt);
      s.vx *= friction;
      s.vy *= friction;
      s.angle += s.vx * 0.9 * dt;

      const bounce = 0.72;
      let hit = false;
      if (s.x < b.minX) { s.x = b.minX; s.vx = Math.abs(s.vx) * bounce; hit = Math.abs(s.vx) > 3; }
      if (s.x > b.maxX) { s.x = b.maxX; s.vx = -Math.abs(s.vx) * bounce; hit = hit || Math.abs(s.vx) > 3; }
      if (s.y < b.minY) { s.y = b.minY; s.vy = Math.abs(s.vy) * bounce; hit = hit || Math.abs(s.vy) > 3; }
      if (s.y > b.maxY) { s.y = b.maxY; s.vy = -Math.abs(s.vy) * bounce; hit = hit || Math.abs(s.vy) > 3; }
      if (hit) spark(s.x, s.y);

      const speed = Math.hypot(s.vx, s.vy);
      setHotOnce(speed > 14);
      paint();
      if (speed > 0.15 && !s.dragging) s.raf = requestAnimationFrame(step);
      else { s.raf = 0; setHotOnce(false); }
    },
    [measure, paint, spark, setHotOnce],
  );

  const launch = useCallback(() => {
    const s = st.current;
    cancelAnimationFrame(s.raf);
    if (reduced.current) { s.vx = s.vy = 0; return; }
    s.last = 0;
    s.raf = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    const onResize = () => {
      const b = measure();
      if (!b) return;
      const s = st.current;
      s.x = Math.min(Math.max(s.x, b.minX), b.maxX);
      s.y = Math.min(Math.max(s.y, b.minY), b.maxY);
      paint();
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(st.current.raf); };
  }, [measure, paint]);

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const s = st.current;
    cancelAnimationFrame(s.raf);
    measure();
    s.dragging = true;
    s.ox = e.clientX - s.x;
    s.oy = e.clientY - s.y;
    s.hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    btnRef.current.setPointerCapture(e.pointerId);
    setMoved(true);
  };

  const onPointerMove = (e) => {
    const s = st.current;
    if (!s.dragging) return;
    const b = s.bounds;
    const prevX = s.x;
    s.x = Math.min(Math.max(e.clientX - s.ox, b.minX), b.maxX);
    s.y = Math.min(Math.max(e.clientY - s.oy, b.minY), b.maxY);
    s.angle += (s.x - prevX) * 0.6;
    const now = performance.now();
    s.hist.push({ x: e.clientX, y: e.clientY, t: now });
    while (s.hist.length > 2 && now - s.hist[0].t > 90) s.hist.shift();
    paint();
  };

  const onPointerUp = (e) => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    try { btnRef.current.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const h = s.hist;
    const a = h[0];
    const z = h[h.length - 1];
    const ms = Math.max(16, z.t - a.t);
    s.vx = Math.max(-60, Math.min(60, ((z.x - a.x) / ms) * 16.67));
    s.vy = Math.max(-60, Math.min(60, ((z.y - a.y) / ms) * 16.67));
    launch();
  };

  const goHome = () => {
    const s = st.current;
    cancelAnimationFrame(s.raf);
    s.vx = s.vy = 0;
    const from = { x: s.x, y: s.y, a: s.angle };
    if (reduced.current) { s.x = 0; s.y = 0; s.angle = 0; paint(); setMoved(false); return; }
    const start = performance.now();
    const anim = (t) => {
      const k = Math.min(1, (t - start) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      s.x = from.x * (1 - e);
      s.y = from.y * (1 - e);
      s.angle = from.a * (1 - e);
      paint();
      if (k < 1) s.raf = requestAnimationFrame(anim);
      else setMoved(false);
    };
    s.raf = requestAnimationFrame(anim);
  };

  const onKeyDown = (e) => {
    const s = st.current;
    const b = measure();
    if (!b) return;
    const n = 28;
    const keys = { ArrowLeft: [-n, 0], ArrowRight: [n, 0], ArrowUp: [0, -n], ArrowDown: [0, n] };
    if (keys[e.key]) {
      e.preventDefault();
      s.x = Math.min(Math.max(s.x + keys[e.key][0], b.minX), b.maxX);
      s.y = Math.min(Math.max(s.y + keys[e.key][1], b.minY), b.maxY);
      s.angle += keys[e.key][0] * 0.8;
      paint();
      setMoved(true);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      s.vx = (Math.random() > 0.5 ? 1 : -1) * (22 + Math.random() * 14);
      s.vy = -(18 + Math.random() * 14);
      setMoved(true);
      launch();
    } else if (e.key === 'Escape') {
      goHome();
    }
  };

  return (
    <>
      <div className="coco-home" ref={homeRef}>
        <div className="coco-orbit" style={{ opacity: moved ? 0 : 1 }} />
        <span className="coco-hint" style={{ opacity: moved ? 0 : 1 }} aria-hidden="true">
          <Move size={16} />Drag &amp; fling the coconut
        </span>
        <button
          ref={btnRef}
          type="button"
          className={`coco-btn${hot ? ' hot' : ''}`}
          aria-label="Playful coconut. Drag and fling it around, or use arrow keys to move it, Enter to toss it, and Escape to bring it back."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={goHome}
          onKeyDown={onKeyDown}
        >
          <CoconutArt />
        </button>
        {sparks.map((p) => (
          <span key={p.k} className="spark" style={{ left: p.left, top: p.top, '--ex': `${p.ex}px`, '--ey': `${p.ey}px` }} />
        ))}
      </div>
      {moved && (
        <button type="button" className="btn line sm coco-reset" onClick={goHome}>
          <Refresh size={16} /> Bring the coconut back
        </button>
      )}
    </>
  );
}
