// GET  /api/counter  → { coconuts }   total coconuts visitors have thrown on the grill
// POST /api/counter  → { coconuts }   adds one
import { getCounter, incrementCounter, hashIp, storeMode } from './_lib/store.js';

const KEY = 'coconuts_grilled';
const recent = new Map(); // light per-instance throttle: 1 increment / 1.5 s per visitor

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (storeMode() === 'unconfigured') return res.status(503).json({ error: 'Counter not configured.' });

  try {
    if (req.method === 'GET') return res.status(200).json({ coconuts: await getCounter(KEY) });

    if (req.method === 'POST') {
      const fwd = req.headers['x-forwarded-for'];
      const ip = (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
      const id = hashIp(ip);
      const now = Date.now();
      if (now - (recent.get(id) || 0) < 1500) return res.status(200).json({ coconuts: await getCounter(KEY), throttled: true });
      recent.set(id, now);
      if (recent.size > 5000) recent.clear();
      return res.status(200).json({ coconuts: await incrementCounter(KEY) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/counter]', err);
    return res.status(500).json({ error: 'Counter unavailable.' });
  }
}
