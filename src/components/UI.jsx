import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from './Icons.jsx';

export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal${inView ? ' in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function PageHero({ crumb, eyebrow, title, lead, children }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {crumb && (
          <p className="crumbs"><Link to="/">Home</Link> / {crumb}</p>
        )}
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function Head({ eyebrow, title, side, leaf }) {
  return (
    <div className="head">
      <div>
        <span className={`eyebrow${leaf ? ' leaf' : ''}`}>{eyebrow}</span>
        <h2 className="title">{title}</h2>
      </div>
      {side && <p>{side}</p>}
    </div>
  );
}

export function Stars({ value = 0, size = 18, label }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={label || `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} filled={i <= rounded} />)}
    </span>
  );
}

// ── Charts (plain SVG, no library) ──
export const chartColors = ['#F28C38', '#E9B872', '#C2541E', '#8BC28C', '#7A6A5C', '#5B4B3F'];

export function Donut({ data, size = 170, thickness = 26, center }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + d.pct, 0) || 1;
  let acc = 0;
  return (
    <svg className="donut" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={data.map((d) => `${d.label} ${d.pct}%`).join(', ')}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#231e1b" strokeWidth={thickness} />
      {data.map((d, i) => {
        const len = (d.pct / total) * c;
        const seg = (
          <circle
            key={d.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={chartColors[i % chartColors.length]}
            strokeWidth={thickness}
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
            strokeDashoffset={-acc}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        acc += len;
        return seg;
      })}
      {center && (
        <>
          <text x="50%" y="48%" textAnchor="middle" fill="#F4ECE2" fontFamily="Lora, serif" fontSize="26" fontWeight="500">{center[0]}</text>
          <text x="50%" y="62%" textAnchor="middle" fill="#A89B8F" fontFamily="Inter, sans-serif" fontSize="11">{center[1]}</text>
        </>
      )}
    </svg>
  );
}

export function Legend({ data }) {
  return (
    <ul className="legend">
      {data.map((d, i) => (
        <li key={d.label}>
          <i style={{ background: chartColors[i % chartColors.length] }} />
          <span>{d.label}</span>
          <b>{d.pct}%<small>({d.n})</small></b>
        </li>
      ))}
    </ul>
  );
}

export function HBars({ data, max }) {
  const m = max || Math.max(...data.map((d) => d.pct));
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <div className="row"><span>{d.label}</span><b>{d.pct}%{d.n !== undefined && <span className="mute" style={{ fontWeight: 400 }}> · {d.n}</span>}</b></div>
          <div className="bar"><i style={{ width: `${(d.pct / m) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
