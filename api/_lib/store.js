// Storage layer for reviews.
// • With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set → Supabase (production on Vercel).
// • Without them, during local development → a JSON file in .data/reviews.json.
// Files in /api that start with "_" are not turned into Vercel functions.

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PUBLIC_FIELDS = 'id, created_at, name, rating, comment, customer_type, pack_size';

let supabase = null;
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!supabase) {
    supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return supabase;
}

export const getSupabaseClient = () => getSupabase();

export function storeMode() {
  if (getSupabase()) return 'supabase';
  // On Vercel the filesystem is read-only, so the file store is for local dev only.
  if (process.env.VERCEL) return 'unconfigured';
  return 'file';
}

function summarize(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) distribution[r] = (distribution[r] || 0) + 1;
  const count = ratings.length;
  const average = count ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10 : 0;
  return { count, average, distribution };
}

// ---------- Local JSON file store ----------
const FILE = path.join(process.cwd(), '.data', 'reviews.json');

async function readFileStore() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}
async function writeFileStore(rows) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
}
const toPublic = ({ id, created_at, name, rating, comment, customer_type, pack_size }) => ({
  id, created_at, name, rating, comment, customer_type, pack_size,
});

// ---------- Public API ----------
export async function listReviews({ limit = 12, offset = 0, sort = 'newest' } = {}) {
  const sb = getSupabase();
  if (sb) {
    let q = sb.from('reviews').select(PUBLIC_FIELDS).eq('is_visible', true);
    q = sort === 'highest'
      ? q.order('rating', { ascending: false }).order('created_at', { ascending: false })
      : sort === 'lowest'
        ? q.order('rating', { ascending: true }).order('created_at', { ascending: false })
        : q.order('created_at', { ascending: false });
    const { data, error } = await q.range(offset, offset + limit - 1);
    if (error) throw error;
    const { data: all, error: e2 } = await sb.from('reviews').select('rating').eq('is_visible', true);
    if (e2) throw e2;
    return { reviews: data, stats: summarize(all.map((r) => r.rating)) };
  }

  const rows = (await readFileStore()).filter((r) => r.is_visible !== false);
  const sorted = [...rows].sort((a, b) => {
    if (sort === 'highest' && b.rating !== a.rating) return b.rating - a.rating;
    if (sort === 'lowest' && b.rating !== a.rating) return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  return {
    reviews: sorted.slice(offset, offset + limit).map(toPublic),
    stats: summarize(rows.map((r) => r.rating)),
  };
}

export async function countRecentByIp(ipHash, minutes) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const sb = getSupabase();
  if (sb) {
    const { count, error } = await sb
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (error) throw error;
    return count || 0;
  }
  const rows = await readFileStore();
  return rows.filter((r) => r.ip_hash === ipHash && r.created_at >= since).length;
}

export async function insertReview(review) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('reviews').insert(review).select(PUBLIC_FIELDS).single();
    if (error) throw error;
    return data;
  }
  const rows = await readFileStore();
  const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), is_visible: true, ...review };
  rows.push(row);
  await writeFileStore(rows);
  return toPublic(row);
}

// ---------- Site counters (e.g. coconuts thrown on the grill) ----------
const COUNTER_FILE = path.join(process.cwd(), '.data', 'counters.json');

async function readCounters() {
  try { return JSON.parse(await fs.readFile(COUNTER_FILE, 'utf8')); } catch { return {}; }
}

export async function getCounter(key) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('site_counters').select('value').eq('key', key).maybeSingle();
    if (error) throw error;
    return Number(data?.value || 0);
  }
  return Number((await readCounters())[key] || 0);
}

export async function incrementCounter(key) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.rpc('increment_counter', { counter_key: key });
    if (error) throw error;
    return Number(data || 0);
  }
  const all = await readCounters();
  all[key] = Number(all[key] || 0) + 1;
  await fs.mkdir(path.dirname(COUNTER_FILE), { recursive: true });
  await fs.writeFile(COUNTER_FILE, JSON.stringify(all, null, 2));
  return all[key];
}

export function hashIp(ip) {
  const salt = process.env.REVIEW_IP_SALT || 'alab-waste-to-warmth';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

// ---------- Page views (visitor analytics) ----------
const VIEWS_FILE = path.join(process.cwd(), '.data', 'views.json');

export async function insertView(row) {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('page_views').insert(row);
    if (error) throw error;
    return;
  }
  let rows = [];
  try { rows = JSON.parse(await fs.readFile(VIEWS_FILE, 'utf8')); } catch { /* first view */ }
  rows.push({ ...row, created_at: new Date().toISOString() });
  await fs.mkdir(path.dirname(VIEWS_FILE), { recursive: true });
  await fs.writeFile(VIEWS_FILE, JSON.stringify(rows));
}

/** Aggregated visitor stats for the last `days` days (Philippine time). */
export async function viewStats(days) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.rpc('admin_view_stats', { range_days: days });
    if (error) throw error;
    return data;
  }
  let rows = [];
  try { rows = JSON.parse(await fs.readFile(VIEWS_FILE, 'utf8')); } catch { /* none */ }
  const tz = 'Asia/Manila';
  const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
  const today = dayKey(Date.now());
  const keys = [];
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(Date.now() - i * 86400000));
  const first = keys[0];
  const prevStart = dayKey(Date.now() - (days * 2 - 1) * 86400000);
  const inRange = rows.filter((r) => dayKey(r.created_at) >= first);
  const prev = rows.filter((r) => { const k = dayKey(r.created_at); return k >= prevStart && k < first; });
  const uniq = (list) => new Set(list.map((r) => r.visitor)).size;
  const group = (list, key, limit) => Object.entries(list.reduce((a, r) => { const k = r[key] || 'Unknown'; a[k] = (a[k] || 0) + 1; return a; }, {}))
    .map(([k, v]) => ({ [key === 'path' ? 'path' : key === 'device' ? 'device' : 'source']: k, views: v })).sort((a, b) => b.views - a.views).slice(0, limit);
  return {
    total_views: rows.length,
    total_visitors: uniq(rows),
    range_views: inRange.length,
    range_visitors: uniq(inRange),
    prev_views: prev.length,
    prev_visitors: uniq(prev),
    today_views: rows.filter((r) => dayKey(r.created_at) === today).length,
    today_visitors: uniq(rows.filter((r) => dayKey(r.created_at) === today)),
    daily: keys.map((k) => { const d = inRange.filter((r) => dayKey(r.created_at) === k); return { day: k, views: d.length, visitors: uniq(d) }; }),
    pages: group(inRange, 'path', 8),
    devices: group(inRange, 'device', 5),
    referrers: group(inRange, 'referrer', 6),
  };
}

/** All reviews (including hidden) for the admin dashboard. */
export async function adminListReviews(limit = 200) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('reviews').select('id, created_at, name, rating, comment, customer_type, pack_size, is_visible').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  }
  const rows = await readFileStore();
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit)
    .map(({ ip_hash, ...r }) => ({ ...r, is_visible: r.is_visible !== false }));
}

export async function setReviewVisibility(id, visible) {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('reviews').update({ is_visible: visible }).eq('id', id);
    if (error) throw error;
    return;
  }
  const rows = await readFileStore();
  const r = rows.find((x) => x.id === id);
  if (r) { r.is_visible = visible; await writeFileStore(rows); }
}
