import { Link } from 'react-router-dom';
import { Box, Check, Coin, Leaf, Recycle, Store, Truck, Users } from '../components/Icons.jsx';
import { Head, PageHero, Reveal } from '../components/UI.jsx';
import BudgetCalc from '../components/BudgetCalc.jsx';
import { company, differentiators, distribution, features, priceComparison, prices, product } from '../data/plan.js';
import { featureIcon } from '../components/Icons.jsx';

const diffIcons = [Leaf, Coin, Users, Recycle];
const distIcons = [Store, Box, Users, Truck];

export default function Products() {
  const maxP = Math.max(...priceComparison.map((p) => p.high));
  return (
    <>
      <PageHero
        crumb="Products"
        eyebrow="ALAB EcoBriquettes"
        title={<>The briquette, <em>up close.</em></>}
        lead="One product, made well: a solid charcoal briquette with a center air hole, made from coconut shell, rice husk, and natural cassava starch — in three pack sizes."
      />

      <div className="wrap">
        {/* Product detail */}
        <section className="block" style={{ marginTop: 50 }}>
          <div className="product">
            <Reveal className="pimg">
              <img src="/images/briquettes-light.jpg" alt="A pile of actual ALAB charcoal briquettes" loading="lazy" />
              <span className="chip lbl">Actual product photo</span>
            </Reveal>
            <Reveal className="card pcard" delay={80}>
              <span className="eyebrow">From the label</span>
              <h3>{product.name}</h3>
              <p className="mute" style={{ margin: 0, lineHeight: 1.7 }}>{product.labelText}</p>
              <div className="grid-2" style={{ marginTop: 26, gap: 26 }}>
                <div>
                  <h4 className="eyebrow" style={{ marginBottom: 12 }}>Ingredients</h4>
                  <ul className="dots">{product.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
                <div>
                  <h4 className="eyebrow" style={{ marginBottom: 12 }}>Usage instructions</h4>
                  <ul className="dots">{product.usage.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              </div>
              <p className="chip leaf" style={{ marginTop: 26, alignSelf: 'flex-start' }}><Check size={14} /> {product.shelfLife}</p>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section className="block">
          <Reveal><Head eyebrow="What you get" title={<>Hot, steady, <em>clean.</em></>} /></Reveal>
          <div className="grid-4">
            {features.map((f, i) => {
              const Icon = featureIcon[f.key];
              return (
                <Reveal key={f.key} delay={i * 70} className="card glow fc tilt">
                  <div className={`ic${i > 1 ? ' leaf' : ''}`}><Icon size={26} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Price list */}
        <section className="block" id="prices">
          <Reveal>
            <Head eyebrow="Price list" title={<>Pick your <em>pack.</em></>} side="Prices are per pack. Bigger packs cost less per kilo — ideal for stalls and restaurants." />
          </Reveal>
          <div className="grid-3">
            {prices.map((p, i) => (
              <Reveal key={p.size} delay={i * 80} className={`card pad${i === 1 ? ' glow' : ''}`} style={i === 1 ? { borderColor: 'rgba(242,140,56,.55)', background: 'linear-gradient(180deg,#22170f,#140f0c)' } : undefined}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow">{p.size} pack</span>
                  {p.note && <span className="chip amber">{p.note}</span>}
                </div>
                <div className="serif" style={{ fontSize: 64, fontWeight: 500, margin: '18px 0 2px', lineHeight: 1 }}>₱{p.price}</div>
                <p className="mute" style={{ margin: '0 0 22px' }}>≈ ₱{p.perKg % 1 ? p.perKg.toFixed(2) : p.perKg} per kg</p>
                <ul className="dots">
                  <li>Best for: {p.target}</li>
                  <li>{p.use}</li>
                  {p.size === '5 kg' && <li>Free delivery within 2 km</li>}
                </ul>
              </Reveal>
            ))}
          </div>
          <p className="mute" style={{ fontSize: 14, marginTop: 18 }}>
            This website is for product information and customer feedback only. To buy, see <Link to="/visit" style={{ color: 'var(--gold)' }}>where to buy</Link>.
          </p>
        </section>

        <section className="block" id="calculator">
          <Reveal><Head eyebrow="Budget planner" title={<>Stretch every <em>peso.</em></>} side="Slide to your monthly charcoal budget to see the pack mix that gets you the most kilos." /></Reveal>
          <Reveal><BudgetCalc /></Reveal>
        </section>

        {/* Price comparison */}
        <section className="block">
          <div className="grid-2" style={{ gap: 40, alignItems: 'center' }}>
            <Reveal>
              <span className="eyebrow">Price comparison</span>
              <h2 className="title">Fair price for a <em>better fuel.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>
                ALAB sits between cheap traditional uling and pricier coconut briquettes — and 82.8% of surveyed buyers spend ₱100–₱300 a month on charcoal, so a ₱60 kilo leaves room for 2 to 5 purchases a month.
              </p>
            </Reveal>
            <Reveal className="card pad" delay={80}>
              <h3 className="serif" style={{ fontSize: 22, marginBottom: 22 }}>Market price per kilo</h3>
              <div style={{ display: 'grid', gap: 18 }}>
                {priceComparison.map((p) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: p.highlight ? 'var(--amber)' : 'var(--cream2)', fontWeight: p.highlight ? 600 : 400 }}>{p.name}</span>
                      <b style={{ color: p.highlight ? 'var(--amber)' : 'var(--cream)' }}>{p.range}</b>
                    </div>
                    <div style={{ position: 'relative', height: 10, borderRadius: 9, background: '#231e1b' }}>
                      <span style={{
                        position: 'absolute', top: 0, bottom: 0, borderRadius: 9,
                        left: `${(p.low / maxP) * 100}%`,
                        width: `${Math.max(2.2, ((p.high - p.low) / maxP) * 100)}%`,
                        background: p.highlight ? 'linear-gradient(90deg,#f79a4a,#e2701f)' : '#5b4b3f',
                        boxShadow: p.highlight ? '0 0 14px rgba(242,140,56,.6)' : 'none',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 10 }} className="mute"><span>₱0</span><span>₱{maxP}</span></div>
            </Reveal>
          </div>
        </section>

        {/* Differentiation */}
        <section className="block">
          <Reveal>
            <Head eyebrow="What makes ALAB different" title={<>Not from trees. <em>From leftovers.</em></>} side={product.innovation} />
          </Reveal>
          <div className="grid-4">
            {differentiators.map((d, i) => {
              const Icon = diffIcons[i];
              return (
                <Reveal key={d.title} delay={i * 70} className="card pad">
                  <div className={`ic${i % 2 ? '' : ' leaf'}`}><Icon size={24} /></div>
                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: '22px 0 8px' }}>{d.title}</h3>
                  <p className="mute" style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>{d.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Packaging */}
        <section className="block">
          <div className="grid-2" style={{ gap: 24 }}>
            <Reveal className="card pad">
              <span className="eyebrow">Packaging &amp; labelling</span>
              <h2 className="title" style={{ fontSize: 40 }}>Clean, sealed, <em>labelled.</em></h2>
              <p className="mute" style={{ lineHeight: 1.75, marginTop: 18 }}>{product.packaging}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {['ALAB brand name', 'Product weight', 'Usage instructions', '“Waste to Warmth”', 'Recyclable materials'].map((c) => <span className="chip" key={c}>{c}</span>)}
              </div>
            </Reveal>
            <Reveal className="card pad" delay={80}>
              <span className="eyebrow">Our brand promise</span>
              <h2 className="title" style={{ fontSize: 40 }}>Sustainable. Practical. <em>Affordable.</em></h2>
              <p className="mute" style={{ lineHeight: 1.75, marginTop: 18 }}>{product.branding}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {company.values.map((v) => <span className="chip amber" key={v}>{v}</span>)}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Distribution */}
        <section className="block">
          <Reveal><Head eyebrow="Getting ALAB to you" title={<>Near you, <em>on purpose.</em></>} side="Made in Brgy. Citrus, close to the households and food stalls that use charcoal every day." /></Reveal>
          <div className="grid-4">
            {distribution.map((d, i) => {
              const Icon = distIcons[i];
              return (
                <Reveal key={d.title} delay={i * 70} className="card pad">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="ic"><Icon size={24} /></div>
                    <span className="chip">{d.tag}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: '22px 0 8px' }}>{d.title}</h3>
                  <p className="mute" style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>{d.text}</p>
                </Reveal>
              );
            })}
          </div>
          <div className="btn-row" style={{ marginTop: 26 }}>
            <Link to="/visit" className="btn fire">Visit &amp; where to buy</Link>
            <Link to="/reviews#rate" className="btn line">Already tried it? Rate ALAB</Link>
          </div>
        </section>
      </div>
    </>
  );
}
