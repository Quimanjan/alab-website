# ALAB Eco Briquettes — Website

**Waste to Warmth.** The official website for ALAB, eco-friendly charcoal briquettes made from coconut shells and rice husks.

- **Frontend:** React 18 + React Router (built with Vite)
- **Backend:** Node.js serverless API (`/api/reviews`) — runs on Vercel
- **Database:** Supabase (PostgreSQL) — stores customer ratings & feedback
- **No ordering system** — the website is for viewing products + leaving 1–5 star ratings and feedback.

---

## Pages

| Page | URL | What's on it |
|---|---|---|
| Home | `/` | Hero with the draggable coconut, why ALAB, process, product showcase, sustainability, latest reviews, where to buy |
| Products | `/products` | Label info, ingredients, usage, price list, price comparison, differentiation, packaging, distribution |
| Process | `/process` | Production steps, raw materials, quality control, tools & equipment, 12-stage material handling |
| Sustainability | `/sustainability` | Coconut Shell Collection Program (CSR), impact, waste management, vision |
| About | `/about` | Name meaning, story, vision/mission/goals, team, location, credits |
| Business Plan | `/business-plan` | The complete business plan: industry, competitors, SWOT, market, survey charts, marketing, operations, management, risk |
| Reviews | `/reviews` | Rating summary, review form, all reviews (sortable) |
| Visit | `/visit` | Address, hours, map, ways to buy, how ordering works, FAQs |

All business-plan text lives in **`src/data/plan.js`**. Contact details & social links live in **`src/data/site.js`**.

---

## 1. Run it on your computer

You need **Node.js 18 or newer** ([nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev
```

Open http://localhost:5173. Without Supabase keys, reviews are saved to `.data/reviews.json` so you can test everything offline.

---

## 2. Set up Supabase (database for reviews)

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name (e.g. `alab`), set a database password, region **Southeast Asia (Singapore)**.
2. Open **SQL Editor → New query**, paste everything from **`supabase/schema.sql`**, and click **Run**.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role** secret key → this is `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key is a secret. It is only used by the Node.js API on the server. Never paste it into React files or share it publicly.

To test Supabase locally, copy `.env.example` to `.env`, paste your values, and run `npm run dev` again.

---

## 3. Deploy to Vercel

1. Push this folder to a **GitHub** repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repository.
3. Vercel detects **Vite** automatically. Leave the defaults (Build: `npm run build`, Output: `dist`).
4. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
   | `REVIEW_IP_SALT` | any long random text |

5. Click **Deploy**. Done! The React pages are served as static files and `api/reviews.js` runs as a Node.js serverless function.

If you add the variables after deploying, go to **Deployments → ⋯ → Redeploy** so they take effect.

---

## 4. Managing reviews

- Reviews appear on the site immediately.
- To **hide** a spam or inappropriate review: Supabase → **Table Editor → reviews** → set `is_visible` to `false`.
- Built-in protection: input validation, a hidden "honeypot" field for bots, and a limit of 3 reviews per visitor every 15 minutes (IP addresses are stored only as an anonymous hash).

---

## 5. Things to fill in

Open **`src/data/site.js`** and add:
- Facebook, Messenger, TikTok, Instagram, Shopee, Lazada links (until then they show "Link coming soon")
- Email and phone number (hidden until filled in)

---

## Project structure

```
api/
  reviews.js          ← Node.js API: GET & POST /api/reviews (Vercel function)
  _lib/store.js       ← Supabase / local-file storage
server/dev.js         ← local dev server (Express + Vite) — not used on Vercel
supabase/schema.sql   ← database table + security
public/images/        ← photos (logo, briquettes, materials, equipment, team)
src/
  data/plan.js        ← ALL business plan content
  data/site.js        ← contact details & links  ← edit me
  components/         ← Layout, Coconut (physics toy), charts, reviews UI
  pages/              ← one file per page
  styles/global.css   ← the dark ember design
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload + API at http://localhost:5173 |
| `npm run build` | Production build into `dist/` |
| `npm start` | Build, then serve the production version locally |

---

© ALAB Eco Briquettes — A business plan by BS Entrepreneurship students, City College of San Jose del Monte.
