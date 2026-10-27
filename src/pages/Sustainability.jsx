import { Link } from 'react-router-dom';
import { Coin, Leaf, Recycle, Users } from '../components/Icons.jsx';
import { Head, PageHero, Reveal } from '../components/UI.jsx';
import { company, csr, differentiators, industry, wasteManagement } from '../data/plan.js';

const impacts = [
  { icon: Recycle, title: 'Less farm waste', text: 'Coconut shells and rice husks that are usually thrown away or burned in the field become useful fuel.' },
  { icon: Leaf, title: 'No trees cut', text: 'Rather than depending on wood, ALAB uses agricultural residues — an alternative to charcoal that contributes to deforestation.' },
  { icon: Coin, title: 'Income for suppliers', text: 'Buying shells and husks from local vendors and farmers gives them an additional source of income.' },
  { icon: Users, title: 'Cleaner communities', text: 'A lower-smoke fuel and proper waste handling help create cleaner homes, stalls, and neighborhoods.' },
];

export default function Sustainability() {
  return (
    <>
      <PageHero
        crumb="Sustainability"
        eyebrow="Waste to Warmth"
        title={<>Nothing wasted. <em>Everything warm.</em></>}
        lead={company.tagline.meaning}
      />
      <div className="wrap">
        <section className="block" style={{ marginTop: 50 }}>
          <Reveal className="sus" style={{ padding: '70px 56px' }}>
            <img className="bg" src="/images/fire.jpg" alt="" loading="lazy" />
            <div className="sgrid" style={{ alignItems: 'center' }}>
              <div>
                <span className="eyebrow leaf">CSR &amp; green marketing</span>
                <h2 className="title">{csr.title}</h2>
                <p style={{ color: 'var(--cream2)', lineHeight: 1.75, marginTop: 20, fontSize: 16.5 }}>{csr.text}</p>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                {['Partner with coconut vendors, farmers & barangays', 'Collect discarded shells — bought or accepted', 'Carbonize & press into ALAB briquettes', 'Show customers the “Waste-to-Heat” journey'].map((s, i) => (
                  <div className="glass sc" key={s} style={{ padding: '18px 22px' }}>
                    <b style={{ fontSize: 30, minWidth: 54 }}>0{i + 1}</b><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="block">
          <Reveal><Head eyebrow="Our impact" title={<>Good for the grill. <em>Kind to the land.</em></>} side={company.mission} /></Reveal>
          <div className="grid-4">
            {impacts.map((m, i) => (
              <Reveal key={m.title} delay={i * 70} className="card glow fc">
                <div className={`ic${i % 2 ? '' : ' leaf'}`}><m.icon size={26} /></div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="grid-2" style={{ gap: 24 }}>
            <Reveal className="card pad">
              <span className="eyebrow">Why it matters</span>
              <p className="quote" style={{ marginTop: 18 }}>“Development doesn’t mean people should completely stop using charcoal — it means shifting to a more sustainable, eco-friendly, well-balanced choice of fuel.”</p>
              <p className="mute" style={{ marginTop: 18, lineHeight: 1.7 }}>
                The coconut shell charcoal segment already makes up {industry.stats[0].value} of the Philippine charcoal market — proof that farm leftovers can power everyday cooking.
              </p>
            </Reveal>
            <Reveal className="card pad" delay={80}>
              <span className="eyebrow leaf">Clean production</span>
              <h3 className="serif" style={{ fontSize: 30, fontWeight: 500, margin: '14px 0 14px' }}>Responsible from start to finish</h3>
              <p className="mute" style={{ lineHeight: 1.75 }}>{wasteManagement}</p>
              <ul className="dots" style={{ marginTop: 16 }}>
                {differentiators.slice(2).map((d) => <li key={d.title}><span><b>{d.title}.</b> {d.text}</span></li>)}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="block">
          <Reveal className="cta">
            <div>
              <span className="eyebrow">Our vision</span>
              <p className="quote" style={{ marginTop: 16 }}>{company.vision}</p>
            </div>
            <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
              <Link to="/process" className="btn fire">See how it’s made</Link>
              <Link to="/about" className="btn line">Meet the team</Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
