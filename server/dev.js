// Local server for development and production preview.
//   npm run dev      → React (Vite, hot reload) + Node API on http://localhost:5173
//   npm run start    → builds, then serves dist/ + Node API on http://localhost:5173
// On Vercel this file is not used: dist/ is served as static files and /api/*.js run as functions.

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProd = process.argv.includes('--prod');
const port = Number(process.env.PORT) || 5173;

// Minimal .env loader (no extra dependency).
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
process.chdir(root);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use('/api', express.json({ limit: '20kb' }));

// Mount every api/*.js file at /api/<name>, mirroring Vercel's routing.
for (const file of fs.readdirSync(path.join(root, 'api'))) {
  if (!file.endsWith('.js') || file.startsWith('_')) continue;
  const route = '/api/' + file.replace(/\.js$/, '');
  const mod = await import(pathToFileURL(path.join(root, 'api', file)).href);
  app.all(route, (req, res) => mod.default(req, res));
}

if (isProd) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  const mode = process.env.SUPABASE_URL ? 'Supabase' : 'local file (.data/reviews.json)';
  console.log(`\n  ALAB website running at http://localhost:${port}  (${isProd ? 'production build' : 'dev'}, reviews → ${mode})\n`);
});
