const express = require('express');
const router  = express.Router();
const { getNews, searchNews, getCacheStats, CATEGORIES } = require('../cache');

// GET /api/news?category=technology&cursor=<nextPage_token>
router.get('/', async (req, res) => {
  const category = (req.query.category || 'top').toLowerCase();
  const cursor   = req.query.cursor || null;   // nextPage token for pagination

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Valid: ${CATEGORIES.join(', ')}` });
  }

  const result = await getNews(category, cursor);
  return res.json({
    category,
    count:      result.articles.length,
    articles:   result.articles,
    nextCursor: result.nextPage || null,      // pass back to frontend for next page
    hasMore:    !!result.nextPage,
  });
});

// GET /api/news/categories
router.get('/categories', (_req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/news/search?q=artificial+intelligence&cursor=<token>
router.get('/search', async (req, res) => {
  const { q, cursor } = req.query;
  const result = await searchNews(q, cursor || null);
  if (result.error) {
    return res.status(429).json({ error: result.error, articles: [] });
  }
  res.json({
    query:      q,
    count:      result.articles.length,
    articles:   result.articles,
    nextCursor: result.nextPage || null,
    hasMore:    !!result.nextPage,
  });
});

// GET /api/news/stats
router.get('/stats', (_req, res) => {
  res.json(getCacheStats());
});

module.exports = router;
