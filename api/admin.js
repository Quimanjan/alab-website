// Admin API (one function to stay within Vercel Hobby limits), routed by ?action=
//   POST login    { username, password }          → sets session cookie
//   POST logout
//   GET  me                                         → { username, isDefault }
//   GET  stats&days=30                              → visitors, ratings, coconuts, charts
//   GET  reviews                                    → all reviews incl. hidden
//   POST review   { id, visible }                   → hide / show a review
//   POST settings { currentPassword, username?, newPassword? }
import {
  DEFAULT_ADMIN, clearSessionCookie, createToken, ensureAdmin, requireAdmin, setSessionCookie, updateAdmin, verifyPassword,
} from './_lib/auth.js';
import { adminListReviews, getCounter, hashIp, listReviews, setReviewVisibility, storeMode, viewStats } from './_lib/store.js';

const attempts = new Map(); // per-instance brute-force throttle
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function ipOf(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
}
function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
const USERNAME_RE = /^[a-zA-Z0-9._-]{4,32}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (storeMode() === 'unconfigured') return res.status(503).json({ error: 'Database is not configured.' });

  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action');
  const isPost = req.method === 'POST';

  // Simple CSRF guard: state-changing calls must be JSON from our own page (SameSite cookie + custom header).
  if (isPost && req.headers['x-alab-admin'] !== '1') return res.status(403).json({ error: 'Forbidden' });

  try {
    if (action === 'login' && isPost) {
      const key = hashIp(ipOf(req));
      const a = attempts.get(key) || { n: 0, t: Date.now() };
      if (Date.now() - a.t > 15 * 60_000) { a.n = 0; a.t = Date.now(); }
      if (a.n >= 8) return res.status(429).json({ error: 'Too many attempts. Please wait 15 minutes and try again.' });
      const { username = '', password = '' } = body(req);
      const admin = await ensureAdmin();
      const ok = String(username).trim() === admin.username && verifyPassword(password, admin.password_hash);
      if (!ok) {
        a.n += 1; attempts.set(key, a);
        await wait(600);
        return res.status(401).json({ error: 'Incorrect username or password.' });
      }
      attempts.delete(key);
      setSessionCookie(req, res, createToken(admin));
      return res.status(200).json({ username: admin.username, isDefault: !!admin.is_default });
    }

    if (action === 'logout' && isPost) {
      clearSessionCookie(req, res);
      return res.status(200).json({ ok: true });
    }

    const admin = await requireAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Please log in.' });

    if (action === 'me') return res.status(200).json({ username: admin.username, isDefault: !!admin.is_default });

    if (action === 'stats') {
      const days = [7, 30, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
      const [views, rv, coconuts] = await Promise.all([viewStats(days), listReviews({ limit: 1 }), getCounter('coconuts_grilled').catch(() => 0)]);
      return res.status(200).json({ days, views, ratings: rv.stats, coconuts });
    }

    if (action === 'reviews') return res.status(200).json({ reviews: await adminListReviews() });

    if (action === 'review' && isPost) {
      const { id, visible } = body(req);
      if (typeof id !== 'string' || typeof visible !== 'boolean') return res.status(400).json({ error: 'Bad request' });
      await setReviewVisibility(id, visible);
      return res.status(200).json({ ok: true });
    }

    if (action === 'settings' && isPost) {
      const { currentPassword = '', username, newPassword } = body(req);
      if (!verifyPassword(currentPassword, admin.password_hash)) { await wait(400); return res.status(400).json({ error: 'Your current password is incorrect.', field: 'currentPassword' }); }
      const nextUser = username ? String(username).trim() : '';
      if (nextUser && !USERNAME_RE.test(nextUser)) return res.status(400).json({ error: 'Username must be 4–32 characters: letters, numbers, dot, dash or underscore.', field: 'username' });
      if (newPassword !== undefined && newPassword !== '') {
        const pw = String(newPassword);
        if (pw.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.', field: 'newPassword' });
        if (pw === DEFAULT_ADMIN.password) return res.status(400).json({ error: 'Please choose a password different from the default one.', field: 'newPassword' });
      }
      if (!nextUser && !newPassword) return res.status(400).json({ error: 'Nothing to change.' });
      const updated = await updateAdmin({ username: nextUser || undefined, password: newPassword || undefined });
      setSessionCookie(req, res, createToken(updated));
      return res.status(200).json({ username: updated.username, isDefault: !!updated.is_default });
    }

    return res.status(404).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[api/admin]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
