import { useEffect, useRef, useState } from 'react';
import { burst, prefersReducedMotion, sfx } from '../lib/fx.js';

/**
 * A real-time 3D ALAB briquette (three.js, loaded only when this scrolls into view).
 *  • drag to spin it (with inertia)
 *  • move the cursor over it to heat that spot — it glows ember-orange, then slowly cools
 *  • "Ignite" sets the whole briquette glowing and throws sparks
 */
export default function Briquette3D() {
  const mountRef = useRef(null);
  const api = useRef({});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [heat, setHeat] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      let THREE;
      try { THREE = await import('three'); } catch { setFailed(true); return; }
      if (disposed) return;
      const reduced = prefersReducedMotion();

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch { setFailed(true); return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.6, 7.2);
      camera.lookAt(0, 0, 0);

      // ── Procedural textures ──
      const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
      // Grainy charcoal surface
      const surf = makeCanvas(1024, 512);
      const sc = surf.getContext('2d');
      sc.fillStyle = '#1b1816'; sc.fillRect(0, 0, 1024, 512);
      for (let i = 0; i < 26000; i++) {
        const v = 14 + Math.random() * 46;
        sc.fillStyle = `rgba(${v + 8},${v + 2},${v - 4},${0.25 + Math.random() * 0.5})`;
        const s = Math.random() < 0.93 ? 1 + Math.random() * 2 : 3 + Math.random() * 5;
        sc.fillRect(Math.random() * 1024, Math.random() * 512, s, s);
      }
      // rice-husk flecks
      for (let i = 0; i < 260; i++) {
        sc.save(); sc.translate(Math.random() * 1024, Math.random() * 512); sc.rotate(Math.random() * Math.PI);
        sc.fillStyle = `rgba(150,110,60,${0.25 + Math.random() * 0.35})`; sc.fillRect(-5, -1, 10, 2); sc.restore();
      }
      const surfTex = new THREE.CanvasTexture(surf);
      surfTex.colorSpace = THREE.SRGBColorSpace;
      surfTex.wrapS = surfTex.wrapT = THREE.RepeatWrapping;

      // Heat map we paint into (emissive)
      const heatC = makeCanvas(512, 256);
      const hc = heatC.getContext('2d');
      hc.fillStyle = '#000'; hc.fillRect(0, 0, 512, 256);
      const heatTex = new THREE.CanvasTexture(heatC);
      heatTex.colorSpace = THREE.SRGBColorSpace;
      heatTex.wrapS = THREE.RepeatWrapping;

      // Ember cracks for the glowing ends
      const emb = makeCanvas(512, 512);
      const ec = emb.getContext('2d');
      ec.fillStyle = '#000'; ec.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 1600; i++) {
        const a = Math.random();
        ec.fillStyle = a < 0.15 ? 'rgba(255,200,110,0.95)' : a < 0.5 ? 'rgba(255,110,30,0.8)' : 'rgba(150,40,8,0.7)';
        const s = 1 + Math.random() * (a < 0.15 ? 3 : 6);
        ec.fillRect(Math.random() * 512, Math.random() * 512, s, s);
      }
      ec.strokeStyle = 'rgba(255,120,40,0.7)'; ec.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) { ec.beginPath(); let x = Math.random() * 512, y = Math.random() * 512; ec.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; ec.lineTo(x, y); } ec.stroke(); }
      const emberTex = new THREE.CanvasTexture(emb);
      emberTex.colorSpace = THREE.SRGBColorSpace;

      const bodyMat = new THREE.MeshStandardMaterial({
        map: surfTex, bumpMap: surfTex, bumpScale: 0.06, roughness: 0.95, metalness: 0.02,
        emissive: new THREE.Color('#ffffff'), emissiveMap: heatTex, emissiveIntensity: 1.5,
      });
      const capMat = new THREE.MeshStandardMaterial({ map: surfTex, bumpMap: surfTex, bumpScale: 0.08, roughness: 1, color: '#bbb', emissive: new THREE.Color('#ffffff'), emissiveMap: emberTex, emissiveIntensity: 0 });
      const holeMat = new THREE.MeshStandardMaterial({ color: '#0a0908', roughness: 1, side: THREE.BackSide, emissive: new THREE.Color('#ff5a14'), emissiveIntensity: 0 });

      // ── Geometry: tube with a center air hole ──
      const R = 0.95, r = 0.26, L = 3.2;
      const group = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.985, L, 96, 1, true), bodyMat);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 32, 1, true), holeMat);
      const capGeo = new THREE.RingGeometry(r, R, 96, 1);
      const capTop = new THREE.Mesh(capGeo, capMat); capTop.rotation.x = -Math.PI / 2; capTop.position.y = L / 2;
      const capBot = new THREE.Mesh(capGeo, capMat); capBot.rotation.x = Math.PI / 2; capBot.position.y = -L / 2;
      group.add(outer, inner, capTop, capBot);
      group.rotation.set(0.35, 0, Math.PI / 2.35);
      scene.add(group);

      // ── Lights ──
      scene.add(new THREE.AmbientLight('#4a3a30', 0.9));
      const key = new THREE.DirectionalLight('#ffe3c4', 2.2); key.position.set(3, 4, 5); scene.add(key);
      const rim = new THREE.PointLight('#ff7a2f', 18, 12, 1.6); rim.position.set(-3, -1.5, 2); scene.add(rim);
      const under = new THREE.PointLight('#ff5a14', 0, 8, 1.4); under.position.set(0, -2.2, 1.5); scene.add(under);

      // ── Interaction ──
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const st = { dragging: false, lx: 0, ly: 0, vx: 0.004, vy: 0, auto: !reduced, ignite: 0, heatSum: 0, lastBurst: 0, hovering: false };

      const resize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(mount);

      const paintHeat = (u, v, strength = 1) => {
        const x = u * 512, y = (1 - v) * 256;
        const rad = 46;
        for (const dx of [0, -512, 512]) {
          const g = hc.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
          g.addColorStop(0, `rgba(255,150,55,${Math.min(1, 0.9 * strength)})`);
          g.addColorStop(0.45, `rgba(210,60,12,${Math.min(1, 0.7 * strength)})`);
          g.addColorStop(1, 'rgba(120,20,4,0)');
          hc.globalCompositeOperation = 'lighten';
          hc.fillStyle = g; hc.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
        }
        hc.globalCompositeOperation = 'source-over';
        heatTex.needsUpdate = true;
      };

      const pick = (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        return ray.intersectObjects([outer, capTop, capBot], false)[0];
      };

      const onDown = (e) => {
        st.dragging = true; st.auto = false; st.lx = e.clientX; st.ly = e.clientY;
        renderer.domElement.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e) => {
        if (st.dragging) {
          const dx = e.clientX - st.lx, dy = e.clientY - st.ly;
          st.lx = e.clientX; st.ly = e.clientY;
          st.vx = dx * 0.006; st.vy = dy * 0.004;
          group.rotation.y += dx * 0.01;
          group.rotation.x = Math.max(-1.2, Math.min(1.4, group.rotation.x + dy * 0.008));
        }
        const hit = pick(e);
        st.hovering = !!hit;
        renderer.domElement.style.cursor = hit ? (st.dragging ? 'grabbing' : 'grab') : 'default';
        if (hit && hit.object === outer && hit.uv) {
          paintHeat(hit.uv.x, hit.uv.y, 1);
          st.heatSum = Math.min(1, st.heatSum + 0.012);
          const now = performance.now();
          if (now - st.lastBurst > 110) { st.lastBurst = now; burst(e.clientX, e.clientY, { count: 4, power: 0.45 }); }
        }
      };
      const onUp = (e) => { st.dragging = false; renderer.domElement.releasePointerCapture?.(e.pointerId); };
      const el = renderer.domElement;
      el.style.touchAction = 'pan-y';
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('pointerleave', () => { st.hovering = false; });

      api.current.ignite = () => {
        sfx('ignite');
        st.ignite = 1;
        st.heatSum = 1;
        for (let i = 0; i < 55; i++) paintHeat(Math.random(), Math.random(), 1.1);
        const r = mount.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, { count: 120, power: 1.6 });
      };
      api.current.cool = () => { st.ignite = 0; hc.fillStyle = '#000'; hc.fillRect(0, 0, 512, 256); heatTex.needsUpdate = true; st.heatSum = 0; };

      // ── Loop ──
      let raf = 0, visible = true, last = performance.now(), uiTick = 0;
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { threshold: 0.01 });
      io.observe(mount);

      const loop = (t) => {
        if (!visible || disposed) return;
        const dt = Math.min(50, t - last) / 16.67; last = t;
        if (!st.dragging) {
          if (st.auto) group.rotation.y += 0.0045 * dt;
          group.rotation.y += st.vx * dt; group.rotation.x = Math.max(-1.2, Math.min(1.4, group.rotation.x + st.vy * dt));
          st.vx *= Math.pow(0.95, dt); st.vy *= Math.pow(0.9, dt);
          if (Math.abs(st.vx) < 0.0005 && !st.hovering && !reduced) st.auto = true;
        }
        if (!reduced) group.position.y = Math.sin(t * 0.0012) * 0.06;

        // cool down the heat map slowly
        hc.fillStyle = `rgba(0,0,0,${st.ignite > 0.5 ? 0.004 : 0.018})`;
        hc.fillRect(0, 0, 512, 256);
        heatTex.needsUpdate = true;
        st.heatSum = Math.max(0, st.heatSum - 0.0025 * dt);
        st.ignite = Math.max(0, st.ignite - 0.0018 * dt);

        const glow = Math.max(st.heatSum, st.ignite);
        const flick = 0.85 + Math.sin(t * 0.013) * 0.08 + Math.sin(t * 0.031) * 0.06;
        capMat.emissiveIntensity = glow * 2.4 * flick;
        holeMat.emissiveIntensity = glow * 1.1 * flick;
        under.intensity = glow * 30 * flick;
        rim.intensity = 14 + glow * 14 * flick;

        renderer.render(scene, camera);
        if (++uiTick % 10 === 0) setHeat(Math.round(glow * 100));
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
        el.remove(); renderer.dispose();
        [bodyMat, capMat, holeMat].forEach((m) => m.dispose());
        [surfTex, heatTex, emberTex].forEach((tx) => tx.dispose());
        outer.geometry.dispose(); inner.geometry.dispose(); capGeo.dispose();
      };
    };

    // Load three.js only when the viewer is near the screen
    const lazy = new IntersectionObserver(([en]) => { if (en.isIntersecting) { lazy.disconnect(); start(); } }, { rootMargin: '300px' });
    lazy.observe(mount);
    return () => { disposed = true; lazy.disconnect(); cleanup(); };
  }, []);

  return (
    <div className="b3d">
      <div className="b3d-canvas" ref={mountRef} role="img" aria-label="Interactive 3D model of an ALAB charcoal briquette: a solid cylinder with a center air hole. Drag to spin it and move over it to heat it up." />
      {!ready && !failed && <div className="b3d-loading"><span className="spin" /> Lighting the 3D briquette…</div>}
      {failed && <img className="b3d-fallback" src="/images/briquettes-dark.jpg" alt="Actual ALAB charcoal briquettes" />}
      <div className="b3d-ui">
        <span className="chip"><b className="b3d-dot" /> Drag to spin · hover to heat</span>
        <div className="b3d-temp" aria-live="off">
          <span>Heat</span>
          <div className="bar"><i style={{ width: `${heat}%` }} /></div>
          <b>{heat}%</b>
        </div>
        <div className="btn-row">
          <button type="button" className="btn fire sm" onClick={() => api.current.ignite?.()} disabled={!ready}>Ignite it</button>
          <button type="button" className="btn line sm" onClick={() => api.current.cool?.()} disabled={!ready}>Cool down</button>
        </div>
      </div>
    </div>
  );
}
