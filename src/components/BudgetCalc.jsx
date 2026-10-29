import { useEffect, useMemo, useRef, useState } from 'react';
import { prices, priceComparison } from '../data/plan.js';
import { BriquetteArt } from './Art.jsx';

/** Best mix of packs: most kilos within the budget, cheapest on ties. */
function bestMix(budget) {
  const [p5, p3, p1] = ['5 kg', '3 kg', '1 kg'].map((s) => prices.find((p) => p.size === s));
  let best = { kg: 0, cost: 0, n5: 0, n3: 0, n1: 0 };
  for (let a = 0; a * p5.price <= budget; a++) {
    for (let b = 0; a * p5.price + b * p3.price <= budget; b++) {
      const left = budget - a * p5.price - b * p3.price;
      const c = Math.floor(left / p1.price);
      const kg = a * 5 + b * 3 + c;
      const cost = a * p5.price + b * p3.price + c * p1.price;
      if (kg > best.kg || (kg === best.kg && cost < best.cost)) best = { kg, cost, n5: a, n3: b, n1: c };
    }
  }
  return best;
}

function useTween(value, ms = 450) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const cur = a + (value - a) * e;
      setV(cur);
      from.current = cur;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

const peso = (n) => '₱' + Math.round(n).toLocaleString('en-PH');

export default function BudgetCalc() {
  const [budget, setBudget] = useState(300);
  const mix = useMemo(() => bestMix(budget), [budget]);
  const coco = priceComparison.find((p) => p.name === 'Coconut briquette');
  const saveLow = Math.max(0, mix.kg * coco.low - mix.cost);
  const saveHigh = Math.max(0, mix.kg * coco.high - mix.cost);
  const vsSingles = mix.kg * 60 - mix.cost;

  const kg = useTween(mix.kg);
  const lo = useTween(saveLow);
  const hi = useTween(saveHigh);
  const pct = ((budget - 60) / (1000 - 60)) * 100;

  const boxes = [
    ...Array(mix.n5).fill('5 kg'),
    ...Array(mix.n3).fill('3 kg'),
    ...Array(mix.n1).fill('1 kg'),
  ];

  return (
    <div className="calc card glow">
      <div className="calc-left">
        <span className="eyebrow">Budget planner</span>
        <h3 className="serif calc-title">How far does your <em>₱{budget.toLocaleString()}</em> go?</h3>
        <p className="mute" style={{ lineHeight: 1.65, margin: '0 0 26px' }}>
          82.8% of the locals we surveyed spend ₱100–₱300 a month on charcoal. Slide to your monthly budget and we’ll find the pack mix that gets you the most ALAB.
        </p>
        <label className="visually-hidden" htmlFor="budget">Monthly charcoal budget in pesos</label>
        <input
          id="budget"
          type="range"
          min="60"
          max="1000"
          step="10"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="range"
          style={{ '--pct': `${pct}%` }}
          aria-valuetext={`${budget} pesos per month`}
        />
        <div className="range-scale"><span>₱60</span><span>₱300</span><span>₱600</span><span>₱1,000</span></div>
        <div className="calc-quick">
          {[100, 300, 600].map((v) => (
            <button key={v} type="button" className={`chip${budget === v ? ' amber' : ''}`} onClick={() => setBudget(v)}>₱{v}/month</button>
          ))}
        </div>
      </div>

      <div className="calc-right">
        <div className="calc-big">
          <b>{kg.toFixed(0)}<small> kg</small></b>
          <span>of ALAB charcoal per month for {peso(mix.cost)}{budget - mix.cost > 0 ? ` · ₱${budget - mix.cost} left` : ''}</span>
        </div>
        <div className="calc-boxes" aria-label={`Suggested packs: ${mix.n5} × 5 kg, ${mix.n3} × 3 kg, ${mix.n1} × 1 kg`}>
          {boxes.slice(0, 24).map((b, i) => (
            <span key={`${b}-${i}`} className={`pack p${b[0]}`} style={{ animationDelay: `${i * 35}ms` }}>
              <BriquetteArt size={b === '5 kg' ? 34 : b === '3 kg' ? 28 : 22} glow={false} />
              <i>{b}</i>
            </span>
          ))}
          {boxes.length > 24 && <span className="chip">+{boxes.length - 24} more</span>}
        </div>
        <div className="calc-stats">
          <div><b>{mix.n5}× 5 kg · {mix.n3}× 3 kg · {mix.n1}× 1 kg</b><span>best pack mix</span></div>
          <div><b>{vsSingles > 0 ? peso(vsSingles) : '—'}</b><span>saved vs. buying only 1 kg packs</span></div>
          <div><b>{peso(lo)}–{peso(hi)}</b><span>less than the same kilos of other coconut briquettes (₱70–₱120/kg)</span></div>
        </div>
      </div>
    </div>
  );
}

