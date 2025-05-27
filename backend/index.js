const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { crawlSite, crawlSitemap } = require('./services/crawler');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../frontend'));

app.post('/api/crawl-site', async (req, res) => {
  const { url, maxUrls } = req.body;
  try {
    const results = await crawlSite(url, maxUrls);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/crawl-sitemap', async (req, res) => {
  const { sitemapUrl } = req.body;
  try {
    const results = await crawlSitemap(sitemapUrl);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
