import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategory, fetchSearch } from '../api/newsApi';

/**
 * useNews — fetches articles for a given category.
 * Re-fetches automatically when `category` changes.
 * Caches results in memory so switching categories is instant.
 */
const memCache = new Map(); // session-level cache

export function useNews(category = 'top') {
  const [articles, setArticles] = useState(memCache.get(category) || []);
  const [loading,  setLoading]  = useState(!memCache.has(category));
  const [error,    setError]    = useState(null);

  const load = useCallback(async (cat) => {
    if (memCache.has(cat)) {
      setArticles(memCache.get(cat));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategory(cat);
      memCache.set(cat, data.articles || []);
      setArticles(data.articles || []);
    } catch (err) {
      setError('Could not load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setArticles(memCache.get(category) || []);
    load(category);
  }, [category, load]);

  const refresh = () => {
    memCache.delete(category);
    load(category);
  };

  return { articles, loading, error, refresh };
}

/**
 * useSearch — debounced search hook.
 */
export function useSearch() {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);

    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchSearch(q.trim());
        setResults(data.articles || []);
        setError(null);
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return { query, results, loading, error, search, clearSearch };
}
