/**
 * NewsWave Cache Manager — with pagination + API key rotation
 * ─────────────────────────────────────────────────────────────
 * Newsdata.io free tier = 200 credits/day per key.
 * With up to 3 keys, you get 600 credits/day total.
 *
 * Strategy:
 *   - Cache initial (page-1) results per category with TTL
 *   - Paginated requests (cursor provided) always hit the API fresh
 *   - Rotate to next API key automatically on 429 / credit exhaustion
 *   - Guard per-key credit usage; rotate when key is near limit
 */

require('dotenv').config();
const axios = require('axios');

// ─── API key pool ────────────────────────────────────────────────────────────
const API_KEYS = [
  process.env.NEWSDATA_API_KEY,
  process.env.NEWSDATA_API_KEY_2,
  process.env.NEWSDATA_API_KEY_3,
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error('[cache] ⚠️  No API keys found! Set NEWSDATA_API_KEY in .env');
}

const BASE_URL = 'https://newsdata.io/api/1/latest';

const CACHE_TTL    = parseInt(process.env.CACHE_TTL_MINUTES    || '60') * 60 * 1000;
const TOP_TTL      = parseInt(process.env.TOP_CACHE_TTL_MINUTES || '20') * 60 * 1000;
const CREDIT_LIMIT = parseInt(process.env.DAILY_CREDIT_LIMIT   || '190'); // per key

// Categories supported by Newsdata.io free tier
const CATEGORIES = ['top', 'technology', 'sports', 'business', 'entertainment', 'science', 'health'];

// ─── In-memory store ─────────────────────────────────────────────────────────
// Map<category, { articles: [], fetchedAt: number, nextPage: string|null }>
const store = new Map();

// ─── Per-key credit ledger ────────────────────────────────────────────────────
// Array index matches API_KEYS index
let keyIndex  = 0;
const ledger  = API_KEYS.map(() => ({ creditsUsed: 0, date: todayStr() }));

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function resetLedgerIfNewDay(idx) {
  const today = todayStr();
  if (ledger[idx].date !== today) {
    ledger[idx] = { creditsUsed: 0, date: today };
    console.log(`[cache] New day — credit counter reset for key ${idx + 1}.`);
  }
}

/** Returns true if the current key is over its credit limit */
function currentKeyExhausted() {
  resetLedgerIfNewDay(keyIndex);
  return ledger[keyIndex].creditsUsed >= CREDIT_LIMIT;
}

/** Rotate to the next available key. Returns false if all are exhausted. */
function rotateKey() {
  const start = keyIndex;
  do {
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    resetLedgerIfNewDay(keyIndex);
    if (ledger[keyIndex].creditsUsed < CREDIT_LIMIT) {
      console.log(`[cache] 🔄 Rotated to API key ${keyIndex + 1}`);
      return true;
    }
  } while (keyIndex !== start);
  console.error('[cache] ❌ All API keys exhausted for today.');
  return false;
}

function isStale(category) {
  const entry = store.get(category);
  if (!entry) return true;
  const ttl = category === 'top' ? TOP_TTL : CACHE_TTL;
  return Date.now() - entry.fetchedAt > ttl;
}

// ─── Core fetch ──────────────────────────────────────────────────────────────
/**
 * Fetch articles from Newsdata.io.
 * @param {string} category
 * @param {string|null} cursor - nextPage token for pagination (null = first page)
 * @returns {{ articles: Array, nextPage: string|null }}
 */
async function fetchFromAPI(category, cursor = null) {
  // If current key is exhausted, try rotating before we start
  if (currentKeyExhausted()) {
    if (!rotateKey()) {
      // All keys done — return whatever stale data we have
      const cached = store.get(category);
      return { articles: cached?.articles || [], nextPage: null };
    }
  }

  const key = API_KEYS[keyIndex];
  const params = { apikey: key, language: 'en', size: 10 };
  if (category !== 'top') params.category = category;
  if (cursor) params.page = cursor;

  try {
    const { data } = await axios.get(BASE_URL, { params, timeout: 12000 });
    const articles  = (data.results || []).filter(a => a.title && !a.duplicate);
    const nextPage  = data.nextPage || null;

    ledger[keyIndex].creditsUsed += 1;
    console.log(
      `[cache] ✓ ${category}${cursor ? ' (page+)' : ''}: ${articles.length} articles` +
      ` | key ${keyIndex + 1} credits: ${ledger[keyIndex].creditsUsed}/${CREDIT_LIMIT}` +
      (nextPage ? ' | has next page' : '')
    );

    return { articles, nextPage };

  } catch (err) {
    const status = err.response?.status;

    // 429 = rate-limited, 402 = payment/quota — rotate key and retry once
    if ((status === 429 || status === 402) && API_KEYS.length > 1) {
      console.warn(`[cache] ⚠️  Key ${keyIndex + 1} returned ${status}. Rotating...`);
      if (rotateKey()) {
        return fetchFromAPI(category, cursor); // retry with new key
      }
    }

    console.error(
      `[cache] ✗ Fetch failed for "${category}" (HTTP ${status || 'N/A'}):`, err.message
    );
    // Return stale data on error rather than empty
    const cached = store.get(category);
    return { articles: cached?.articles || [], nextPage: null };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get articles for a category.
 * - cursor=null  → use cache if fresh, otherwise fetch page 1
 * - cursor=token → always fetch from API (pagination, no caching)
 * @returns {{ articles: Array, nextPage: string|null }}
 */
async function getNews(category = 'top', cursor = null) {
  if (!CATEGORIES.includes(category)) category = 'top';

  // Paginated request — always fresh, not cached
  if (cursor) {
    return fetchFromAPI(category, cursor);
  }

  // Initial request — use cache if not stale
  if (!isStale(category)) {
    const cached = store.get(category);
    return { articles: cached.articles, nextPage: cached.nextPage || null };
  }

  const result = await fetchFromAPI(category, null);

  // Cache only the first page
  store.set(category, {
    articles:  result.articles,
    nextPage:  result.nextPage,
    fetchedAt: Date.now(),
  });

  return result;
}

/** Live search — costs 1 credit, use sparingly */
async function searchNews(query) {
  if (currentKeyExhausted() && !rotateKey()) {
    return { articles: [], error: 'Daily search limit reached. Try again tomorrow.' };
  }
  if (!query || query.trim().length < 2) {
    return { articles: [], error: 'Query must be at least 2 characters.' };
  }

  try {
    const key = API_KEYS[keyIndex];
    const { data } = await axios.get(BASE_URL, {
      params: { apikey: key, language: 'en', q: query.trim(), size: 10 },
      timeout: 12000,
    });
    ledger[keyIndex].creditsUsed += 1;
    console.log(`[cache] 🔍 search "${query}" | key ${keyIndex + 1} credits: ${ledger[keyIndex].creditsUsed}/${CREDIT_LIMIT}`);
    return { articles: data.results || [], nextPage: data.nextPage || null };
  } catch (err) {
    const status = err.response?.status;
    if ((status === 429 || status === 402) && rotateKey()) {
      return searchNews(query); // retry once with new key
    }
    console.error('[cache] Search error:', err.message);
    return { articles: [], error: 'Search temporarily unavailable.' };
  }
}

/** Called by cron — refresh stale categories */
async function refreshAllCategories() {
  console.log('[cache] Warming up categories...');
  for (const cat of CATEGORIES) {
    if (isStale(cat)) {
      await fetchFromAPI(cat, null).then(result => {
        store.set(cat, { articles: result.articles, nextPage: result.nextPage, fetchedAt: Date.now() });
      });
      await new Promise(r => setTimeout(r, 1200));
    }
  }
  console.log('[cache] Warm-up complete.');
}

/** Stats for monitoring */
function getCacheStats() {
  const categories = {};
  for (const [cat, entry] of store.entries()) {
    categories[cat] = {
      count:      entry.articles.length,
      fetchedAt:  new Date(entry.fetchedAt).toISOString(),
      ageMinutes: Math.round((Date.now() - entry.fetchedAt) / 60000),
      isStale:    isStale(cat),
      hasNextPage: !!entry.nextPage,
    };
  }
  return {
    keys:       API_KEYS.length,
    currentKey: keyIndex + 1,
    keyLedger:  ledger.map((l, i) => ({ key: i + 1, creditsUsed: l.creditsUsed, limit: CREDIT_LIMIT, date: l.date })),
    categories,
  };
}

module.exports = { getNews, searchNews, refreshAllCategories, getCacheStats, CATEGORIES };
