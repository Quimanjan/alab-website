import { Link } from 'react-router-dom';
import { FlameMark } from '../components/Art.jsx';
import { Pin } from '../components/Icons.jsx';
import { Head, PageHero, Reveal } from '../components/UI.jsx';
import { company, credits, team } from '../data/plan.js';
import { site } from '../data/site.js';

export default function About() {
  return (
    <>
      <PageHero
        crumb="About"
        eyebrow="About ALAB"
        title={<><em>Alab</em> means flame.</>}
        lead={company.nameMeaning}
      />
      <div className="wrap">
        <section className="block" style={{ marginTop: 50 }}>
          <div className="grid-2" style={{ gap: 48, alignItems: 'center' }}>
            <Reveal className="pimg" style={{ minHeight: 480, borderRadius: 32 }}>
              <img src="/images/hero-logo-scene.jpg" alt="The ALAB logo with coconut shells, rice husk and charcoal" loading="lazy" />
            </Reveal>
            <Reveal className="prose" delay={80}>
              <span className="eyebrow">Our story</span>
              <h2 className="title" style={{ marginBottom: 22 }}>A local answer to <em>a local fire.</em></h2>
              <p>{company.description}</p>
              {company.background.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </Reveal>
          </div>
        </section>

        <section className="block">
          <div className="grid-3">
            {[
              { k: 'Vision', t: company.vision },
              { k: 'Mission', t: company.mission },
              { k: 'Goals', t: company.goals },
            ].map((x, i) => (
              <Reveal key={x.k} delay={i * 80} className="card glow pad">
                <FlameMark size={30} />
                <h3 className="serif" style={{ fontSize: 30, fontWeight: 500, margin: '18px 0 12px' }}>{x.k}</h3>
                <p className="mute" style={{ margin: 0, lineHeight: 1.75 }}>{x.t}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="grid-2" style={{ gap: 24 }}>
            <Reveal className="card pad">
              <span className="eyebrow">Nature of business</span>
              <p className="mute" style={{ lineHeight: 1.75, marginTop: 14 }}>{company.nature}</p>
            </Reveal>
            <Reveal className="card pad" delay={80}>
              <span className="eyebrow">Type of organization</span>
              <p className="mute" style={{ lineHeight: 1.75, marginTop: 14 }}>{company.organization}</p>
            </Reveal>
          </div>
        </section>

        <section className="block" id="team">
          <Reveal><Head eyebrow="The team" title={<>Six partners, <em>one flame.</em></>} side="ALAB starts small: the six partners run production, quality control, procurement, marketing, distribution, and finance themselves." /></Reveal>
          <div className="team">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 70} className={`card member${i === 0 ? ' lead-role' : ''}`}>
                <img src={m.photo} alt={m.name} width="76" height="76" loading="lazy" />
                <div><b>{m.name}</b><span>{m.role}</span></div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block" id="location">
          <div className="grid-2" style={{ gap: 40, alignItems: 'center' }}>
            <Reveal>
              <span className="eyebrow">Where we work</span>
              <h2 className="title">Brgy. Citrus, <em>San Jose del Monte.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>{company.location}</p>
              <p style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18 }}><Pin size={20} /> {site.address}</p>
              <Link to="/visit" className="btn fire" style={{ marginTop: 10 }}>Hours &amp; directions</Link>
            </Reveal>
            <Reveal className="pimg" style={{ minHeight: 420 }} delay={80}>
              <img src="/images/storefront.jpg" alt="Proposed ALAB storefront at UC 4-A1, Brgy. Citrus" loading="lazy" />
              <span className="chip lbl">Proposed front store layout</span>
            </Reveal>
          </div>
        </section>

        <section className="block">
          <Reveal className="card pad glow">
            <span className="eyebrow">Credits</span>
            <h3 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: '14px 0 12px' }}>A business plan implementation</h3>
            <p className="mute" style={{ lineHeight: 1.75, margin: 0 }}>
              ALAB was developed by {team.map((t) => t.name).join(', ')} — {credits.degree}, {credits.school}.
              With thanks to our professor, {credits.professor}, and to {credits.thanks} for her support, inspiration, and motivation — and to our families and loved ones. To God be the glory.
            </p>
          </Reveal>
        </section>
      </div>
    </>
  );
}
