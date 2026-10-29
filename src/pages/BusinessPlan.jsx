import { useEffect, useState } from 'react';
import { Donut, HBars, Legend, PageHero, Reveal, chartColors } from '../components/UI.jsx';
import CountUp from '../components/fx/CountUp.jsx';
import {
  actionPlan, company, compensation, competitors, costs, credits, demandSupply, differentiators, distribution, facilities,
  industry, materials, orderFlow, personnel, peso, policies, prices, priceComparison, product, projectedSales, promotion,
  qualityControl, risk, rules, survey, swot, targetMarket, team, technology, tools, training, utilities, workingSchedule,
} from '../data/plan.js';

const sections = [
  ['overview', 'Overview'],
  ['industry', 'Industry'],
  ['competitors', 'Competitors'],
  ['swot', 'SWOT'],
  ['market', 'Market'],
  ['research', 'Survey results'],
  ['marketing', 'Marketing plan'],
  ['operations', 'Operations'],
  ['management', 'Management'],
  ['risk', 'Risk & contingency'],
];

function useSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const ids = sections.map((s) => s[0]);

export default function BusinessPlan() {
  const active = useSpy(ids);
  return (
    <>
      <PageHero
        crumb="Business plan"
        eyebrow="ALAB — A Business Plan Implementation"
        title={<>The plan behind <em>the flame.</em></>}
        lead={`Everything in ALAB’s business plan — industry, competitors, market research of ${survey.respondents} respondents, marketing, operations, management, and risk — in one place.`}
      />
      <div className="wrap plan-layout">
        <nav className="toc" aria-label="Business plan sections">
          <b>Contents</b>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>
          ))}
        </nav>

        <div>
          {/* OVERVIEW */}
          <section id="overview" className="plan-sec">
            <span className="eyebrow">01 · Executive summary</span>
            <h2 className="title">Overview</h2>
            <div className="prose">{company.executiveSummary.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
            <div className="grid-2" style={{ marginTop: 26 }}>
              <div className="card pad"><span className="eyebrow">Business description</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.description}</p></div>
              <div className="card pad"><span className="eyebrow">Name &amp; tagline</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.nameMeaning} <b style={{ color: 'var(--cream)' }}>“{company.tagline.text}”</b> — {company.tagline.meaning}</p></div>
              <div className="card pad"><span className="eyebrow">Vision</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.vision}</p></div>
              <div className="card pad"><span className="eyebrow">Mission</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.mission}</p></div>
              <div className="card pad"><span className="eyebrow">Goals</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.goals}</p></div>
              <div className="card pad"><span className="eyebrow">Location</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.location}</p></div>
              <div className="card pad"><span className="eyebrow">Type of organization</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.organization}</p></div>
              <div className="card pad"><span className="eyebrow">Nature of business</span><p className="mute" style={{ lineHeight: 1.75 }}>{company.nature}</p></div>
            </div>
          </section>

          {/* INDUSTRY */}
          <section id="industry" className="plan-sec">
            <span className="eyebrow">02 · Environmental trends &amp; future outlook</span>
            <h2 className="title">Industry analysis</h2>
            <p className="lead">Industry: <b style={{ color: 'var(--cream)' }}>{industry.definition}</b>.</p>
            <div className="statrow" style={{ marginTop: 22 }}>
              {industry.stats.map((s) => <div className="card stat tilt" key={s.value}><CountUp as="b" value={s.value} /><span>{s.label}</span></div>)}
            </div>
            <h3 className="sub">Demand &amp; supply — 3-year outlook</h3>
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Year</th><th>Demand</th><th>Supply</th><th>Outlook</th></tr></thead>
                <tbody>{demandSupply.years.map((y) => <tr key={y.year}><td><b>{y.year}</b></td><td className="num">{y.demand}</td><td className="num">{y.supply}</td><td className="mute">{y.note}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="card pad" style={{ marginTop: 16 }}>
              <h4 className="eyebrow" style={{ marginBottom: 16 }}>Projected volume (kg, upper range)</h4>
              <HBars data={demandSupply.years.map((y) => ({ label: `${y.year} · ${y.low}–${y.high} kg`, pct: y.high }))} max={650} />
            </div>
            <div className="prose" style={{ marginTop: 20 }}>{demandSupply.analysis.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div>
          </section>

          {/* COMPETITORS */}
          <section id="competitors" className="plan-sec">
            <span className="eyebrow">03 · Competitor analysis</span>
            <h2 className="title">Competitors grid</h2>
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th></th>{competitors.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {competitors.rows.map((r) => (
                    <tr key={r.label}><td><b>{r.label}</b></td>{r.values.map((v, i) => <td key={i} style={i === 0 ? { color: '#ffd3a8' } : undefined}>{v}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid-3" style={{ marginTop: 16 }}>
              {competitors.profiles.map((c) => (
                <div className="card pad" key={c.name}><span className="chip amber">{c.type}</span><h4 className="serif" style={{ fontSize: 21, fontWeight: 500, margin: '16px 0 8px' }}>{c.name}</h4><p className="mute" style={{ margin: 0, lineHeight: 1.65, fontSize: 14.5 }}>{c.text}</p></div>
              ))}
            </div>
          </section>

          {/* SWOT */}
          <section id="swot" className="plan-sec">
            <span className="eyebrow">04 · SWOT analysis</span>
            <h2 className="title">Strengths, weaknesses, opportunities, threats</h2>
            <div className="swot">
              {Object.entries(swot).map(([k, list], i) => (
                <div className="card pad" key={k}>
                  <h3><span className="letter" style={{ background: `${chartColors[[0, 2, 3, 4][i]]}22`, color: chartColors[[0, 2, 3, 4][i]] }}>{k[0]}</span>{k}</h3>
                  <ul className="dots">{list.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>

          {/* MARKET */}
          <section id="market" className="plan-sec">
            <span className="eyebrow">05 · Market segmentation &amp; targeting</span>
            <h2 className="title">Target market</h2>
            <p className="lead">{targetMarket.text}</p>
            <div className="statrow" style={{ marginTop: 22 }}>
              {targetMarket.stats.map((s) => <div className="card stat tilt" key={s.value}><CountUp as="b" value={s.value} /><span>{s.label}</span></div>)}
            </div>
            <h3 className="sub">Market segmentation <span className="mute" style={{ fontSize: 16 }}>· based on {survey.respondents} respondents</span></h3>
            <div className="grid-2">
              {targetMarket.segmentation.map((s) => <div className="card pad" key={s.label}><span className="eyebrow">{s.label}</span><p className="mute" style={{ margin: '10px 0 0', lineHeight: 1.65 }}>{s.text}</p></div>)}
            </div>
          </section>

          {/* RESEARCH */}
          <section id="research" className="plan-sec">
            <span className="eyebrow">06 · Market research (survey)</span>
            <h2 className="title">What {survey.respondents} locals told us</h2>
            <div className="grid-2">
              {survey.questions.map((q, i) => (
                <div className="card chart-card" key={q.id} style={i === survey.questions.length - 1 ? { gridColumn: '1 / -1' } : undefined}>
                  <h3>{q.title}</h3>
                  {q.data.length > 4 || q.id === 'where' ? (
                    <div className="donut-row">
                      <Donut data={q.data.filter((d) => d.pct > 0)} center={[`${q.data[0].pct}%`, q.data[0].label]} />
                      <Legend data={q.data} />
                    </div>
                  ) : (
                    <HBars data={q.data} max={100} />
                  )}
                  <p className="takeaway">{q.takeaway}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MARKETING */}
          <section id="marketing" className="plan-sec">
            <span className="eyebrow">07 · Marketing plan</span>
            <h2 className="title">Marketing plan</h2>
            <div className="prose">
              <p>{product.presentation} {product.packaging}</p>
              <p>{product.innovation}</p>
              <p><b>Branding — “Waste to Warmth.”</b> {product.branding}</p>
            </div>
            <h3 className="sub">Product differentiation</h3>
            <div className="grid-2">{differentiators.map((d) => <div className="card pad" key={d.title}><b>{d.title}</b><p className="mute" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{d.text}</p></div>)}</div>

            <h3 className="sub">Pricing structure</h3>
            <div className="grid-2">
              <div className="table-wrap">
                <table className="t" style={{ minWidth: 0 }}>
                  <thead><tr><th>Weight</th><th className="num">Price</th><th>Target customer</th></tr></thead>
                  <tbody>{prices.map((p) => <tr key={p.size}><td><b>ALAB Charcoal {p.size}</b></td><td className="num">{peso(p.price)}{p.note ? <div className="mute" style={{ fontSize: 12 }}>{p.note}</div> : null}</td><td>{p.target}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="table-wrap">
                <table className="t" style={{ minWidth: 0 }}>
                  <thead><tr><th>Competitor</th><th className="num">Price per kg</th></tr></thead>
                  <tbody>{priceComparison.map((p) => <tr key={p.name} className={p.highlight ? 'hl' : ''}><td>{p.name}</td><td className="num">{p.range}</td></tr>)}</tbody>
                </table>
              </div>
            </div>

            <h3 className="sub">Place &amp; distribution system</h3>
            <ol className="numlist">{distribution.map((d) => <li key={d.title}><div><b>{d.title} ({d.tag})</b><span>{d.text}</span></div></li>)}</ol>
            <p className="mute" style={{ lineHeight: 1.7, marginTop: 16 }}>ALAB uses a direct distribution channel — products are sold directly to customers from the business location, with orders also taken through social media and other online channels. As the business grows, it may expand distribution to nearby communities.</p>

            <h3 className="sub">Promotion</h3>
            <div className="grid-3">
              <div className="card pad"><span className="eyebrow">Pre-launch</span><p className="mute" style={{ lineHeight: 1.7, fontSize: 14.5 }}>{promotion.preLaunch}</p></div>
              <div className="card pad"><span className="eyebrow">Launch</span><p className="mute" style={{ lineHeight: 1.7, fontSize: 14.5 }}>{promotion.launch}</p></div>
              <div className="card pad"><span className="eyebrow">Marketing program</span><p className="mute" style={{ lineHeight: 1.7, fontSize: 14.5 }}>{promotion.program}</p></div>
            </div>
            <h3 className="sub">Advertising tools</h3>
            <div className="grid-3">{promotion.tools.map((t) => <div className="card pad" key={t.title}><b>{t.title}</b><p className="mute" style={{ margin: '8px 0 0', lineHeight: 1.6, fontSize: 14.5 }}>{t.text}</p></div>)}</div>

            <h3 className="sub">Promotional calendar — {promotion.calendar.month}</h3>
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <img src={promotion.calendar.image} alt="ALAB promotional calendar for September 2026" loading="lazy" style={{ borderRadius: 20, border: '1px solid var(--line)', width: '100%' }} />
              <ol className="numlist">{promotion.calendar.events.map((e) => <li key={e.title}><div><b>{e.title}</b><span>{e.date}</span></div></li>)}</ol>
            </div>

            <h3 className="sub">Market paraphernalia</h3>
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Item</th><th className="num">Quantity</th><th className="num">Estimated price</th><th className="num">Total</th></tr></thead>
                <tbody>{promotion.paraphernalia.map((p) => <tr key={p.item}><td>{p.item}</td><td className="num">{p.qty}</td><td className="num">{p.price}</td><td className="num">{peso(p.total)}</td></tr>)}</tbody>
                <tfoot><tr><td colSpan={3}>Total estimated cost</td><td className="num">{peso(promotion.paraphernalia.reduce((a, p) => a + p.total, 0))}</td></tr></tfoot>
              </table>
            </div>

            <h3 className="sub">Sales &amp; marketing manpower</h3>
            <p className="mute" style={{ lineHeight: 1.75 }}>{promotion.manpower}</p>

            <h3 className="sub">Projected sales (5 years)</h3>
            <div className="card pad">
              <HBars data={projectedSales.map((s) => ({ label: s.year, pct: s.value }))} max={10080} />
              <p className="mute" style={{ fontSize: 13, margin: '14px 0 0' }}>Figures as stated in the plan: {projectedSales.map((s) => `${s.year} — ${s.value.toLocaleString()}`).join(' · ')}.</p>
            </div>

            <h3 className="sub">{actionPlan.title}</h3>
            <div className="table-wrap">
              <table className="t" style={{ minWidth: 980 }}>
                <thead><tr><th>5Ps</th><th>Time frame</th>{actionPlan.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{actionPlan.rows.map((r) => <tr key={r.p}><td><b>{r.p}</b></td><td className="num">2026–2028</td>{r.cells.map((c, i) => <td key={i} className={i % 2 ? 'mute' : ''}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>

          {/* OPERATIONS */}
          <section id="operations" className="plan-sec">
            <span className="eyebrow">08 · Operational / technical plan</span>
            <h2 className="title">Operations</h2>
            <p className="lead">The production flow starts with preparing all materials and supplies, then processing and making the product, quality checking, packaging, and finally proper waste management to keep the workplace clean and safe.</p>

            <h3 className="sub">Materials &amp; supplies</h3>
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Material</th><th>Supplier</th><th>Alternative</th><th className="num">Unit</th><th className="num">Cost / unit</th><th className="num">Amount</th></tr></thead>
                <tbody>{materials.map((m) => <tr key={m.name}><td><b>{m.name}</b></td><td>{m.supplier}</td><td>{m.alt}</td><td className="num">{m.unit}</td><td className="num">{peso(m.cost)}</td><td className="num">{peso(m.total)}</td></tr>)}</tbody>
              </table>
            </div>

            <h3 className="sub">Tools, machineries &amp; equipment</h3>
            <EquipTable rows={tools} />
            <h3 className="sub">Facility management, furniture &amp; fixtures</h3>
            <EquipTable rows={facilities} />
            <p className="mute" style={{ fontSize: 13, marginTop: 10 }}>The briquette molder is listed without a photo because ALAB’s briquettes are now cylindrical; molder costs are as stated in the plan.</p>

            <h3 className="sub">Utilities</h3>
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Utility</th><th>Description</th><th className="num">Unit cost</th><th>Source</th><th className="num">Year 1</th><th className="num">Year 2</th><th className="num">Year 3</th></tr></thead>
                <tbody>{utilities.map((u) => <tr key={u.name}><td><b>{u.name}</b></td><td className="mute">{u.text}</td><td className="num">{u.unit}</td><td>{u.source}</td><td className="num">{peso(u.y1)}</td><td className="num">{peso(u.y2)}</td><td className="num">{peso(u.y3)}</td></tr>)}</tbody>
              </table>
            </div>

            <h3 className="sub">Technology utilization</h3>
            <p className="mute" style={{ lineHeight: 1.75 }}>{technology}</p>

            <h3 className="sub">Flow of operation for goods</h3>
            <p className="mute" style={{ lineHeight: 1.7 }}>Orders are received through direct transactions, Facebook, Messenger, or other online selling channels. The Marketing and Sales Officer confirms the order; the Production Manager and the Procurement and Inventory Officer prepare it; the Quality Control Officer checks it before release.</p>
            <ol className="numlist" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 14 }}>{orderFlow.map((s) => <li key={s}><div><b>{s}</b></div></li>)}</ol>

            <h3 className="sub">Quality control</h3>
            <div className="grid-2">{qualityControl.map((q) => <div className="card" style={{ padding: 20 }} key={q.title}><b>{q.title}</b><p className="mute" style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.55 }}>{q.text}</p></div>)}</div>

            <h3 className="sub">Technical manpower</h3>
            <div className="table-wrap">
              <table className="t" style={{ minWidth: 0 }}>
                <thead><tr><th>Position</th><th>Department / area</th><th className="num">No. of manpower</th></tr></thead>
                <tbody>{personnel.map((p) => <tr key={p.title}><td><b>{p.title}</b></td><td>{p.area}</td><td className="num">{p.needed}</td></tr>)}</tbody>
              </table>
            </div>

            <h3 className="sub">Operation &amp; production costs</h3>
            <div className="grid-2">
              <div className="card pad"><span className="eyebrow">Production costs</span><ul className="dots" style={{ marginTop: 14 }}>{costs.production.map((c) => <li key={c}>{c}</li>)}</ul></div>
              <div className="card pad"><span className="eyebrow">Operating costs</span><ul className="dots" style={{ marginTop: 14 }}>{costs.operating.map((c) => <li key={c}>{c}</li>)}</ul></div>
            </div>
            <p className="mute" style={{ lineHeight: 1.7, marginTop: 16 }}>{costs.note}</p>
          </section>

          {/* MANAGEMENT */}
          <section id="management" className="plan-sec">
            <span className="eyebrow">09 · Management &amp; administrative plan</span>
            <h2 className="title">Organization</h2>
            <div className="card pad" style={{ textAlign: 'center' }}>
              <span className="eyebrow">Organizational chart</span>
              <OrgChart />
            </div>

            <h3 className="sub">Personnel description</h3>
            <div className="grid-2">
              {personnel.map((p) => (
                <div className="card pad" key={p.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className="serif" style={{ fontSize: 26, fontWeight: 500 }}>{p.title}</h4>
                    <span className="chip amber">Needed: {p.needed}</span>
                  </div>
                  <p className="mute" style={{ lineHeight: 1.7 }}>{p.text}</p>
                  <p style={{ lineHeight: 1.7, fontSize: 14.5, color: 'var(--cream2)' }}><b>Skills / qualifications:</b> {p.skills}</p>
                  <span className="chip">Basic offer: {p.offer}</span>
                </div>
              ))}
            </div>

            <h3 className="sub">Working schedule</h3>
            <div className="grid-2">
              <div className="table-wrap">
                <table className="t" style={{ minWidth: 0 }}>
                  <thead><tr><th>Day</th><th>Working hours</th></tr></thead>
                  <tbody><tr><td><b>Saturday – Thursday</b></td><td>8:00 AM – 5:00 PM</td></tr><tr><td><b>Friday</b></td><td>Closed / rest day</td></tr></tbody>
                </table>
              </div>
              <p className="mute" style={{ lineHeight: 1.75, margin: 0 }}>{workingSchedule.text}</p>
            </div>

            <h3 className="sub">Training &amp; development</h3>
            <p className="mute" style={{ lineHeight: 1.75 }}>{training}</p>

            <h3 className="sub">Company rules &amp; regulations</h3>
            <ol className="numlist" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>{rules.map((r) => <li key={r.title}><div><b>{r.title}</b><span>{r.text}</span></div></li>)}</ol>

            <h3 className="sub">Company policies &amp; compensation</h3>
            <div className="grid-2">
              <div className="card pad"><span className="eyebrow">Policies</span><p className="mute" style={{ lineHeight: 1.75 }}>{policies}</p></div>
              <div className="card pad"><span className="eyebrow">Compensation &amp; benefits</span><p className="mute" style={{ lineHeight: 1.75 }}>{compensation}</p></div>
            </div>
          </section>

          {/* RISK */}
          <section id="risk" className="plan-sec">
            <span className="eyebrow">10 · Risk management</span>
            <h2 className="title">Risk &amp; contingency</h2>
            <div className="grid-2">
              <div className="card pad"><span className="eyebrow">Risk management</span><p className="mute" style={{ lineHeight: 1.75 }}>{risk.management}</p></div>
              <div className="card pad"><span className="eyebrow">Evaluation of weaknesses</span><p className="mute" style={{ lineHeight: 1.75 }}>{risk.weaknesses}</p></div>
            </div>
            <h3 className="sub">Contingency plan</h3>
            <ol className="numlist">{risk.contingency.map((c) => <li key={c.title}><div><b>{c.title}</b><span>{c.text}</span></div></li>)}</ol>

            <div className="card pad glow" style={{ marginTop: 50 }}>
              <span className="eyebrow">Proponents</span>
              <p className="mute" style={{ lineHeight: 1.75, marginBottom: 0 }}>
                {team.map((t) => t.name).join(' · ')} — {credits.degree}, {credits.school}. Professor: {credits.professor}.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EquipTable({ rows }) {
  const total = rows.reduce((a, r) => a + r.total, 0);
  return (
    <div className="table-wrap">
      <table className="t">
        <thead><tr><th>Item</th><th>Description</th><th>Supplier</th><th>Alternative</th><th className="num">Qty</th><th className="num">Cost / unit</th><th className="num">Total</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.name}><td><b>{r.name}</b></td><td className="mute">{r.text}</td><td>{r.supplier}</td><td>{r.alt}</td><td className="num">{r.qty}</td><td className="num">{peso(r.cost)}</td><td className="num">{peso(r.total)}</td></tr>)}</tbody>
        <tfoot><tr><td colSpan={6}>Total</td><td className="num">{peso(total)}</td></tr></tfoot>
      </table>
    </div>
  );
}

function OrgChart() {
  const [lead, ...staff] = team;
  const Node = ({ m }) => (
    <div className="card member" style={{ padding: 14, justifyContent: 'flex-start', textAlign: 'left', background: '#17130f' }}>
      <img src={m.photo} alt="" width="56" height="56" style={{ width: 56, height: 56 }} />
      <div><b style={{ fontSize: 15 }}>{m.name}</b><span>{m.role}</span></div>
    </div>
  );
  return (
    <div style={{ display: 'grid', gap: 18, marginTop: 22, justifyItems: 'center' }}>
      <div style={{ width: 'min(320px, 100%)' }}><Node m={lead} /></div>
      <div style={{ width: 2, height: 22, background: 'var(--line2)' }} />
      <div className="grid-3" style={{ width: '100%', gap: 12 }}>{staff.map((m) => <Node key={m.name} m={m} />)}</div>
    </div>
  );
}
