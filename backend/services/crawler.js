const axios = require('axios');
const axiosRetry = require('axios-retry');
const pLimit = require('p-limit');
const cheerio = require('cheerio');
const { parseStringPromise } = require('xml2js');

axiosRetry(axios, {
  retries: 3,
  retryDelay: retryCount => 1000 * retryCount,
  retryCondition: err => axiosRetry.isNetworkError(err)
});

async function fetchWithRetry(url) {
  const res = await axios.get(url, { timeout: 10000, headers: { Connection: 'close' } });
  return { data: res.data, status: res.status };
}

function analyzeHtml(url, html, status) {
  const $ = cheerio.load(html);
  const issues = [];
  if (status !== 200) issues.push(\`Status code \${status}\`);
  if (!$('title').text()) issues.push('Missing <title>');
  if (!$('meta[name="description"]').attr('content')) issues.push('Missing meta description');
  if ($('h1').length === 0) issues.push('No <h1> tags');
  return { url, issues };
}

async function crawlSite(startUrl, maxUrls) {
  const seen = new Set();
  const toVisit = [startUrl];
  const results = [];
  const limit = pLimit(5);

  while (toVisit.length && results.length < maxUrls) {
    const url = toVisit.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const { data, status } = await fetchWithRetry(url);
    results.push(analyzeHtml(url, data, status));
    const $ = cheerio.load(data);
    const links = $('a[href^="/"], a[href^="' + startUrl + '"]').map((i, el) => {
      let href = $(el).attr('href');
      if (href.startsWith('/')) href = startUrl + href;
      return href.split('#')[0];
    }).get();
    links.forEach(link => {
      if (!seen.has(link) && results.length + toVisit.length < maxUrls) {
        toVisit.push(link);
      }
    });
  }
  return results;
}

async function crawlSitemap(sitemapUrl) {
  const { data } = await axios.get(sitemapUrl);
  const obj = await parseStringPromise(data);
  const urls = obj.urlset.url.map(entry => entry.loc[0]);
  const limit = pLimit(5);
  return Promise.all(urls.map(url => 
    limit(async () => {
      const { data, status } = await fetchWithRetry(url);
      return analyzeHtml(url, data, status);
    })
  ));
}

module.exports = { crawlSite, crawlSitemap };
