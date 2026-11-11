import { Arrow } from './Icons.jsx';
import { site } from '../data/site.js';

/** "Order on TikTok" / "Order on Facebook" buttons, from site.channels. */
export default function OrderLinks({ size = '', className = '', style }) {
  const links = site.channels.filter((c) => c.url);
  if (!links.length) return null;
  return (
    <div className={`order-links ${className}`} style={style}>
      {links.map((c, i) => (
        <a key={c.name} href={c.url} target="_blank" rel="noreferrer" className={`btn ${i === 0 ? 'fire' : 'line'} ${size}`}>
          Order on {c.name} <Arrow size={16} />
        </a>
      ))}
    </div>
  );
}
