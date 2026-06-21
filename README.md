# 🌊 NewsWave

> A beautiful, fast, installable news reader — built with React, Express, and Newsdata.io.

---

## ✨ Features

- **Bento Box Grid** — editorial layout with a hero, side cards, and quarter tiles that reflows perfectly on mobile
- **PWA / Installable** — add to home screen on Android or iOS; the icon lives in your app drawer
- **Intro Page** — shown only on the very first visit, stored in `localStorage`
- **Smart Credit Caching** — your 200 free Newsdata.io credits/day serve thousands of readers via server-side caching
- **Offline Support** — service worker caches assets; stale API responses are served when the network drops
- **Search** — debounced live search, each query costs 1 credit
- **Bookmarks** — persisted to `localStorage`, shown in a collapsible shelf
- **Article Reader** — bottom sheet on mobile, side panel on desktop (no page navigation needed)
- **Dark-edged light theme** — `Fraunces` serif headlines + `DM Sans` body, warm newsprint background

---

## 🗂️ Project Structure

```
newsapp/
├── backend/          ← Node.js + Express (deploy to Railway)
│   ├── server.js
│   ├── cache.js      ← Credit manager + in-memory store
│   ├── routes/
│   │   └── news.js
│   └── .env.example
└── frontend/         ← React + Vite + Tailwind (deploy to Vercel)
    ├── public/
    │   ├── manifest.json
    │   ├── sw.js
    │   ├── offline.html
    │   └── icons/
    ├── src/
    │   ├── api/newsApi.js
    │   ├── hooks/useNews.js  useSearch.js  usePWA.js
    │   ├── pages/IntroPage.jsx  HomePage.jsx
    │   └── components/
    │       ├── Header.jsx
    │       ├── CategoryBar.jsx
    │       ├── BentoGrid.jsx
    │       ├── ArticleCard.jsx
    │       ├── ArticleReader.jsx
    │       └── InstallBanner.jsx
    └── vercel.json
```

---

## 🚀 Deployment Guide

### Step 1 — Get your Newsdata.io API key

1. Sign up free at <https://newsdata.io/register>
2. Copy your API key from the dashboard

---

### Step 2 — Deploy the backend to Railway

1. Push the `backend/` folder to a GitHub repo (or push the whole monorepo)
2. Go to <https://railway.app> → **New Project → Deploy from GitHub**
3. Select your repo; Railway auto-detects Node.js
4. In **Variables**, add:
   ```
   NEWSDATA_API_KEY=your_key_here
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Railway gives you a public URL like `https://newswave-backend.railway.app`

---

### Step 3 — Deploy the frontend to Vercel

1. Push the `frontend/` folder (or monorepo) to GitHub
2. Go to <https://vercel.com> → **New Project → Import from GitHub**
3. Set **Root Directory** to `frontend`
4. In **Environment Variables**, add:
   ```
   VITE_API_URL=https://newswave-backend.railway.app/api
   ```
5. In `frontend/vercel.json`, replace `YOUR-RAILWAY-URL` with your actual Railway URL
6. Deploy — Vercel gives you `https://newswave.vercel.app`

---

### Step 4 — PWA icons

Replace the placeholder icons before shipping:
- `public/icons/icon-192.png` — 192×192 px
- `public/icons/icon-512.png` — 512×512 px

Free tools: [Favicon.io](https://favicon.io), [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

---

## 💡 Credit Budget (200/day free tier)

| Strategy | Credits/day | Audience |
|---|---|---|
| Category cache 60 min (7 cats) | 168 | ∞ readers from cache |
| Top news cache 20 min | 72 | ∞ readers from cache |
| Search queries | ~20 reserve | ~20 searches |
| **Total** | **~190** | **Safety buffer: 10** |

The cache manager in `backend/cache.js` automatically stops API calls when `DAILY_CREDIT_LIMIT` (default 195) is reached and serves stale data instead.

---

## 🛠️ Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env       # fill in your API key
npm run dev                 # → localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev                 # → localhost:5173  (proxies /api → :3001)
```

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/news?category=top` | Articles for a category (cached) |
| GET | `/api/news/search?q=query` | Live search (costs 1 credit) |
| GET | `/api/news/categories` | List all valid categories |
| GET | `/api/news/stats` | Credit usage + cache status |
| GET | `/health` | Health check for Railway |

Valid categories: `top`, `technology`, `business`, `sports`, `entertainment`, `science`, `health`

---

## 🔧 Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEWSDATA_API_KEY` | backend `.env` | — | Required |
| `FRONTEND_URL` | backend `.env` | `http://localhost:5173` | CORS origin |
| `CACHE_TTL_MINUTES` | backend `.env` | `60` | Category cache lifetime |
| `TOP_CACHE_TTL_MINUTES` | backend `.env` | `20` | Top news cache lifetime |
| `DAILY_CREDIT_LIMIT` | backend `.env` | `195` | Hard credit stop |
| `VITE_API_URL` | frontend `.env` | `/api` (proxied) | Backend URL in prod |

---

## 📱 PWA Install — How it works

- **Android/Chrome** — the browser fires `beforeinstallprompt`; our `usePWA` hook captures it and shows a custom Install banner. One tap installs the icon.
- **iOS/Safari** — no automatic prompt; the banner shows manual instructions ("Tap Share → Add to Home Screen").
- **Already installed** — `display-mode: standalone` is detected and the banner is hidden.

---

*Made with ♥ using React + Express + Newsdata.io*
