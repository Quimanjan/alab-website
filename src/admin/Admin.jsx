import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmberField from '../components/fx/EmberField.jsx';
import CountUp from '../components/fx/CountUp.jsx';
import { BarList, DonutChart, SERIES, Sparkline, TrafficChart } from './charts.jsx';
import { burst } from '../lib/fx.js';
import '../styles/admin.css';

// ───────── API helper ─────────
async function api(action, { method = 'GET', body, params = '' } = {}) {
  const res = await fetch(`/api/admin?action=${action}${params}`, {
    method,
    credentials: 'same-origin',
    headers: method === 'POST' ? { 'Content-Type': 'application/json', 'X-Alab-Admin': '1' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.field = data.field; throw e; }
  return data;
}

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const I = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  star: <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  out: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6A17 17 0 002 12s3.5 7 10 7a9.6 9.6 0 005.4-1.6" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.6" /><path d="M16.5 14.6c2.6.3 4.3 2.2 5 5" /></>,
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  flame: <path d="M12 2c3 4 6 6 6 11a6 6 0 01-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z" />,
  refresh: <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></>,
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  warn: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></>,
};

function Stars({ value, size = 14 }) {
  return (
    <span className="a-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <svg key={n} width={size} height={size} viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={n <= Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" /></svg>)}
    </span>
  );
}

// ───────── Root ─────────
export default function Admin() {
  const [me, setMe] = useState(undefined); // undefined = checking, null = logged out

  useEffect(() => {
    document.title = 'Admin — ALAB Eco Briquettes';
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    api('me').then(setMe).catch(() => setMe(null));
    return () => meta.remove();
  }, []);

  if (me === undefined) return <div className="adm-boot"><span className="spin" /></div>;
  return me ? <Dashboard me={me} setMe={setMe} /> : <Login onIn={setMe} />;
}

// ───────── Login ─────────
function Login({ onIn }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (!u || !p) { setErr('Enter your username and password.'); setShake((n) => n + 1); return; }
    setBusy(true); setErr('');
    try {
      const me = await api('login', { method: 'POST', body: { username: u, password: p } });
      const r = e.target.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + 40, { count: 100, power: 1.6 });
      setTimeout(() => onIn(me), 450);
    } catch (ex) {
      setErr(ex.message); setShake((n) => n + 1); setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <EmberField />
      <div className="login-glow" aria-hidden="true" />
      <div className="login-brand">
        <img src="/images/emblem.jpg" alt="" width="84" height="84" />
        <h1>ALAB <span>Control Room</span></h1>
        <p>Ratings, feedback, and website traffic — all in one place.</p>
      </div>
      <form key={shake} className={`login-card${shake ? ' shake' : ''}`} onSubmit={submit} noValidate>
        <h2>Sign in</h2>
        <p className="lc-sub">Admins only</p>
        <label className="a-field">
          <span>Username</span>
          <div className="a-input"><Icon d={I.user} size={18} /><input autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} autoFocus /></div>
        </label>
        <label className="a-field">
          <span>Password</span>
          <div className="a-input">
            <Icon d={I.lock} size={18} />
            <input type={show ? 'text' : 'password'} autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} />
            <button type="button" className="ghost-ic" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon d={show ? I.eyeOff : I.eye} size={18} /></button>
          </div>
        </label>
        {err && <div className="a-err" role="alert">{err}</div>}
        <button className="a-btn primary wide" type="submit" disabled={busy}>{busy ? <span className="spin sm" /> : 'Enter dashboard'}</button>
        <Link to="/" className="lc-back">← Back to the website</Link>
      </form>
    </div>
  );
}

// ───────── Dashboard shell ─────────
function Dashboard({ me, setMe }) {
  const [tab, setTab] = useState(() => (typeof window !== 'undefined' && window.location.hash.slice(1)) || 'overview');
  const [nav, setNav] = useState(false);
  useEffect(() => { window.history.replaceState(null, '', `#${tab}`); setNav(false); }, [tab]);

  const logout = async () => { try { await api('logout', { method: 'POST' }); } catch { /* ignore */ } setMe(null); };

  const hour = Number(new Intl.DateTimeFormat('en-PH', { hour: 'numeric', hour12: false, timeZone: 'Asia/Manila' }).format(new Date()));
  const greet = hour < 12 ? 'Magandang umaga' : hour < 18 ? 'Magandang hapon' : 'Magandang gabi';

  const tabs = [['overview', 'Overview', I.grid], ['reviews', 'Ratings & feedback', I.star], ['settings', 'Settings', I.gear]];
  return (
    <div className="adm">
      <aside className={`adm-side${nav ? ' open' : ''}`}>
        <div className="side-brand"><img src="/images/emblem.jpg" alt="" width="40" height="40" /><div><b>ALAB</b><small>Control Room</small></div></div>
        <nav>
          {tabs.map(([k, label, ic]) => (
            <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><Icon d={ic} />{label}</button>
          ))}
        </nav>
        <div className="side-foot">
          <a href="/" target="_blank" rel="noreferrer"><Icon d={I.ext} size={18} />View website</a>
          <button type="button" onClick={logout}><Icon d={I.out} size={18} />Log out</button>
          <div className="side-user"><span className="av">{me.username[0]?.toUpperCase()}</span><div><b>{me.username}</b><small>Administrator</small></div></div>
        </div>
      </aside>
      {nav && <button type="button" className="side-scrim" aria-label="Close menu" onClick={() => setNav(false)} />}

      <main className="adm-main">
        <header className="adm-top">
          <button type="button" className="menu-ic" aria-label="Open menu" onClick={() => setNav(true)}><Icon d={I.menu} /></button>
          <div>
            <p className="a-eyebrow">{new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })}</p>
            <h1>{greet}, <em>{me.username}</em></h1>
          </div>
        </header>

        {me.isDefault && (
          <div className="a-banner">
            <Icon d={I.warn} />
            <span>You’re still using the <b>default password</b>. Change it now so only your team can get in.</span>
            <button type="button" className="a-btn sm" onClick={() => setTab('settings')}>Change password</button>
          </div>
        )}

        {tab === 'overview' && <Overview goReviews={() => setTab('reviews')} />}
        {tab === 'reviews' && <ReviewsAdmin />}
        {tab === 'settings' && <Settings me={me} setMe={setMe} />}
      </main>
    </div>
  );
}

// ───────── Overview ─────────
function delta(cur, prev) {
  if (!prev) return cur ? { txt: 'New', up: true } : null;
  const d = ((cur - prev) / prev) * 100;
  return { txt: `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`, up: d >= 0 };
}

function Overview({ goReviews }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [asTable, setAsTable] = useState(false);
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([api('stats', { params: `&days=${days}` }), api('reviews')]);
      setData(s); setReviews(r.reviews); setErr(''); setUpdated(new Date());
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

  if (!data && loading) return <div className="adm-skel">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skel-box" />)}</div>;
  if (!data) return <div className="a-err">{err}</div>;

  const v = data.views;
  const daily = v.daily || [];
  const rt = data.ratings;
  const dv = delta(v.range_views, v.prev_views);
  const du = delta(v.range_visitors, v.prev_visitors);
  const ratingRows = [5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n > 1 ? 's' : ''}`, views: rt.distribution?.[n] || 0 }));
  const positive = rt.count ? Math.round((((rt.distribution?.[4] || 0) + (rt.distribution?.[5] || 0)) / rt.count) * 100) : 0;

  return (
    <div className="ov">
      <div className="ov-bar">
        <div className="seg" role="radiogroup" aria-label="Date range">
          {[7, 30, 90].map((d) => <button key={d} type="button" role="radio" aria-checked={days === d} className={days === d ? 'on' : ''} onClick={() => setDays(d)}>{d} days</button>)}
        </div>
        <span className="upd">{loading ? 'Updating…' : updated ? `Updated ${updated.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })} · auto-refresh 1 min` : ''}</span>
        <button type="button" className="a-btn ghost sm" onClick={load} aria-label="Refresh"><Icon d={I.refresh} size={16} />Refresh</button>
      </div>

      <section className="kpis">
        <Kpi icon={I.pulse} label={`Visits · ${days} days`} value={v.range_views} delta={dv} spark={daily.map((d) => d.views)} color={SERIES[0]} />
        <Kpi icon={I.users} label={`Unique visitors · ${days} days`} value={v.range_visitors} delta={du} spark={daily.map((d) => d.visitors)} color={SERIES[1]} />
        <Kpi icon={I.sun} label="Visits today" value={v.today_views} sub={`${v.today_visitors} unique · ${v.total_views.toLocaleString()} all-time`} />
        <Kpi icon={I.star} label="Average rating" value={rt.count ? rt.average.toFixed(1) : '—'} sub={<><Stars value={rt.average} /> {positive}% positive</>} />
        <Kpi icon={I.chat} label="Ratings & feedback" value={rt.count} sub={`${reviews.filter((r) => r.comment).length} with written feedback`} />
        <Kpi icon={I.flame} label="Coconuts grilled" value={data.coconuts} sub="by visitors on the homepage" />
      </section>

      <section className="a-card big">
        <div className="ac-head">
          <div><h2>Website traffic</h2><p>Visits and unique visitors per day (Philippine time)</p></div>
          <div className="ac-tools">
            <span className="lg"><i style={{ background: SERIES[0] }} />Visits</span>
            <span className="lg"><i style={{ background: SERIES[1] }} />Unique visitors</span>
            <button type="button" className="a-btn ghost sm" onClick={() => setAsTable((t) => !t)}>{asTable ? 'Show chart' : 'Show table'}</button>
          </div>
        </div>
        {asTable ? (
          <div className="a-table-wrap">
            <table className="a-table"><thead><tr><th>Day</th><th className="n">Visits</th><th className="n">Unique visitors</th></tr></thead>
              <tbody>{[...daily].reverse().map((d) => <tr key={d.day}><td>{new Date(d.day + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</td><td className="n">{d.views}</td><td className="n">{d.visitors}</td></tr>)}</tbody>
            </table>
          </div>
        ) : v.range_views ? <TrafficChart data={daily} /> : <EmptyChart />}
      </section>

      <div className="a-grid3">
        <section className="a-card">
          <div className="ac-head"><div><h2>Rating breakdown</h2><p>{rt.count} rating{rt.count === 1 ? '' : 's'} · average {rt.count ? rt.average.toFixed(1) : '—'} / 5</p></div></div>
          <div className="rating-hero">
            <b>{rt.count ? rt.average.toFixed(1) : '—'}</b><Stars value={rt.average} size={18} />
          </div>
          <BarList rows={ratingRows} labelKey="label" color={SERIES[0]} empty="No ratings yet" />
        </section>
        <section className="a-card">
          <div className="ac-head"><div><h2>Devices</h2><p>How visitors browse</p></div></div>
          <DonutChart rows={v.devices || []} labelKey="device" />
        </section>
        <section className="a-card">
          <div className="ac-head"><div><h2>Traffic sources</h2><p>Where visitors came from</p></div></div>
          <BarList rows={v.referrers || []} labelKey="source" color={SERIES[1]} />
        </section>
      </div>

      <div className="a-grid2">
        <section className="a-card">
          <div className="ac-head"><div><h2>Most visited pages</h2><p>Last {days} days</p></div></div>
          <BarList rows={(v.pages || []).map((p) => ({ ...p, path: pageName(p.path) }))} labelKey="path" color={SERIES[2]} />
        </section>
        <section className="a-card">
          <div className="ac-head"><div><h2>Latest feedback</h2><p>Newest ratings from customers</p></div><button type="button" className="a-btn ghost sm" onClick={goReviews}>See all</button></div>
          {reviews.length ? (
            <ul className="feed">
              {reviews.slice(0, 5).map((r) => (
                <li key={r.id} className={r.is_visible ? '' : 'hidden'}>
                  <span className="av">{(r.name || 'A')[0].toUpperCase()}</span>
                  <div><div className="feed-top"><b>{r.name}</b><Stars value={r.rating} size={12} /></div><p>{r.comment || <em>No written feedback</em>}</p><small>{ago(r.created_at)}{r.is_visible ? '' : ' · hidden'}</small></div>
                </li>
              ))}
            </ul>
          ) : <p className="empty-note">No feedback yet. Share the website link so customers can rate ALAB.</p>}
        </section>
      </div>
    </div>
  );
}

const pageNames = { '/': 'Home', '/products': 'Products', '/process': 'Process', '/sustainability': 'Sustainability', '/about': 'About', '/business-plan': 'Business Plan', '/reviews': 'Reviews', '/visit': 'Visit' };
const pageName = (p) => pageNames[p] || p;
function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Kpi({ icon, label, value, delta: d, sub, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi-top"><span className="kpi-ic"><Icon d={icon} size={18} /></span><span className="kpi-label">{label}</span></div>
      <div className="kpi-val">
        {typeof value === 'number' ? <CountUp as="b" value={value.toLocaleString()} duration={900} /> : <b>{value}</b>}
        {d && <span className={`kpi-delta ${d.up ? 'up' : 'down'}`}>{d.up ? '▲' : '▼'} {d.txt}<small> vs prev.</small></span>}
      </div>
      {spark ? <Sparkline values={spark} color={color} /> : <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="empty-chart">
      <Icon d={I.pulse} size={30} />
      <b>No visits recorded yet</b>
      <p>Visits are counted from now on. Share the website and this chart will fill up.</p>
    </div>
  );
}

// ───────── Reviews admin ─────────
function ReviewsAdmin() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [stars, setStars] = useState(0);
  const [vis, setVis] = useState('all');
  const [err, setErr] = useState('');

  const load = useCallback(() => api('reviews').then((d) => setRows(d.reviews)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (r) => {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_visible: !x.is_visible } : x)));
    try { await api('review', { method: 'POST', body: { id: r.id, visible: !r.is_visible } }); }
    catch (e) { setErr(e.message); load(); }
  };

  const shown = useMemo(() => (rows || []).filter((r) =>
    (!stars || r.rating === stars) &&
    (vis === 'all' || (vis === 'visible' ? r.is_visible : !r.is_visible)) &&
    (!q || `${r.name} ${r.comment} ${r.customer_type || ''}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, stars, vis]);

  const exportCsv = () => {
    const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const lines = [['Date', 'Name', 'Rating', 'Feedback', 'Customer type', 'Pack', 'Visible'].join(',')]
      .concat(shown.map((r) => [new Date(r.created_at).toLocaleString('en-PH'), r.name, r.rating, r.comment, r.customer_type, r.pack_size, r.is_visible ? 'yes' : 'no'].map(esc).join(',')));
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `alab-reviews-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <section className="a-card">
      <div className="ac-head">
        <div><h2>Ratings & feedback</h2><p>Hide anything inappropriate — hidden reviews disappear from the public website.</p></div>
        <button type="button" className="a-btn ghost sm" onClick={exportCsv} disabled={!shown.length}><Icon d={I.download} size={16} />Export CSV</button>
      </div>
      <div className="rv-filters">
        <input className="a-search" placeholder="Search name or feedback…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reviews" />
        <div className="seg">
          {[0, 5, 4, 3, 2, 1].map((n) => <button key={n} type="button" className={stars === n ? 'on' : ''} onClick={() => setStars(n)}>{n ? `${n}★` : 'All'}</button>)}
        </div>
        <div className="seg">
          {[['all', 'All'], ['visible', 'Visible'], ['hidden', 'Hidden']].map(([k, l]) => <button key={k} type="button" className={vis === k ? 'on' : ''} onClick={() => setVis(k)}>{l}</button>)}
        </div>
      </div>
      {err && <div className="a-err">{err}</div>}
      {!rows ? <div className="skel-box" style={{ height: 240 }} /> : shown.length ? (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Customer</th><th>Rating</th><th>Feedback</th><th>Date</th><th>Public</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={r.is_visible ? '' : 'dim'}>
                  <td><b>{r.name}</b><small>{[r.customer_type, r.pack_size].filter(Boolean).join(' · ') || '—'}</small></td>
                  <td><Stars value={r.rating} /></td>
                  <td className="fb">{r.comment || <em>No written feedback</em>}</td>
                  <td className="nowrap">{ago(r.created_at)}</td>
                  <td>
                    <button type="button" role="switch" aria-checked={r.is_visible} className={`switch${r.is_visible ? ' on' : ''}`} onClick={() => toggle(r)} aria-label={r.is_visible ? `Hide review by ${r.name}` : `Show review by ${r.name}`}><i /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="empty-note">{rows.length ? 'No reviews match these filters.' : 'No reviews yet.'}</p>}
    </section>
  );
}

// ───────── Settings ─────────
function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

function Settings({ me, setMe }) {
  const [username, setUsername] = useState(me.username);
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '', field: '' });
  const [busy, setBusy] = useState(false);
  const st = strength(pw);

  const save = async (e) => {
    e.preventDefault();
    if (!cur) return setMsg({ type: 'bad', text: 'Enter your current password to confirm the change.', field: 'currentPassword' });
    if (pw && pw !== pw2) return setMsg({ type: 'bad', text: 'The new passwords don’t match.', field: 'pw2' });
    const changeUser = username.trim() !== me.username;
    if (!changeUser && !pw) return setMsg({ type: 'bad', text: 'Change your username or enter a new password.', field: '' });
    setBusy(true); setMsg({ type: '', text: '', field: '' });
    try {
      const next = await api('settings', { method: 'POST', body: { currentPassword: cur, username: changeUser ? username.trim() : undefined, newPassword: pw || undefined } });
      setMe(next); setCur(''); setPw(''); setPw2('');
      setMsg({ type: 'ok', text: 'Saved! Use your new details the next time you log in.', field: '' });
      const b = e.target.querySelector('button[type=submit]')?.getBoundingClientRect();
      if (b) burst(b.left + b.width / 2, b.top + b.height / 2, { count: 60, power: 1.2 });
    } catch (ex) { setMsg({ type: 'bad', text: ex.message, field: ex.field || '' }); }
    setBusy(false);
  };

  return (
    <div className="a-grid2 settings">
      <form className="a-card" onSubmit={save} noValidate>
        <div className="ac-head"><div><h2>Account</h2><p>Change the admin username and password</p></div></div>
        <label className="a-field">
          <span>Username</span>
          <div className="a-input"><Icon d={I.user} size={18} /><input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" aria-invalid={msg.field === 'username'} /></div>
          <small>4–32 characters: letters, numbers, dot, dash or underscore.</small>
        </label>
        <div className="a-sep" />
        <label className="a-field">
          <span>New password <em>(leave blank to keep the current one)</em></span>
          <div className="a-input">
            <Icon d={I.lock} size={18} />
            <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" aria-invalid={msg.field === 'newPassword'} />
            <button type="button" className="ghost-ic" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide passwords' : 'Show passwords'}><Icon d={show ? I.eyeOff : I.eye} size={18} /></button>
          </div>
          {pw && (
            <div className={`pw-meter s${st}`}><i /><i /><i /><i /><span>{['Too weak', 'Weak', 'Okay', 'Strong', 'Very strong'][st]}</span></div>
          )}
        </label>
        <label className="a-field">
          <span>Confirm new password</span>
          <div className="a-input"><Icon d={I.lock} size={18} /><input type={show ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" aria-invalid={msg.field === 'pw2'} /></div>
        </label>
        <div className="a-sep" />
        <label className="a-field">
          <span>Current password <em>(required to save)</em></span>
          <div className="a-input"><Icon d={I.lock} size={18} /><input type={show ? 'text' : 'password'} value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" aria-invalid={msg.field === 'currentPassword'} /></div>
        </label>
        {msg.text && <div className={msg.type === 'ok' ? 'a-ok' : 'a-err'} role="status">{msg.text}</div>}
        <button type="submit" className="a-btn primary" disabled={busy}>{busy ? <span className="spin sm" /> : 'Save changes'}</button>
      </form>

      <div className="a-card tips">
        <div className="ac-head"><div><h2>Security tips</h2><p>Keep the control room safe</p></div></div>
        <ul>
          <li><b>Use 12+ characters.</b> A short sentence like “uling-na-alab-2026!” is strong and easy to remember.</li>
          <li><b>Don’t reuse</b> a password from Facebook, email, or school accounts.</li>
          <li><b>Changing the password logs out</b> every other device that was signed in.</li>
          <li>Sessions expire automatically after <b>8 hours</b>.</li>
          <li>Forgot it? A teammate with Supabase access can reset it by deleting the row in the <code>admin_users</code> table — the default login comes back on the next sign-in.</li>
        </ul>
      </div>
    </div>
  );
}
