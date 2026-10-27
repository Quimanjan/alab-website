import { Link } from 'react-router-dom';
import { Clock, Pin, Truck } from '../components/Icons.jsx';
import { PageHero, Reveal, Head } from '../components/UI.jsx';
import { Channels } from './Home.jsx';
import { distribution, orderFlow, prices, product } from '../data/plan.js';
import { site } from '../data/site.js';

const faqs = [
  { q: 'Can I buy directly on this website?', a: 'Not yet — this website is for product information and customer ratings & feedback. To buy, message us on our social media pages, walk in at our production area in Brgy. Citrus, or look for ALAB at partner sari-sari stores and stalls.' },
  { q: 'What are ALAB briquettes made of?', a: `${product.ingredients.join(', ')}. No chemicals, no additives, and no binders other than natural cassava starch.` },
  { q: 'How much do they cost?', a: prices.map((p) => `${p.size} — ₱${p.price}${p.note ? ` (${p.note})` : ''}`).join(' · ') + '.' },
  { q: 'Do you deliver?', a: 'Yes — free delivery within 2 km for orders of 5 kg and up. For farther areas we use Lalamove or MoveIt. You can also pick up at our production area.' },
  { q: 'Can I use ALAB indoors?', a: 'ALAB is for outdoor cooking, grilling, and heating. Do not use it indoors without proper ventilation.' },
  { q: 'How should I store the briquettes? Do they expire?', a: 'Keep them dry at all times — moisture reduces burning efficiency — and store them in a well-ventilated area. Kept dry, they have no expiry.' },
  { q: 'I own a sari-sari store / BBQ stall. Can I resell ALAB?', a: 'Yes! ALAB supplies sari-sari stores, BBQ stalls, samgyupsal restaurants, and grilling stations. The 3 kg and 5 kg packs give a lower price per kilo. Message us to arrange it.' },
  { q: 'Why are you closed on Fridays?', a: 'Friday is our rest day, used for cleaning, maintenance, and preparing for the following week.' },
];

export default function Visit() {
  return (
    <>
      <PageHero
        crumb="Visit"
        eyebrow="Visit & where to buy"
        title={<>Come by. <em>Bring a sack.</em></>}
        lead="Our production area in Brgy. Citrus is also where we sell — close to the households, lechon manok, and ihaw-ihaw stalls that need charcoal every day."
      />
      <div className="wrap">
        <section className="block" style={{ marginTop: 44 }}>
          <div className="grid-2" style={{ gap: 24, alignItems: 'stretch' }}>
            <Reveal className="card pad glow">
              <div className="ic"><Pin size={24} /></div>
              <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Address</span>
              <p className="serif" style={{ fontSize: 26, lineHeight: 1.3, margin: '10px 0 24px' }}>{site.address}</p>
              <div className="ic" style={{ marginTop: 6 }}><Clock size={24} /></div>
              <span className="eyebrow" style={{ display: 'block', margin: '20px 0 6px' }}>Store hours</span>
              <div className="hours">
                {site.hours.map((h) => <div key={h.days}><span>{h.days}</span><b style={{ color: h.time.startsWith('Closed') ? 'var(--mute)' : 'var(--cream)' }}>{h.time}</b></div>)}
              </div>
              {(site.phone || site.email) && (
                <p style={{ marginTop: 18 }} className="mute">
                  {site.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>}{site.phone && site.email && ' · '}
                  {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
                </p>
              )}
              <a className="btn line" style={{ marginTop: 18 }} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`} target="_blank" rel="noreferrer">Open in Google Maps</a>
            </Reveal>
            <Reveal className="map" delay={80}>
              <a className="map-fallback" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`} target="_blank" rel="noreferrer">
                <Pin size={28} /><span>Brgy. Citrus, San Jose del Monte</span><small>Map loading… tap to open in Google Maps</small>
              </a>
              <iframe
                title="Map of Brgy. Citrus, San Jose del Monte, Bulacan"
                src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
          </div>
        </section>

        <section className="block">
          <Reveal><Head eyebrow="Ways to get ALAB" title={<>Pick what’s <em>easiest.</em></>} side="Free delivery within 2 km on 5 kg packs. Lalamove / MoveIt for farther areas." /></Reveal>
          <div className="grid-4">
            {distribution.map((d, i) => (
              <Reveal key={d.title} delay={i * 70} className="card pad">
                <span className="chip amber">{d.tag}</span>
                <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: '18px 0 8px' }}>{d.title}</h3>
                <p className="mute" style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>{d.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <Reveal>
              <div className="ic"><Truck size={24} /></div>
              <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>How ordering works</span>
              <h2 className="title">Message us, <em>we’ll handle the rest.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Send an inquiry through our pages or walk in. We confirm the quantity, total, payment, and pickup or delivery — then prepare, quality-check, pack, and label your order.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <ol className="numlist">{orderFlow.map((s) => <li key={s}><div><b>{s}</b></div></li>)}</ol>
            </Reveal>
          </div>
        </section>

        <Channels />

        <section className="block" id="faq" style={{ scrollMarginTop: 110 }}>
          <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <Reveal>
              <span className="eyebrow">FAQs</span>
              <h2 className="title">Questions, <em>answered.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Still curious? Message us — or if you’ve already tried ALAB, <Link to="/reviews#rate" style={{ color: 'var(--gold)' }}>leave a rating</Link>.</p>
            </Reveal>
            <Reveal delay={80}>
              {faqs.map((f) => (
                <details className="faq" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
