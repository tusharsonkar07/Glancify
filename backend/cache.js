/**
 * NewsWave Cache Manager
 * ──────────────────────
 * Every article batch fetch costs 1 Newsdata.io credit.
 * Free tier = 200 credits/day.
 * Strategy:
 *   - Cache "top" news for 20 min  →  72 credits/day
 *   - Cache 6 categories for 60 min →  6×24 = 144 credits/day
 *   - Guard: stop at 195 to leave 5 buffer for searches
 *   - On startup, fetch everything once; cron keeps it warm
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY   = process.env.NEWSDATA_API_KEY;
const BASE_URL  = 'https://newsdata.io/api/1/latest';

const CACHE_TTL    = parseInt(process.env.CACHE_TTL_MINUTES   || '60')  * 60 * 1000;
const TOP_TTL      = parseInt(process.env.TOP_CACHE_TTL_MINUTES|| '20') * 60 * 1000;
const CREDIT_LIMIT = parseInt(process.env.DAILY_CREDIT_LIMIT  || '195');

// Categories supported by Newsdata.io free tier
const CATEGORIES = ['top', 'technology', 'sports', 'business', 'entertainment', 'science', 'health'];

// In-memory store: Map<category, { articles: [], fetchedAt: number }>
const store = new Map();

// Credit ledger resets at midnight UTC
let creditsUsed  = 0;
let ledgerDate   = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

function resetLedgerIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== ledgerDate) {
    creditsUsed = 0;
    ledgerDate  = today;
    console.log(`[cache] New day — credit counter reset. (${today})`);
  }
}

function isStale(category) {
  const entry = store.get(category);
  if (!entry) return true;
  const ttl = category === 'top' ? TOP_TTL : CACHE_TTL;
  return Date.now() - entry.fetchedAt > ttl;
}

async function fetchFromAPI(category) {
  resetLedgerIfNewDay();

  if (creditsUsed >= CREDIT_LIMIT) {
    console.warn(`[cache] Daily credit limit (${CREDIT_LIMIT}) reached. Serving stale cache.`);
    return store.get(category)?.articles || [];
  }

  if (!API_KEY) {
    console.error('[cache] NEWSDATA_API_KEY is not set!');
    return store.get(category)?.articles || [];
  }

  try {
    const params = { apikey: API_KEY, language: 'en', size: 10 };
    if (category !== 'top') params.category = category;

    const { data } = await axios.get(BASE_URL, { params, timeout: 10000 });
    const articles = (data.results || []).filter(a => a.title && !a.duplicate);

    creditsUsed += 1;
    console.log(`[cache] ✓ ${category}: ${articles.length} articles | credits used today: ${creditsUsed}/${CREDIT_LIMIT}`);

    store.set(category, { articles, fetchedAt: Date.now() });
    return articles;
  } catch (err) {
    const status = err.response?.status;
    console.error(`[cache] ✗ Fetch failed for "${category}" (HTTP ${status || 'N/A'}):`, err.message);
    // Return stale data on error rather than empty
    return store.get(category)?.articles || [];
  }
}

/** Public: get articles for a category, auto-refreshing if stale */
async function getNews(category = 'top') {
  if (!CATEGORIES.includes(category)) category = 'top';
  if (isStale(category)) await fetchFromAPI(category);
  return store.get(category)?.articles || [];
}

/** Public: live search — costs 1 credit per call, use sparingly */
async function searchNews(query) {
  resetLedgerIfNewDay();

  if (creditsUsed >= CREDIT_LIMIT) {
    return { articles: [], error: 'Daily search limit reached. Try again tomorrow.' };
  }
  if (!query || query.trim().length < 2) {
    return { articles: [], error: 'Query must be at least 2 characters.' };
  }

  try {
    const { data } = await axios.get(BASE_URL, {
      params: { apikey: API_KEY, language: 'en', q: query.trim(), size: 10 },
      timeout: 10000,
    });
    creditsUsed += 1;
    console.log(`[cache] 🔍 search "${query}" | credits: ${creditsUsed}/${CREDIT_LIMIT}`);
    return { articles: data.results || [] };
  } catch (err) {
    console.error('[cache] Search error:', err.message);
    return { articles: [], error: 'Search temporarily unavailable.' };
  }
}

/** Public: refresh every category that is stale (called by cron) */
async function refreshAllCategories() {
  console.log('[cache] Warming up categories...');
  for (const cat of CATEGORIES) {
    if (isStale(cat)) {
      await fetchFromAPI(cat);
      // 1-second gap between requests to be a good API citizen
      await new Promise(r => setTimeout(r, 1200));
    }
  }
  console.log('[cache] Warm-up complete.');
}

/** Public: stats endpoint for monitoring */
function getCacheStats() {
  resetLedgerIfNewDay();
  const categories = {};
  for (const [cat, entry] of store.entries()) {
    categories[cat] = {
      count:       entry.articles.length,
      fetchedAt:   new Date(entry.fetchedAt).toISOString(),
      ageMinutes:  Math.round((Date.now() - entry.fetchedAt) / 60000),
      isStale:     isStale(cat),
    };
  }
  return {
    date:             ledgerDate,
    creditsUsed,
    creditsRemaining: CREDIT_LIMIT - creditsUsed,
    creditLimit:      CREDIT_LIMIT,
    categories,
  };
}

module.exports = { getNews, searchNews, refreshAllCategories, getCacheStats, CATEGORIES };
