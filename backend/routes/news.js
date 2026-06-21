const express  = require('express');
const router   = express.Router();
const { getNews, searchNews, getCacheStats, CATEGORIES } = require('../cache');

// GET /api/news?category=technology
router.get('/', async (req, res) => {
  const category = (req.query.category || 'top').toLowerCase();

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Valid: ${CATEGORIES.join(', ')}` });
  }

  const articles = await getNews(category);
  return res.json({ category, count: articles.length, articles });
});

// GET /api/news/categories — list available categories
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/news/search?q=artificial+intelligence
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const result = await searchNews(q);
  if (result.error) {
    return res.status(429).json({ error: result.error, articles: [] });
  }
  res.json({ query: q, count: result.articles.length, articles: result.articles });
});

// GET /api/news/stats — monitoring endpoint
router.get('/stats', (req, res) => {
  res.json(getCacheStats());
});

module.exports = router;
