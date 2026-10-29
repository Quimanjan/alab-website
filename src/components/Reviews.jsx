import { useRef, useState } from 'react';
import { burst, burstFrom } from '../lib/fx.js';
import { Star } from './Icons.jsx';
import { Stars } from './UI.jsx';
import { postReview, ratingWords, timeAgo } from '../lib/reviews.js';
import { CUSTOMER_TYPES, PACK_SIZES } from '../data/site.js';

export function RatingSummary({ stats, loading }) {
  const count = stats?.count || 0;
  const avg = stats?.average || 0;
  return (
    <div className="card glow rating-summary">
      <div className="rating-big">
        {loading && !stats ? (
          <div className="skel" style={{ height: 72, width: 120, margin: '0 auto 10px' }} />
        ) : (
          <b>{count ? avg.toFixed(1) : '—'}</b>
        )}
        <Stars value={avg} size={20} label={count ? `Average ${avg} out of 5` : 'No ratings yet'} />
        <span style={{ display: 'block', marginTop: 8 }}>
          {count ? `${count} rating${count > 1 ? 's' : ''}` : 'No ratings yet'}
        </span>
      </div>
      <div className="dist" aria-label="Rating breakdown">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = stats?.distribution?.[n] || 0;
          const pct = count ? (c / count) * 100 : 0;
          return (
            <div className="r" key={n}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{n} <Star size={13} /></span>
              <div className="bar"><i style={{ width: `${pct}%` }} /></div>
              <span className="n">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarInput({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="field">
      <span className="label" id="rating-label">Your rating</span>
      <div className="star-input" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''} — ${ratingWords[n]}`}
            className={n <= shown ? 'on' : ''}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={(e) => { onChange(n); const r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, { count: 6 + n * 4, power: 0.5 + n * 0.12 }); }}
          >
            <Star size={26} filled={n <= shown} />
          </button>
        ))}
      </div>
      <div className="star-label" aria-live="polite">{shown ? `${shown} / 5 · ${ratingWords[shown]}` : 'Tap a star to rate'}</div>
      {error && <div className="err">{error}</div>}
    </div>
  );
}

const empty = { rating: 0, name: '', comment: '', customer_type: '', pack_size: '', website: '' };

export function ReviewForm({ onPosted }) {
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);
  const submitRef = useRef(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.rating) errs.rating = 'Please choose a rating from 1 to 5 stars.';
    if (f.comment.length > 1000) errs.comment = 'Feedback must be 1,000 characters or fewer.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setStatus({ type: '', msg: '' });
    try {
      const review = await postReview({ ...f, rating: Number(f.rating) });
      setF(empty);
      setStatus({ type: 'ok', msg: 'Salamat! Your rating and feedback were posted. They help us make ALAB better.' });
      burstFrom(submitRef.current, { count: 90, power: 1.5 });
      onPosted?.(review);
    } catch (err) {
      setErrors(err.fields || {});
      setStatus({ type: 'bad', msg: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <StarInput value={f.rating} onChange={(n) => setF((s) => ({ ...s, rating: n }))} error={errors.rating} />

      <div className="field">
        <label htmlFor="rv-comment">Your feedback <span className="opt">(optional)</span></label>
        <textarea
          id="rv-comment"
          className="textarea"
          maxLength={1000}
          placeholder="How did ALAB burn for you? Heat, smoke, how long it lasted, lighting it up…"
          value={f.comment}
          onChange={set('comment')}
        />
        <div className="counter">{f.comment.length} / 1000</div>
        {errors.comment && <div className="err">{errors.comment}</div>}
      </div>

      <div className="field">
        <label htmlFor="rv-name">Your name <span className="opt">(optional — leave blank to post as Anonymous)</span></label>
        <input id="rv-name" className="input" maxLength={60} autoComplete="given-name" value={f.name} onChange={set('name')} placeholder="e.g. Aling Rosa" />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="rv-type">I am a… <span className="opt">(optional)</span></label>
          <select id="rv-type" className="select" value={f.customer_type} onChange={set('customer_type')}>
            <option value="">Select</option>
            {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.customer_type && <div className="err">{errors.customer_type}</div>}
        </div>
        <div className="field">
          <label htmlFor="rv-pack">Pack I bought <span className="opt">(optional)</span></label>
          <select id="rv-pack" className="select" value={f.pack_size} onChange={set('pack_size')}>
            <option value="">Select</option>
            {PACK_SIZES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.pack_size && <div className="err">{errors.pack_size}</div>}
        </div>
      </div>

      {/* Honeypot — hidden from people, catches spam bots */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="rv-website">Website</label>
        <input id="rv-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
      </div>

      {status.msg && <div className={`notice ${status.type}`} role="status">{status.msg}</div>}

      <div>
        <button ref={submitRef} className="btn fire" type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post my rating'}</button>
        <p className="mute" style={{ fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
          Reviews appear publicly on this page. Please don’t include phone numbers or addresses.
        </p>
      </div>
    </form>
  );
}

export function ReviewCard({ r }) {
  const initial = (r.name || 'A').trim().charAt(0).toUpperCase();
  return (
    <article className="card review">
      <div className="top">
        <div className="who">
          <span className="avatar" aria-hidden="true">{initial}</span>
          <div>
            <b>{r.name || 'Anonymous'}</b>
            <div style={{ fontSize: 12.5 }} className="mute">
              {[r.customer_type, r.pack_size && `${r.pack_size} pack`].filter(Boolean).join(' · ') || 'ALAB customer'}
            </div>
          </div>
        </div>
        <Stars value={r.rating} size={16} />
      </div>
      {r.comment ? <p>{r.comment}</p> : <p className="mute" style={{ fontStyle: 'italic' }}>Rated {r.rating} out of 5 — {ratingWords[r.rating].toLowerCase()}.</p>}
      <time dateTime={r.created_at}>{timeAgo(r.created_at)}</time>
    </article>
  );
}
