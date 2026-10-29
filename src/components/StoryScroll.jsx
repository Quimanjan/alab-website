import { useEffect, useRef, useState } from 'react';
import { BriquetteArt, CoconutArt, DrumArt, MoldArt } from './Art.jsx';

const stages = [
  { k: 'Collect', t: 'Coconut shells from local vendors and rice husks from farmers — waste that usually gets thrown away or burned in the field.' },
  { k: 'Carbonize', t: 'The shells are burned with low oxygen inside a sealed carbonizer drum until they turn into pure charcoal.' },
  { k: 'Crush & bind', t: 'Cooled charcoal is pounded into fine powder, then mixed with rice husk and a cooked cassava-starch paste.' },
  { k: 'Mold & sun-dry', t: 'The mixture is pressed into solid briquettes with a center air hole and dried on bilao until firm.' },
  { k: 'Warmth', t: 'Burn-tested, weighed, and packed — ready to give long, steady, low-smoke heat to your grill.' },
];

function Flames({ size = 1 }) {
  return (
    <svg className="story-flames" viewBox="0 0 200 160" style={{ width: 220 * size }} aria-hidden="true">
      <defs>
        <linearGradient id="sfl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF5A1A" /><stop offset=".6" stopColor="#FFAE45" /><stop offset="1" stopColor="#FFF0C2" /></linearGradient>
      </defs>
      <path className="fl f1" d="M48 150c-22-34 4-56 18-84 6 28 28 34 22 84z" fill="url(#sfl)" />
      <path className="fl f2" d="M86 152c-28-48 10-84 26-124 10 42 38 54 28 124z" fill="url(#sfl)" />
      <path className="fl f3" d="M134 150c-18-30 4-50 14-74 6 24 22 30 18 74z" fill="url(#sfl)" />
      <path className="fl f4" d="M100 152c-12-22 4-38 10-54 5 16 16 22 12 54z" fill="#FFF4D6" />
    </svg>
  );
}

function Powder() {
  return (
    <svg viewBox="0 0 160 120" width="210" aria-hidden="true">
      <ellipse cx="80" cy="96" rx="70" ry="16" fill="#1A1614" />
      <path d="M14 60h132l-12 40H26z" fill="#3A322B" stroke="#5B4B3F" strokeWidth="2" />
      <ellipse cx="80" cy="60" rx="66" ry="14" fill="#14110F" />
      <path d="M30 60c14-20 86-22 100 0" fill="#262120" />
      {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={36 + (i * 37) % 90} cy={50 + (i * 13) % 12} r={1.2 + (i % 3) * 0.6} fill="#5A4D44" />)}
      <path d="M116 30c8-6 18-4 22 4" stroke="#E9B872" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" />
      <circle cx="140" cy="40" r="10" fill="#F4ECE2" opacity=".85" />
    </svg>
  );
}

export default function StoryScroll() {
  const ref = useRef(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const v = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setP(v);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  const pos = p * (stages.length - 1); // 0..4
  const active = Math.round(pos);
  const w = (i) => Math.max(0, 1 - Math.abs(pos - i) * 1.25);
  const layer = (i, extra = '') => {
    const k = w(i);
    const off = (pos - i) * -60;
    return { opacity: k, transform: `translate(-50%, calc(-50% + ${off}px)) scale(calc(var(--art, 1) * ${(0.75 + 0.25 * k).toFixed(3)})) ${extra}`, pointerEvents: 'none' };
  };
  const heat = Math.pow(p, 1.4);

  return (
    <section className="story" ref={ref} aria-label="How a coconut shell becomes ALAB charcoal">
      <div className="story-sticky">
        <div className="wrap story-grid">
          <div className="story-copy">
            <span className="eyebrow">Waste to Warmth · scroll</span>
            <h2 className="title">From shell <em>to flame.</em></h2>
            <ol className="story-steps">
              {stages.map((s, i) => (
                <li key={s.k} className={i === active ? 'on' : i < active ? 'done' : ''}>
                  <span className="n">0{i + 1}</span>
                  <div>
                    <b>{s.k}</b>
                    <p>{s.t}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="story-stage" style={{ '--heat': heat }}>
            <div className="story-glow" />
            <svg className="story-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" />
              <circle cx="50" cy="50" r="46" className="prog" style={{ strokeDashoffset: 289 * (1 - p) }} />
            </svg>
            <div className="story-layer" style={layer(0)}>
              <div style={{ position: 'relative' }}>
                <CoconutArt className="story-coco" />
                <svg viewBox="0 0 120 40" width="190" style={{ display: 'block', margin: '-10px auto 0' }} aria-hidden="true">
                  {Array.from({ length: 26 }, (_, i) => <ellipse key={i} cx={10 + (i * 41) % 100} cy={14 + (i * 7) % 20} rx="5" ry="1.6" transform={`rotate(${(i * 37) % 180} ${10 + (i * 41) % 100} ${14 + (i * 7) % 20})`} fill="#C9A06A" opacity=".8" />)}
                </svg>
              </div>
            </div>
            <div className="story-layer" style={layer(1)}>
              <div style={{ transform: 'scale(1.8)' }}><DrumArt /></div>
            </div>
            <div className="story-layer" style={layer(2)}><Powder /></div>
            <div className="story-layer" style={layer(3)}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
                <div style={{ transform: 'scale(1.5)' }}><MoldArt /></div>
                <div style={{ marginTop: -30 }}><BriquetteArt size={140} glow={false} /></div>
              </div>
            </div>
            <div className="story-layer" style={layer(4)}>
              <div className="story-final">
                <Flames size={1.15} />
                <div className="story-pile">
                  <BriquetteArt size={120} />
                  <BriquetteArt size={120} />
                  <BriquetteArt size={120} />
                </div>
              </div>
            </div>
            <div className="story-meter">
              <span>Waste</span>
              <div className="bar"><i style={{ width: `${p * 100}%` }} /></div>
              <span>Warmth</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
