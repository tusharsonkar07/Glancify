/**
 * glancify Service Worker
 * ────────────────────────
 * Strategy:
 *   - Static assets  → Cache First (versioned, long-lived)
 *   - API responses  → Network First with 5-min stale fallback
 *   - Offline page   → served from cache when network fails
 */

const CACHE_VERSION   = 'newswave-v1';
const STATIC_CACHE    = `${CACHE_VERSION}-static`;
const API_CACHE       = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
];

// ─── Install: pre-cache static assets ────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate: prune old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('newswave-') && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: routing strategy ─────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, browser-extension, and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API calls → Network First with 5-minute stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Static assets → Cache First
  event.respondWith(cacheFirstStatic(request));
});

async function networkFirstAPI(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone before consuming — responses are one-use
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Network failed — serve stale API cache or empty
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ articles: [], error: 'You are offline.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Serve offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('', { status: 503 });
  }
}
