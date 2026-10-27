// GET  /api/reviews?limit=12&offset=0&sort=newest|highest|lowest  → { reviews, stats }
// POST /api/reviews  { name, rating, comment, customer_type, pack_size, website }  → { review }
//
// Runs as a Vercel Node.js serverless function. Locally it is mounted by server/dev.js.

import { listReviews, insertReview, countRecentByIp, hashIp, storeMode } from './_lib/store.js';

export const CUSTOMER_TYPES = [
  'Household',
  'BBQ / ihaw-ihaw stall',
  'Lechon manok',
  'Restaurant / samgyupsalan',
  'Sari-sari store',
  'Other',
];
export const PACK_SIZES = ['1 kg', '3 kg', '5 kg'];

const MAX_PER_WINDOW = 3; // reviews per IP…
const WINDOW_MINUTES = 15; // …per 15 minutes

const clean = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, max);

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export function validate(body) {
  const errors = {};
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Please choose a rating from 1 to 5 stars.';

  const name = clean(body.name, 60) || 'Anonymous';
  const comment = clean(body.comment, 1000);
  if (String(body.comment ?? '').trim().length > 1000) errors.comment = 'Feedback must be 1,000 characters or fewer.';

  const customer_type = body.customer_type ? clean(body.customer_type, 40) : null;
  if (customer_type && !CUSTOMER_TYPES.includes(customer_type)) errors.customer_type = 'Please pick a customer type from the list.';

  const pack_size = body.pack_size ? clean(body.pack_size, 10) : null;
  if (pack_size && !PACK_SIZES.includes(pack_size)) errors.pack_size = 'Please pick a pack size from the list.';

  return { errors, value: { name, rating, comment, customer_type, pack_size } };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (storeMode() === 'unconfigured') {
    return res.status(503).json({
      error: 'Reviews are not set up yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables.',
    });
  }

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '12', 10) || 12, 1), 50);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
      const sortParam = url.searchParams.get('sort');
      const sort = ['newest', 'highest', 'lowest'].includes(sortParam) ? sortParam : 'newest';
      const data = await listReviews({ limit, offset, sort });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = await readBody(req);

      // Honeypot: real visitors never see or fill the "website" field.
      if (body.website) return res.status(201).json({ review: null });

      const { errors, value } = validate(body);
      if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form.', fields: errors });

      const ip_hash = hashIp(clientIp(req));
      if ((await countRecentByIp(ip_hash, WINDOW_MINUTES)) >= MAX_PER_WINDOW) {
        return res.status(429).json({ error: 'Thanks! You have sent several reviews already — please try again in a few minutes.' });
      }

      const review = await insertReview({ ...value, ip_hash });
      return res.status(201).json({ review });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/reviews]', err);
    return res.status(500).json({ error: 'Something went wrong while loading reviews. Please try again.' });
  }
}
