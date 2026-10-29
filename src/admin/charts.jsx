import { useEffect, useMemo, useRef, useState } from 'react';

// Palette validated for the dark dashboard surface (#141110):
// lightness band, chroma floor, CVD + normal-vision separation, 3:1 contrast — all PASS.
export const SERIES = ['#D2621C', '#3681D0', '#A3860F'];

const fmtDay = (iso, long) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-PH', long ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric' });
};
const niceMax = (v) => {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};

/** Area/line chart for visits & unique visitors per day, with crosshair tooltip. */
export function TrafficChart({ data, height = 300 }) {
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const [w, setW] = useState(1000);
  const [hh, setHh] = useState(height);
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => { setW(Math.max(280, Math.round(e.contentRect.width))); setHh(Math.max(160, Math.round(e.contentRect.height)) || height); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = w, H = hh, pl = 44, pr = 16, pt = 18, pb = 34;
  const iw = W - pl - pr, ih = H - pt - pb;
  const max = niceMax(Math.max(1, ...data.map((d) => d.views)));
  const x = (i) => pl + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => pt + ih - (v / max) * ih;
  const line = (k) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join('');
  const area = (k) => `${line(k)}L${x(data.length - 1)},${pt + ih}L${x(0)},${pt + ih}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t * 10) / 10);
  const labelEvery = Math.ceil(data.length / Math.max(3, Math.floor(W / 120)));

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((px - pl) / iw) * (data.length - 1))));
    setHover(i);
  };
  const last = data.length - 1;
  const h = hover != null ? data[hover] : null;

  return (
    <div className="tchart" ref={wrap} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Visits per day over ${data.length} days`}>
        <defs>
          <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SERIES[0]} stopOpacity=".38" /><stop offset="1" stopColor={SERIES[0]} stopOpacity="0" /></linearGradient>
          <linearGradient id="gVis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SERIES[1]} stopOpacity=".22" /><stop offset="1" stopColor={SERIES[1]} stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pl - 8} y={y(t) + 4} className="axis" textAnchor="end">{t % 1 ? t : t.toLocaleString()}</text>
          </g>
        ))}
        {data.map((d, i) => ((i % labelEvery === 0 && last - i >= labelEvery * 0.6) || i === last) && (
          <text key={d.day} x={x(i)} y={H - 10} className="axis" textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}>{fmtDay(d.day)}</text>
        ))}
        <path d={area('views')} fill="url(#gViews)" className="draw-area" />
        <path d={area('visitors')} fill="url(#gVis)" className="draw-area" />
        <path d={line('views')} stroke={SERIES[0]} className="draw-line" vectorEffect="non-scaling-stroke" />
        <path d={line('visitors')} stroke={SERIES[1]} className="draw-line" vectorEffect="non-scaling-stroke" />
        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={pt + ih} className="cross" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      {h && (
        <>
          <span className="dotm" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.views) / H) * 100}%`, background: SERIES[0] }} />
          <span className="dotm" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.visitors) / H) * 100}%`, background: SERIES[1] }} />
          <div className="ttip" style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > data.length * 0.7 ? '-105%' : '12px'})` }}>
            <b>{fmtDay(h.day, true)}</b>
            <span><i style={{ background: SERIES[0] }} />Visits <strong>{h.views.toLocaleString()}</strong></span>
            <span><i style={{ background: SERIES[1] }} />Unique visitors <strong>{h.visitors.toLocaleString()}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

/** Tiny trend line for stat tiles. */
export function Sparkline({ values, color = SERIES[0] }) {
  const W = 120, H = 34;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [values.length <= 1 ? W / 2 : (i / (values.length - 1)) * W, H - 3 - (v / max) * (H - 6)]);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
  return (
    <svg className="kspark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d}L${W},${H}L0,${H}Z`} fill={color} opacity=".14" />
      <path d={d} stroke={color} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** Horizontal bars with a hover tooltip on each row. */
export function BarList({ rows, labelKey, valueKey = 'views', color = SERIES[0], format = (v) => v.toLocaleString(), empty = 'No data yet' }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  const total = rows.reduce((a, r) => a + r[valueKey], 0) || 1;
  if (!rows.length) return <p className="empty-note">{empty}</p>;
  return (
    <ul className="barlist">
      {rows.map((r) => (
        <li key={r[labelKey]} title={`${r[labelKey]}: ${format(r[valueKey])} (${Math.round((r[valueKey] / total) * 100)}%)`}>
          <div className="bl-row"><span className="bl-label">{r[labelKey]}</span><b>{format(r[valueKey])}</b></div>
          <div className="bl-track"><i style={{ width: `${(r[valueKey] / max) * 100}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Donut with legend (≤3 categories → categorical slots in fixed order). */
export function DonutChart({ rows, labelKey, valueKey = 'views', center }) {
  const [hi, setHi] = useState(null);
  const total = rows.reduce((a, r) => a + r[valueKey], 0);
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  const segs = useMemo(() => rows, [rows]);
  if (!total) return <p className="empty-note">No data yet</p>;
  return (
    <div className="donutc">
      <svg viewBox="0 0 140 140" role="img" aria-label={rows.map((r) => `${r[labelKey]} ${r[valueKey]}`).join(', ')}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#231e1b" strokeWidth="18" />
        {segs.map((r, i) => {
          const len = (r[valueKey] / total) * C;
          const el = (
            <circle key={r[labelKey]} cx="70" cy="70" r={R} fill="none" stroke={SERIES[i % SERIES.length]} strokeWidth={hi === i ? 22 : 18}
              strokeDasharray={`${Math.max(0, len - (segs.length > 1 ? 2 : 0))} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)"
              onPointerEnter={() => setHi(i)} onPointerLeave={() => setHi(null)} style={{ transition: 'stroke-width .2s' }} />
          );
          acc += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="dn-big">{hi != null ? `${Math.round((segs[hi][valueKey] / total) * 100)}%` : center ?? total.toLocaleString()}</text>
        <text x="70" y="86" textAnchor="middle" className="dn-small">{hi != null ? segs[hi][labelKey] : 'visits'}</text>
      </svg>
      <ul className="legend2">
        {segs.map((r, i) => (
          <li key={r[labelKey]} onPointerEnter={() => setHi(i)} onPointerLeave={() => setHi(null)}>
            <i style={{ background: SERIES[i % SERIES.length] }} />{r[labelKey]}<b>{Math.round((r[valueKey] / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
