import { BriquetteArt } from '../components/Art.jsx';
import { Shield } from '../components/Icons.jsx';
import { Head, PageHero, Reveal } from '../components/UI.jsx';
import { materialHandling, materials, operationalProcess, productionSteps, qualityControl, technology, tools, facilities, wasteManagement } from '../data/plan.js';

export function Thing({ t, showCost = false }) {
  return (
    <article className="card thing">
      <div className={`ph${t.img ? '' : ' dark'}`}>
        {t.img ? <img src={t.img} alt={t.name} loading="lazy" /> : <BriquetteArt size={120} />}
      </div>
      <div className="body">
        <h3>{t.name}</h3>
        <p>{t.text}</p>
        {showCost && (
          <div className="meta">
            <span className="chip">Qty {t.qty ?? t.unit}</span>
            <span className="chip">Supplier: {t.supplier}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Process() {
  return (
    <>
      <PageHero
        crumb="Process"
        eyebrow="How it’s made"
        title={<>From shell <em>to flame.</em></>}
        lead={operationalProcess}
      />
      <div className="wrap">
        {/* Steps */}
        <section className="block" style={{ marginTop: 50 }}>
          <ol className="numlist" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {productionSteps.map((s) => (
              <li key={s.title}><div><b>{s.title}</b><span>{s.text}</span></div></li>
            ))}
          </ol>
        </section>

        {/* Raw materials */}
        <section className="block">
          <Reveal><Head eyebrow="Raw materials" title={<>Three ingredients. <em>Nothing else.</em></>} side="Plus clean water. Sourced locally from coconut vendors, rice farmers, and the Sampol market." /></Reveal>
          <div className="grid-3">
            {materials.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}><Thing t={{ ...m, qty: m.unit }} /></Reveal>
            ))}
          </div>
        </section>

        {/* Quality control */}
        <section className="block">
          <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <Reveal className="sticky-desk">
              <div className="ic leaf"><Shield size={26} /></div>
              <span className="eyebrow" style={{ marginTop: 22, display: 'block' }}>Quality control</span>
              <h2 className="title">Checked from <em>field to pack.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Quality control applies from receiving raw materials until finished products are packaged and delivered — so every briquette is safe, consistent, durable, and suitable for cooking.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <ol className="numlist">
                {qualityControl.map((q) => <li key={q.title}><div><b>{q.title}</b><span>{q.text}</span></div></li>)}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* Tools */}
        <section className="block">
          <Reveal><Head eyebrow="Tools & equipment" title={<>Simple tools, <em>careful hands.</em></>} side={technology} /></Reveal>
          <div className="grid-4">
            {[...tools, ...facilities].map((t, i) => (
              <Reveal key={t.name} delay={(i % 4) * 60}><Thing t={t} /></Reveal>
            ))}
          </div>
        </section>

        {/* Material handling */}
        <section className="block">
          <Reveal><Head eyebrow="Material handling" title={<>Twelve stages, <em>one flow.</em></>} side="How materials move through ALAB — from receiving coconut shells to handling production waste." /></Reveal>
          <Reveal className="table-wrap">
            <table className="t">
              <thead><tr><th>#</th><th>Stage</th><th>Materials handled</th><th>Method / equipment</th><th>Action plan</th></tr></thead>
              <tbody>
                {materialHandling.map((m, i) => (
                  <tr key={m.stage}><td className="mute">{i + 1}</td><td><b>{m.stage}</b></td><td>{m.materials}</td><td>{m.equipment}</td><td className="mute">{m.action}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>

        {/* Waste */}
        <section className="block">
          <Reveal className="card pad glow" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 26, alignItems: 'center' }}>
            <BriquetteArt size={110} />
            <div>
              <span className="eyebrow leaf">Waste management</span>
              <p className="lead" style={{ margin: '10px 0 0', color: 'var(--cream2)' }}>{wasteManagement}</p>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
