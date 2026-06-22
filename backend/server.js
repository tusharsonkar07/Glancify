require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const cron     = require('node-cron');
const newsRoutes              = require('./routes/news');
const { refreshAllCategories } = require('./cache');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl) and allowed origins
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/news', newsRoutes);

// Health check — Railway pings this to confirm the service is alive
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() })
);

// ─── Scheduled cache refresh ──────────────────────────────────────────────────
// Runs at minute 0 of every hour  → max 7 credits/hour if all categories are stale
cron.schedule('0 * * * *', () => {
  console.log('[cron] Hourly refresh triggered');
  refreshAllCategories();
});

// ─── Startup ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  glancify backend running on :${PORT}\n`);
  // Warm up cache 3 seconds after boot so the server is accepting requests first
  setTimeout(refreshAllCategories, 3000);
});
