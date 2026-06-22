# Glancify

> A beautiful, fast, installable news reader — built with React, Express, and Newsdata.io.
> *Codename: NewsWave 3.0*

**Live app:** [glancify.vercel.app](https://glancify.vercel.app)

---

## ✨ Features

- **Bento Box Grid** — editorial layout with a hero, side cards, and quarter tiles that reflows perfectly on mobile
- **Infinite Scroll** — articles 8+ load automatically via an `IntersectionObserver` sentinel, with skeleton placeholders while fetching
- **Swipe Between Categories** (mobile) — swipe left/right anywhere on the feed to move to the next/previous category, with a directional slide animation
- **Floating Bottom Nav** (mobile) — frosted-glass pill bar with icons for all 7 categories; desktop uses a sticky `CategoryBar` instead
- **Live Search** — debounced (600 ms), paginated, each query costs 1 credit
- **Bookmarks** — persisted to `localStorage`, shown in a collapsible shelf above the feed
- **Article Reader** — bottom sheet on mobile (swipe-down to dismiss), side panel on desktop; includes native `navigator.share`, bookmarking, and a "read full story" link out to the source
- **Maker / Developer Card** — a polished popover introducing the creator (Tushar Sonkar), triggered from a "TS" monogram (desktop header), a name badge (mobile header), or the footer credit line — with a LinkedIn CTA
- **PWA / Installable** — manifest + service worker generated automatically at build time by `vite-plugin-pwa`; one-tap install on Android, manual "Add to Home Screen" instructions on iOS
- **Offline Support** — Workbox precaches the app shell; API responses use a NetworkFirst strategy with stale-while-offline fallback; `offline.html` for fully-offline navigation
- **Intro Page** — animated word-by-word reveal, shown only on the very first visit (stored in `localStorage`)
- **Multi-Key Credit Rotation** — up to 3 Newsdata.io API keys rotate automatically, turning 200 free credits/day into up to 600/day
- **Smart Server-Side Caching** — category responses are cached so thousands of readers share the same daily credit budget
- **Dark-edged light theme** — `Fraunces` serif headlines + `DM Sans` body + `DM Mono` accents, warm newsprint background

---

## 🗂️ Project Structure

```
Glancify Project (NewsWave 3.0)/
├── backend/                    ← Node.js + Express (deploy to Railway)
│   ├── server.js               ← App entry, CORS, cron warm-up, /health
│   ├── cache.js                ← Multi-key rotation + credit ledger + in-memory cache
│   ├── routes/
│   │   └── news.js             ← /api/news, /search, /categories, /stats
│   └── .env.example
└── frontend/                   ← React + Vite + Tailwind (deploy to Vercel)
    ├── public/
    │   ├── offline.html        ← Shown when fully offline and page isn't cached
    │   └── icons/               ← App icons (192/512 PNG + SVG fallbacks)
    ├── src/
    │   ├── api/
    │   │   └── newsApi.js       ← Fetch wrapper (category, search, categories)
    │   ├── hooks/
    │   │   ├── useNews.js       ← useNews() + useSearch() — pagination, session cache
    │   │   └── usePWA.js        ← beforeinstallprompt capture, iOS detection
    │   ├── pages/
    │   │   ├── IntroPage.jsx    ← First-visit splash + shared <Footer />
    │   │   └── HomePage.jsx     ← Main feed, swipe gestures, bookmarks, search
    │   └── components/
    │       ├── Header.jsx       ← Logo, search, live clock, desktop "TS" monogram
    │       ├── MakerBadge.jsx   ← Mobile-header attribution trigger
    │       ├── DeveloperCard.jsx← Maker popover (anchor="header" | "footer")
    │       ├── CategoryBar.jsx  ← Desktop category pills
    │       ├── BottomNav.jsx    ← Mobile floating category nav
    │       ├── BentoGrid.jsx    ← Layout engine + infinite scroll sentinel
    │       ├── ArticleCard.jsx  ← hero / standard / compact card variants
    │       ├── ArticleReader.jsx← Bottom sheet / side panel reader
    │       └── InstallBanner.jsx← PWA install prompt banner
    ├── vite.config.js           ← vite-plugin-pwa config (manifest + Workbox)
    ├── tailwind.config.js
    └── vercel.json              ← API rewrites to Railway + SW headers
```

---

## 🚀 Deployment Guide

### Step 1 — Get your Newsdata.io API key(s)

1. Sign up free at <https://newsdata.io/register>
2. Copy your API key from the dashboard
3. *(Optional but recommended)* Create 2 more free accounts for `NEWSDATA_API_KEY_2` / `_3` — `backend/cache.js` rotates between them automatically, turning 200 credits/day into up to 600/day

---

### Step 2 — Deploy the backend to Railway

1. Push the `backend/` folder to a GitHub repo (or push the whole monorepo)
2. Go to <https://railway.app> → **New Project → Deploy from GitHub**
3. Select your repo; Railway auto-detects Node.js
4. In **Variables**, add:
   ```
   NEWSDATA_API_KEY=your_key_here
   NEWSDATA_API_KEY_2=your_second_key_here   # optional
   NEWSDATA_API_KEY_3=your_third_key_here    # optional
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Railway gives you a public URL like `https://your-app.up.railway.app`

---

### Step 3 — Deploy the frontend to Vercel

1. Push the `frontend/` folder (or monorepo) to GitHub
2. Go to <https://vercel.com> → **New Project → Import from GitHub**
3. Set **Root Directory** to `frontend`
4. In **Environment Variables**, add:
   ```
   VITE_API_URL=https://your-app.up.railway.app/api
   ```
5. In `frontend/vercel.json`, replace the `destination` URLs with your Railway URL
6. Deploy — Vercel gives you a URL like `https://your-app.vercel.app`

> The live instance already points `vercel.json` rewrites at its own Railway backend — if you're forking this project, update those URLs to your own deployment before going live.

---

### Step 4 — PWA icons & manifest

Unlike a manually-maintained `manifest.json` / `sw.js`, this project generates both automatically at build time via `vite-plugin-pwa` (configured in `frontend/vite.config.js`). You only need to supply the source icons:

- `public/icons/glancify-icon-192.png` — 192×192 px
- `public/icons/glancify-icon-512.png` — 512×512 px

Running `npm run build` produces the final `manifest.json` and service worker — nothing to hand-write.

Free tools: [Favicon.io](https://favicon.io), [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

---

## 💡 Credit Budget (200/day per key, up to 600/day with 3 keys)

| Strategy | Credits/day (single key) | Audience |
|---|---|---|
| Category cache 60 min (7 cats) | ~168 | ∞ readers from cache |
| Top news cache 20 min | ~72 | ∞ readers from cache |
| Search queries | ~10 reserve | ~10 searches |
| Pagination (load more / search next page) | not cached, counted live | scales with active readers |
| **Total per key** | **~190 capped** | **Rotates to next key at the cap** |

`backend/cache.js` tracks a separate credit ledger per API key and rotates to the next key automatically when:
- the current key hits `DAILY_CREDIT_LIMIT` (default `190`), or
- Newsdata.io returns `429` (rate-limited) or `402` (quota exhausted)

If every key is exhausted, the cache serves the last known-good (stale) data instead of an empty feed. Ledgers reset automatically at the start of each new day.

> ⚠️ Paginated requests (infinite scroll "load more" and search "load more") always hit the live API — they are **not** served from cache — so heavy scrolling traffic consumes credits faster than the table above assumes.

---

## 🛠️ Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env       # fill in your own API key(s) — see security note below
npm run dev                 # → localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev                 # → localhost:5173  (proxies /api → :3001)
```

> **Security note:** `backend/.env.example` in this repo currently ships with real-looking Newsdata.io keys as placeholder values. Treat any key that has ever been committed to a repo as compromised — generate fresh keys for your own deployment and keep your real `.env` out of version control (`.gitignore` should already cover it).

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/news?category=top&cursor=` | Articles for a category (cached on first page; `cursor` fetches the next page live) |
| GET | `/api/news/search?q=query&cursor=` | Live search (costs 1 credit per page fetched) |
| GET | `/api/news/categories` | List all valid categories |
| GET | `/api/news/stats` | Per-key credit ledger + per-category cache status |
| GET | `/health` | Health check for Railway |

Valid categories: `top`, `technology`, `business`, `sports`, `entertainment`, `science`, `health`

Each category/search response includes `nextCursor` and `hasMore` — the frontend (`useNews.js`) uses these to drive infinite scroll.

---

## 🔧 Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEWSDATA_API_KEY` | backend `.env` | — | Required — primary API key |
| `NEWSDATA_API_KEY_2` | backend `.env` | — | Optional — second key for rotation |
| `NEWSDATA_API_KEY_3` | backend `.env` | — | Optional — third key for rotation |
| `PORT` | backend `.env` | `3001` | Server port |
| `FRONTEND_URL` | backend `.env` | `http://localhost:5173` | CORS origin (any `*.vercel.app` is also allowed) |
| `CACHE_TTL_MINUTES` | backend `.env` | `60` | Category cache lifetime |
| `TOP_CACHE_TTL_MINUTES` | backend `.env` | `20` | "Top" breaking-news cache lifetime |
| `DAILY_CREDIT_LIMIT` | backend `.env` | `190` | Per-key credit cap before rotating |
| `VITE_API_URL` | frontend `.env` | `/api` (proxied) | Backend URL in production |

---

## 📱 PWA Install — How it works

- **Android/Chrome** — the browser fires `beforeinstallprompt`; the `usePWA` hook captures it and shows a custom Install banner. One tap installs the icon.
- **iOS/Safari** — no automatic prompt; the banner shows manual instructions ("Tap Share → Add to Home Screen").
- **Already installed** — `display-mode: standalone` is detected and the banner is hidden.
- **Offline** — Workbox (via `vite-plugin-pwa`) precaches the built app shell and fonts, and serves API responses NetworkFirst with an 8-second timeout before falling back to the last cached response.

---

## 👤 About the Maker

Clicking the **"TS"** monogram (desktop header), the name badge (mobile header), or the **"Tushar Sonkar"** credit in the footer opens a small popover (`DeveloperCard.jsx`) with a short bio and a link to connect on LinkedIn. It's positioned just below the header on desktop and centered on screen when triggered from the footer.

---

*Made with ♥ in India · Glancify · 2025–26*
