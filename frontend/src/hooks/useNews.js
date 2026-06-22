import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategory, fetchSearch } from '../api/newsApi';

/**
 * useNews — fetches articles for a category with infinite scroll support.
 *
 * - Initial load: uses memCache so switching categories is instant
 * - loadMore():  appends the next page of articles (uses Newsdata.io cursor)
 * - refresh():   clears cache and re-fetches page 1
 */

// Session-level cache: Map<category, { articles: [], nextCursor: string|null }>
const memCache = new Map();

export function useNews(category = 'top') {
  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [hasMore,     setHasMore]     = useState(false);

  // Keep cursor in a ref so loadMore always reads the latest value
  // without needing it in the dependency array
  const cursorRef = useRef(null);
  // Guard against double-fire from IntersectionObserver
  const loadingMoreRef = useRef(false);

  // ─── Initial / category-change load ──────────────────────────────────────
  const load = useCallback(async (cat) => {
    // Hit session cache first
    if (memCache.has(cat)) {
      const cached = memCache.get(cat);
      setArticles(cached.articles);
      setHasMore(!!cached.nextCursor);
      cursorRef.current = cached.nextCursor || null;
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCategory(cat);
      const arts  = data.articles   || [];
      const next  = data.nextCursor || null;

      memCache.set(cat, { articles: arts, nextCursor: next });
      setArticles(arts);
      setHasMore(!!next);
      cursorRef.current = next;
    } catch {
      setError('Could not load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset state when category switches
    setArticles(memCache.get(category)?.articles || []);
    setHasMore(false);
    setError(null);
    cursorRef.current = null;
    load(category);
  }, [category, load]);

  // ─── Pagination: load next page ───────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const data = await fetchCategory(category, cursorRef.current);
      const newArts = data.articles   || [];
      const next    = data.nextCursor || null;

      setArticles(prev => {
        // De-duplicate by article_id in case of overlapping pages
        const seen = new Set(prev.map(a => a.article_id));
        const merged = [...prev, ...newArts.filter(a => !seen.has(a.article_id))];
        // Update session cache with full accumulated list
        memCache.set(category, { articles: merged, nextCursor: next });
        return merged;
      });

      setHasMore(!!next);
      cursorRef.current = next;
    } catch {
      // Silent fail on pagination — don't replace the existing articles
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [category]);

  // ─── Refresh: clear cache and re-fetch ───────────────────────────────────
  const refresh = useCallback(() => {
    memCache.delete(category);
    cursorRef.current = null;
    setHasMore(false);
    load(category);
  }, [category, load]);

  return { articles, loading, loadingMore, error, hasMore, loadMore, refresh };
}

/**
 * useSearch — debounced search hook with pagination.
 */
export function useSearch() {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [hasMore,     setHasMore]     = useState(false);

  const debounceRef    = useRef(null);
  const cursorRef      = useRef(null);
  const loadingMoreRef = useRef(false);
  const activeQuery    = useRef('');

  const search = useCallback((q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);

    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setHasMore(false);
      cursorRef.current = null;
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      activeQuery.current = q.trim();
      cursorRef.current   = null;
      try {
        const data = await fetchSearch(q.trim());
        setResults(data.articles || []);
        setHasMore(!!data.nextCursor);
        cursorRef.current = data.nextCursor || null;
        setError(null);
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const loadMoreResults = useCallback(async () => {
    if (!cursorRef.current || loadingMoreRef.current || !activeQuery.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchSearch(activeQuery.current, cursorRef.current);
      const newResults = data.articles || [];
      setResults(prev => {
        const seen   = new Set(prev.map(a => a.article_id));
        return [...prev, ...newResults.filter(a => !seen.has(a.article_id))];
      });
      setHasMore(!!data.nextCursor);
      cursorRef.current = data.nextCursor || null;
    } catch {
      // silent
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasMore(false);
    cursorRef.current   = null;
    activeQuery.current = '';
  };

  return { query, results, loading, loadingMore, error, hasMore, loadMoreResults, search, clearSearch };
}
