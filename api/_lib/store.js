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

export function hashIp(ip) {
  const salt = process.env.REVIEW_IP_SALT || 'alab-waste-to-warmth';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}
