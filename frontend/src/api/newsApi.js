/**
 * glancify API client
 * Points to the Railway backend in production,
 * proxied to localhost:3001 in development (via vite.config.js).
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchCategory(category = 'top') {
  return apiFetch(`/news?category=${encodeURIComponent(category)}`);
}

export async function fetchSearch(query) {
  return apiFetch(`/news/search?q=${encodeURIComponent(query)}`);
}

export async function fetchCategories() {
  return apiFetch('/news/categories');
}
