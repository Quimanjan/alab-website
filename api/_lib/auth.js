// Admin authentication: scrypt password hashing + signed, HttpOnly session cookies.
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getSupabaseClient } from './store.js';

export const DEFAULT_ADMIN = { username: 'admin2026', password: 'admin2026' };
const COOKIE = 'alab_admin';
const SESSION_HOURS = 8;

// ---------- Password hashing ----------
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password, stored) {
  const [algo, salt, hash] = String(stored || '').split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64, { N: 16384, r: 8, p: 1 });
  const known = Buffer.from(hash, 'hex');
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

// ---------- Admin record (Supabase or local file) ----------
const FILE = path.join(process.cwd(), '.data', 'admin.json');

export async function getAdmin() {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.from('admin_users').select('id, username, password_hash, is_default, updated_at').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data;
  }
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch { return null; }
}

/** Creates the default admin (admin2026 / admin2026) the first time anyone tries to log in. */
export async function ensureAdmin() {
  const existing = await getAdmin();
  if (existing) return existing;
  const row = { id: 1, username: DEFAULT_ADMIN.username, password_hash: hashPassword(DEFAULT_ADMIN.password), is_default: true, updated_at: new Date().toISOString() };
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.from('admin_users').upsert(row, { onConflict: 'id', ignoreDuplicates: true }).select().maybeSingle();
    if (error) throw error;
    return data || (await getAdmin());
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(row, null, 2));
  return row;
}

export async function updateAdmin({ username, password }) {
  const current = await getAdmin();
  const patch = { updated_at: new Date().toISOString() };
  if (username) patch.username = username;
  if (password) { patch.password_hash = hashPassword(password); patch.is_default = false; }
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.from('admin_users').update(patch).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  }
  const next = { ...current, ...patch };
  await fs.writeFile(FILE, JSON.stringify(next, null, 2));
  return next;
}

// ---------- Signed session tokens ----------
function secret() {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return crypto.createHash('sha256').update('alab-session:' + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
  return 'alab-local-dev-only-secret';
}
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

/** The token embeds the admin's last credential change, so changing the password logs out old sessions. */
export function createToken(admin) {
  const payload = b64(JSON.stringify({ u: admin.username, v: new Date(admin.updated_at).getTime(), exp: Date.now() + SESSION_HOURS * 3600_000 }));
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expect = sign(payload);
  if (expect.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const isHttps = (req) => process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';

export function setSessionCookie(req, res, token) {
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${isHttps(req) ? '; Secure' : ''}`);
}
export function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0${isHttps(req) ? '; Secure' : ''}`);
}

/** Returns the admin record if the request carries a valid session, else null. */
export async function requireAdmin(req) {
  const data = readToken(parseCookies(req)[COOKIE]);
  if (!data) return null;
  const admin = await getAdmin();
  if (!admin || admin.username !== data.u || new Date(admin.updated_at).getTime() !== data.v) return null;
  return admin;
}
