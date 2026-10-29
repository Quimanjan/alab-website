import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Coconut from '../components/Coconut.jsx';
import Grill from '../components/Grill.jsx';
import StoryScroll from '../components/StoryScroll.jsx';
import BudgetCalc from '../components/BudgetCalc.jsx';
import CountUp from '../components/fx/CountUp.jsx';
import { burstFrom, toast } from '../lib/fx.js';
import { BriquetteArt } from '../components/Art.jsx';
import { Arrow, Check, Leaf, featureIcon } from '../components/Icons.jsx';
import { Head, Reveal } from '../components/UI.jsx';
import { RatingSummary, ReviewCard } from '../components/Reviews.jsx';
import { useReviews } from '../lib/reviews.js';
import { csr, features, prices, survey } from '../data/plan.js';
import { site } from '../data/site.js';

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <div className="wrap">
        <Why />
      </div>
      <StoryScroll />
      <div className="wrap">
        <Showcase />
        <section className="block" id="calculator">
          <Reveal>
            <Head eyebrow="Plan your fire" title={<>Your budget, <em>maximized.</em></>} side="Bigger packs cost less per kilo. Find the mix that stretches your monthly charcoal money the furthest." />
          </Reveal>
          <Reveal><BudgetCalc /></Reveal>
        </section>
      </div>
      <div className="wrap"><SustainBanner /></div>
      <div className="wrap">
        <ReviewsPreview />
        <Channels />
      </div>
    </>
  );
}

function useCoconutCounter() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/counter').then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive && d) setCount(d.coconuts); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const add = useCallback(() => {
    setCount((c) => (c == null ? c : c + 1));
    fetch('/api/counter', { method: 'POST' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && !d.throttled) setCount(d.coconuts); }).catch(() => {});
  }, []);
  return [count, add];
}

const headline = [['Fire,', ''], ['refined.', 'ember'], ['|'], ['Smoke,', ''], ['reduced.', '']];

function Hero() {
  const arena = useRef(null);
  const grillRef = useRef(null);
  const cocoRef = useRef(null);
  const [lit, setLit] = useState(false);
  const [over, setOver] = useState(false);
  const [mine, setMine] = useState(0);
  const [count, addCount] = useCoconutCounter();
  const litTimer = useRef(0);
  const mineRef = useRef(0);

  const onLand = useCallback(() => {
    setLit(true);
    const n = (mineRef.current += 1);
    setMine(n);
    if (n === 1) toast('Waste to warmth! That shell would have been thrown away.');
    if (n === 5) toast('5 coconuts! You’re a natural ihaw-ihaw master.');
    if (n === 10) toast('10 shells saved. The planet thanks you.');
    addCount();
    burstFrom(grillRef.current, { count: 70, power: 1.4, spread: Math.PI * 0.9 });
    clearTimeout(litTimer.current);
    litTimer.current = setTimeout(() => setLit(false), 5200);
  }, [addCount]);

  useEffect(() => () => clearTimeout(litTimer.current), []);

  return (
    <section className={`hero${lit ? ' is-lit' : ''}`} ref={arena}>
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">Coconut shell + rice husk charcoal</span>
          <h1 aria-label="Fire, refined. Smoke, reduced.">
            {headline.map(([word, cls], i) =>
              word === '|' ? <br key={i} /> : (
                <span key={i} aria-hidden="true"><span className={`hw ${cls}`} style={{ animationDelay: `${120 + i * 110}ms` }}>{word}</span>{' '}</span>
              ),
            )}
          </h1>
          <p className="lead">
            Eco-friendly charcoal briquettes carbonized from coconut shells and rice husks, bound with natural cassava starch.
            High heat, long burn, low smoke — made in Brgy. Citrus, San Jose del Monte, from farm waste.
          </p>
          <div className="btn-row">
            <Link to="/products" className="btn fire">See the briquettes <Arrow size={16} /></Link>
            <Link to="/process" className="btn line">See how it’s made</Link>
          </div>
          <div className="trust">
            <div className="tpill"><CountUp as="b" value="₱60" /><span>per kg<br />starting price</span></div>
            <div className="tpill"><CountUp as="b" value="100%" /><span>agricultural<br />waste</span></div>
            <div className="tpill"><b>0</b><span>chemical<br />binders</span></div>
          </div>
        </div>
        <div className="visual">
          <div className="img">
            <img src="/images/hero-logo-scene.jpg" alt="ALAB logo surrounded by charcoal, coconut shells and rice husk" width="720" height="716" fetchpriority="high" />
          </div>
          <div className="float">
            <CountUp as="b" value="76.9%" />
            <span>of 203 locals surveyed would switch to ALAB for a longer burn</span>
          </div>
          <span className="chip leaf badge-eco"><Leaf size={15} /> Natural · Low smoke · Local</span>
          <Grill ref={grillRef} lit={lit} over={over} onClick={() => cocoRef.current?.throwToGrill()} />
          <Coconut ref={cocoRef} arenaRef={arena} targetRef={grillRef} onLand={onLand} onOver={setOver} />
        </div>
      </div>
      <div className="wrap">
        <p className="coco-counter" aria-live="polite">
          <span className="dot" />
          <span>
            {count != null
              ? <><b>{count.toLocaleString()}</b> coconuts turned into warmth by visitors{mine ? <> · <b>{mine}</b> by you</> : null}</>
              : mine ? <><b>{mine}</b> coconuts turned into warmth by you</> : <>Throw the coconut on the grill — every shell counts</>}
          </span>
        </p>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ['Waste to Warmth', 'Coconut shell', 'Rice husk', 'Cassava starch binder', 'Long burn', 'High heat', 'Low smoke', 'Made in Brgy. Citrus', 'No chemicals'];
  const row = items.map((t) => <span key={t}>{t}<i aria-hidden="true">✦</i></span>);
  return (
    <div className="marquee" aria-label={items.join(', ')}>
      <div className="marquee-track" aria-hidden="true">{row}{row}</div>
    </div>
  );
}

function Why() {
  return (
    <section className="block">
      <Reveal>
        <Head
          eyebrow="Why ALAB"
          title={<>Better heat.<br /><em>Better for the planet.</em></>}
          side="Built around what 203 local charcoal users told us matters most — burn time first, then price."
        />
      </Reveal>
      <div className="grid-4">
        {features.map((f, i) => {
          const Icon = featureIcon[f.key];
          return (
            <Reveal key={f.key} delay={i * 80} className="card glow fc tilt">
              <span className="n">0{i + 1}</span>
              <div className={`ic${i > 1 ? ' leaf' : ''}`}><Icon size={26} /></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Showcase() {
  const [pick, setPick] = useState(0);
  const p = prices[pick];
  return (
    <section className="block">
      <Reveal>
        <Head
          eyebrow="Product showcase"
          title={<>The <em>briquette,</em> up close.</>}
          side="One briquette, three pack sizes — for the home kalan, the BBQ stall, and the samgyupsalan."
        />
      </Reveal>
      <div className="product">
        <Reveal className="pimg tilt">
          <img src="/images/briquettes-dark.jpg" alt="Actual ALAB charcoal briquettes — solid cylinders with a center air hole" loading="lazy" />
          <span className="chip lbl">Actual ALAB briquettes</span>
        </Reveal>
        <Reveal className="card pcard" delay={100}>
          <span className="eyebrow">ALAB Charcoal Briquettes</span>
          <h3>Coconut shell &amp; rice husk charcoal</h3>
          <p className="mute" style={{ margin: 0, lineHeight: 1.65 }}>
            Solid cylinders with a center air hole for an even, steady burn. Made from 100% agricultural waste with a natural cassava-starch binder.
          </p>
          <div className="price-big">
            <b>₱{p.price}</b>
            <span className="mute">/ {p.size} pack</span>
          </div>
          <div className="sizes" role="radiogroup" aria-label="Pack size">
            {prices.map((x, i) => (
              <button type="button" role="radio" aria-checked={pick === i} key={x.size} className={`sz${pick === i ? ' on' : ''}`} onClick={() => setPick(i)}>
                <b>{x.size}</b>
                <span>₱{x.price} · {x.target.split(',')[0]}</span>
                {x.note && <em>{x.note.toUpperCase()}</em>}
              </button>
            ))}
          </div>
          <ul className="checks">
            <li><Check size={16} />High heat for grilling &amp; BBQ</li>
            <li><Check size={16} />Steady, long-lasting burn</li>
            <li><Check size={16} />Low smoke, natural binder</li>
            <li><Check size={16} />Free delivery ≤ 2 km on 5 kg</li>
          </ul>
          <div className="btn-row" style={{ marginTop: 'auto' }}>
            <Link to="/visit" className="btn fire" style={{ flex: 1 }}>Where to buy</Link>
            <a href="#calculator" className="btn line">Plan my budget</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SustainBanner() {
  const by = Object.fromEntries(survey.questions.map((q) => [q.id, q]));
  const voices = [
    { k: 'Where they want to buy', q: '“At the sari-sari store.”', pct: by.where.data[0].pct },
    { k: 'Monthly charcoal budget', q: '“₱100 to ₱300 a month.”', pct: by.spend.data[0].pct },
    { k: 'Would they switch?', q: '“Definitely yes.”', pct: by.switch.data[0].pct },
  ];
  return (
    <Reveal as="section" className="block sus">
      <img className="bg" src="/images/fire.jpg" alt="" loading="lazy" />
      <div className="sgrid">
        <div>
          <span className="eyebrow leaf">Sustainability at our core</span>
          <h2 className="title" style={{ fontSize: 'clamp(40px,5vw,60px)' }}>Nothing wasted.<br /><em>Everything warm.</em></h2>
          <p style={{ color: 'var(--cream2)', lineHeight: 1.7, maxWidth: 480, fontSize: 17, marginTop: 22 }}>
            Through our {csr.title}, ALAB buys or accepts discarded shells from local vendors and farmers — less waste in the fields, extra income for suppliers, and no wood needed for our charcoal.
          </p>
          <Link to="/sustainability" className="btn line" style={{ marginTop: 10 }}>Our impact <Arrow size={16} /></Link>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="glass sc"><CountUp as="b" value="76.9%" /><span>of locals surveyed would switch to ALAB for a longer burn</span></div>
          <div className="glass sc"><CountUp as="b" value="46.3%" /><span>rank burn time as the #1 factor when buying charcoal</span></div>
          <div className="glass sc"><CountUp as="b" value="80.8%" /><span>use charcoal at least once every week</span></div>
        </div>
      </div>
      <div className="grid-3" style={{ marginTop: 36 }}>
        {voices.map((v) => (
          <div className="glass" style={{ padding: 22 }} key={v.k}>
            <span className="mute" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>{v.k}</span>
            <p className="serif" style={{ fontStyle: 'italic', fontSize: 19, margin: '8px 0 14px' }}>{v.q}</p>
            <div className="bar"><i style={{ width: `${v.pct}%` }} /></div>
            <p className="mute" style={{ fontSize: 13, margin: '8px 0 0' }}>{v.pct}% of respondents</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function ReviewsPreview() {
  const { reviews, stats, loading, error } = useReviews({ limit: 3 });
  return (
    <section className="block">
      <Reveal>
        <Head
          eyebrow="Ratings & feedback"
          title={<>Tried ALAB? <em>Tell us.</em></>}
          side="After you’ve used your briquettes at home or at your stall, leave a 1–5 star rating and your feedback. Every review is read by the team."
        />
      </Reveal>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Reveal>
          <RatingSummary stats={stats} loading={loading} />
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link to="/reviews#rate" className="btn fire">Rate ALAB</Link>
            <Link to="/reviews" className="btn line">Read all reviews</Link>
          </div>
        </Reveal>
        <Reveal delay={100} style={{ display: 'grid', gap: 14 }}>
          {error && <div className="notice bad">{error}</div>}
          {!error && !loading && reviews.length === 0 && (
            <div className="card empty">
              <BriquetteArt size={90} />
              <b>No reviews yet</b>
              <p className="mute" style={{ margin: 0 }}>Be the first to rate ALAB after you try it.</p>
            </div>
          )}
          {loading && reviews.length === 0 && [0, 1].map((i) => <div key={i} className="skel" style={{ height: 130 }} />)}
          {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
        </Reveal>
      </div>
    </section>
  );
}

export function Channels() {
  return (
    <Reveal as="section" className="block cta">
      <div>
        <span className="eyebrow">Get your ALAB</span>
        <h2 className="title">Light it up <em>tonight.</em></h2>
        <p className="mute" style={{ lineHeight: 1.7, maxWidth: 470, margin: '18px 0 28px' }}>
          Message us on our pages, walk in at {site.addressShort}, or ask your suki sari-sari store. Free delivery within 2 km on 5 kg packs; Lalamove / MoveIt for farther areas.
        </p>
        <Link to="/visit" className="btn fire">Visit &amp; where to buy</Link>
      </div>
      <div className="chan">
        {site.channels.map((c) =>
          c.url ? (
            <a key={c.name} className="ch" href={c.url} target="_blank" rel="noreferrer"><i /><span>{c.name}<small>{c.note}</small></span></a>
          ) : (
            <div key={c.name} className="ch soon"><i /><span>{c.name}<small>Link coming soon</small></span></div>
          ),
        )}
        <Link to="/visit" className="ch"><i /><span>Walk-in pick-up<small>Sat–Thu · 8 AM – 5 PM</small></span></Link>
      </div>
    </Reveal>
  );
}
