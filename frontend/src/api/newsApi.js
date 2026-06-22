/**
 * Glancify API client
 * Points to the Railway backend in production,
 * proxied to localhost:3001 in development (via vite.config.js).
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/**
 * @param {string} category
 * @param {string|null} cursor - nextPage token for loading more results
 */
export async function fetchCategory(category = 'top', cursor = null) {
  let url = `/news?category=${encodeURIComponent(category)}`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  return apiFetch(url);
}

/**
 * @param {string} query
 * @param {string|null} cursor - nextPage token for pagination
 */
export async function fetchSearch(query, cursor = null) {
  let url = `/news/search?q=${encodeURIComponent(query)}`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  return apiFetch(url);
}

export async function fetchCategories() {
  return apiFetch('/news/categories');
}
