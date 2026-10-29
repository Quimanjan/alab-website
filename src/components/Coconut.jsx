import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CoconutArt } from './Art.jsx';
import { Move, Refresh } from './Icons.jsx';
import { burst, sfx } from '../lib/fx.js';

/**
 * A draggable coconut with simple physics.
 * Drag it, fling it, and it bounces around the arena (the hero section),
 * spinning with its speed and throwing sparks when it hits a wall.
 * Drop it on the target (the grill) and it gets "carbonized" → onLand().
 * Keyboard: arrow keys to nudge, Enter/Space to throw it on the grill, Escape to bring it home.
 */
const Coconut = forwardRef(function Coconut({ arenaRef, targetRef, onLand, onOver }, ref) {
  const homeRef = useRef(null);
  const btnRef = useRef(null);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, scale: 1, dragging: false, busy: false, raf: 0, last: 0, ox: 0, oy: 0, bounds: null, hist: [] });
  const [moved, setMoved] = useState(false);
  const [hot, setHot] = useState(false);
  const reduced = useRef(false);
  const hotRef = useRef(false);
  const overRef = useRef(false);
  const setHotOnce = useCallback((v) => { if (hotRef.current !== v) { hotRef.current = v; setHot(v); } }, []);
  const setOverOnce = useCallback((v) => { if (overRef.current !== v) { overRef.current = v; onOver?.(v); } }, [onOver]);

  useEffect(() => {
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const paint = useCallback(() => {
    const s = st.current;
    if (btnRef.current) btnRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.angle}deg) scale(${s.scale})`;
  }, []);

  const size = () => btnRef.current?.offsetWidth || 200;

  // Bounds = arena box expressed relative to the coconut's home position.
  const measure = useCallback(() => {
    const arena = arenaRef.current?.getBoundingClientRect();
    const home = homeRef.current?.getBoundingClientRect();
    if (!arena || !home) return null;
    const pad = 8;
    const b = {
      minX: arena.left - home.left + pad,
      maxX: arena.right - home.left - size() - pad,
      minY: arena.top - home.top + pad,
      maxY: arena.bottom - home.top - size() - pad,
    };
    st.current.bounds = b;
    return b;
  }, [arenaRef]);

  /** Where the grill's center is, in the coconut's local coordinates. */
  const targetLocal = () => {
    const t = targetRef?.current?.getBoundingClientRect();
    const home = homeRef.current?.getBoundingClientRect();
    if (!t || !home) return null;
    return { x: t.left + t.width / 2 - home.left - size() / 2, y: t.top + t.height * 0.42 - home.top - size() / 2, r: Math.max(t.width, t.height) * 0.5 };
  };

  const isOverTarget = () => {
    const tl = targetLocal();
    if (!tl) return false;
    const s = st.current;
    return Math.hypot(s.x - tl.x, s.y - tl.y) < tl.r + size() * 0.15;
  };

  const sparkWall = (s) => {
    const home = homeRef.current?.getBoundingClientRect();
    if (home) burst(home.left + s.x + size() / 2, home.top + s.y + size() / 2, { count: 14, power: 0.7 });
  };

  const respawn = useCallback(() => {
    const s = st.current;
    s.x = 0; s.y = 0; s.angle = -30; s.scale = 0; s.vx = s.vy = 0;
    paint();
    setMoved(false);
    if (reduced.current) { s.scale = 1; s.angle = 0; paint(); s.busy = false; return; }
    const t0 = performance.now();
    const pop = (t) => {
      const k = Math.min(1, (t - t0) / 650);
      const back = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); // easeOutBack
      s.scale = back; s.angle = -30 * (1 - k);
      paint();
      if (k < 1) s.raf = requestAnimationFrame(pop); else { s.scale = 1; paint(); s.busy = false; }
    };
    s.raf = requestAnimationFrame(pop);
  }, [paint]);

  /** Suck the coconut into the grill, then tell the parent it landed. */
  const land = useCallback(() => {
    const s = st.current;
    if (s.busy) return;
    s.busy = true;
    cancelAnimationFrame(s.raf);
    setOverOnce(false);
    setHotOnce(false);
    const tl = targetLocal() || { x: s.x, y: s.y };
    const from = { x: s.x, y: s.y, a: s.angle };
    const t0 = performance.now();
    const dur = reduced.current ? 1 : 420;
    const fall = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k * k;
      s.x = from.x + (tl.x - from.x) * e;
      s.y = from.y + (tl.y - from.y) * e;
      s.angle = from.a + 300 * e;
      s.scale = 1 - 0.85 * e;
      paint();
      if (k < 1) s.raf = requestAnimationFrame(fall);
      else {
        s.scale = 0; paint();
        onLand?.();
        setTimeout(respawn, 1100);
      }
    };
    s.raf = requestAnimationFrame(fall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLand, paint, respawn, setHotOnce, setOverOnce]);

  /** Throw the coconut in an arc from where it is into the grill. */
  const throwToGrill = useCallback(() => {
    const s = st.current;
    if (s.busy) return;
    const tl = targetLocal();
    if (!tl) return;
    if (reduced.current) { land(); return; }
    s.busy = true;
    sfx('whoosh');
    cancelAnimationFrame(s.raf);
    setMoved(true);
    const from = { x: s.x, y: s.y, a: s.angle };
    const peak = Math.min(from.y, tl.y) - 160;
    const t0 = performance.now();
    const fly = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      const x = from.x + (tl.x - from.x) * k;
      const y = (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * peak + k * k * tl.y; // quadratic arc
      s.x = x; s.y = y; s.angle = from.a + 540 * k;
      setHotOnce(true);
      paint();
      if (k < 1) s.raf = requestAnimationFrame(fly);
      else { s.busy = false; land(); }
    };
    s.raf = requestAnimationFrame(fly);
  }, [land, paint, setHotOnce]);

  useImperativeHandle(ref, () => ({ throwToGrill }), [throwToGrill]);

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
      if (hit && !reduced.current) sparkWall(s);

      const speed = Math.hypot(s.vx, s.vy);
      if (isOverTarget() && speed < 26) { s.raf = 0; land(); return; }
      setHotOnce(speed > 14);
      paint();
      if (speed > 0.15 && !s.dragging) s.raf = requestAnimationFrame(step);
      else { s.raf = 0; setHotOnce(false); }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measure, paint, setHotOnce, land],
  );

  const launch = useCallback(() => {
    const s = st.current;
    cancelAnimationFrame(s.raf);
    if (reduced.current) { s.vx = s.vy = 0; if (isOverTarget()) land(); return; }
    s.last = 0;
    s.raf = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, land]);

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
    if (s.busy) return;
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
    setOverOnce(isOverTarget());
    paint();
  };

  const onPointerUp = (e) => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    try { btnRef.current.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    if (isOverTarget()) { land(); return; }
    setOverOnce(false);
    const h = s.hist;
    const a = h[0];
    const z = h[h.length - 1];
    const ms = Math.max(16, z.t - a.t);
    s.vx = Math.max(-60, Math.min(60, ((z.x - a.x) / ms) * 16.67));
    s.vy = Math.max(-60, Math.min(60, ((z.y - a.y) / ms) * 16.67));
    if (Math.hypot(s.vx, s.vy) > 18) sfx('whoosh');
    launch();
  };

  const goHome = () => {
    const s = st.current;
    if (s.busy) return;
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
    if (!b || s.busy) return;
    const n = 28;
    const keys = { ArrowLeft: [-n, 0], ArrowRight: [n, 0], ArrowUp: [0, -n], ArrowDown: [0, n] };
    if (keys[e.key]) {
      e.preventDefault();
      s.x = Math.min(Math.max(s.x + keys[e.key][0], b.minX), b.maxX);
      s.y = Math.min(Math.max(s.y + keys[e.key][1], b.minY), b.maxY);
      s.angle += keys[e.key][0] * 0.8;
      paint();
      setMoved(true);
      if (isOverTarget()) land();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      throwToGrill();
    } else if (e.key === 'Escape') {
      goHome();
    }
  };

  return (
    <>
      <div className="coco-home" ref={homeRef}>
        <div className="coco-orbit" style={{ opacity: moved ? 0 : 1 }} />
        <span className="coco-hint" style={{ opacity: moved ? 0 : 1 }} aria-hidden="true">
          <Move size={16} />Drag it onto the grill
        </span>
        <button
          ref={btnRef}
          type="button"
          className={`coco-btn${hot ? ' hot' : ''}`}
          aria-label="Coconut. Drag it onto the grill to turn it into charcoal, or press Enter to throw it in. Arrow keys move it, Escape brings it back."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={goHome}
          onKeyDown={onKeyDown}
        >
          <CoconutArt />
        </button>
      </div>
      {moved && !st.current.busy && (
        <button type="button" className="btn line sm coco-reset" onClick={goHome}>
          <Refresh size={16} /> Bring the coconut back
        </button>
      )}
    </>
  );
});

export default Coconut;
