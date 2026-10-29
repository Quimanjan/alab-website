import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/fx.js';

/**
 * Animates the number inside a string when it scrolls into view.
 * <CountUp value="76.9%" />  <CountUp value="₱60" />  <CountUp value="22,893" />
 */
export default function CountUp({ value, duration = 1600, className, as: Tag = 'span' }) {
  const str = String(value);
  const m = str.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
  const ref = useRef(null);
  const [shown, setShown] = useState(m ? m[1] + '0' + m[3] : str);

  useEffect(() => {
    if (!m) return undefined;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const commas = num.includes(',');
    const fmt = (v) => {
      const s = v.toFixed(decimals);
      return pre + (commas ? Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s) + post;
    };
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') { setShown(str); return undefined; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        setShown(k >= 1 ? str : fmt(target * eased));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str, duration]);

  return <Tag ref={ref} className={className} aria-label={str}>{shown}</Tag>;
}
