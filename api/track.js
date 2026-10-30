// POST /api/track { path, referrer }  — records one anonymous page view.
// Visitors are identified only by a salted hash of IP + browser, never stored raw.
import { hashIp, insertView, storeMode } from './_lib/store.js';

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|vercel-screenshot/i;

function device(ua) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'Tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function source(ref, host) {
  if (!ref) return 'Direct';
  try {
    const u = new URL(ref);
    if (host && u.host === host) return 'Direct';
    const h = u.hostname.replace(/^www\.|^m\.|^l\./, '');
    if (/facebook|fb\.|messenger/.test(h)) return 'Facebook';
    if (/google\./.test(h)) return 'Google';
    if (/tiktok/.test(h)) return 'TikTok';
    if (/instagram/.test(h)) return 'Instagram';
    if (/shopee/.test(h)) return 'Shopee';
    if (/lazada/.test(h)) return 'Lazada';
    return h.slice(0, 60);
  } catch { return 'Direct'; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (storeMode() === 'unconfigured') return res.status(204).end();
  try {
    const ua = String(req.headers['user-agent'] || '');
    if (!ua || BOT.test(ua) || req.headers['x-purpose'] === 'preview') return res.status(204).end();
    const body = typeof req.body === 'object' && req.body ? req.body : (() => { try { return JSON.parse(req.body || '{}'); } catch { return {}; } })();
    let p = String(body.path || '/').split('?')[0].split('#')[0].slice(0, 120);
    if (!p.startsWith('/')) p = '/';
    if (p.startsWith('/admin')) return res.status(204).end();
    const fwd = req.headers['x-forwarded-for'];
    const ip = (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
    await insertView({ path: p, visitor: hashIp(ip + '|' + ua), device: device(ua), referrer: String(body.ref || '').toLowerCase() === 'qr' ? 'QR code' : source(body.referrer, req.headers.host) });
    return res.status(204).end();
  } catch (err) {
    console.error('[api/track]', err);
    return res.status(204).end(); // never break the page for analytics
  }
}
