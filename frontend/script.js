document.getElementById('crawlSiteBtn').addEventListener('click', async () => {
  const url = document.getElementById('startUrl').value;
  const maxUrls = parseInt(document.getElementById('maxUrls').value, 10);
  const res = await fetch('/api/crawl-site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, maxUrls })
  });
  const data = await res.json();
  renderResults(data.results);
});

document.getElementById('crawlSitemapBtn').addEventListener('click', async () => {
  const sitemapUrl = document.getElementById('sitemapUrl').value;
  const res = await fetch('/api/crawl-sitemap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sitemapUrl })
  });
  const data = await res.json();
  renderResults(data.results);
});

function renderResults(results) {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';
  results.forEach(({ url, issues }) => {
    const row = document.createElement('tr');
    const urlCell = document.createElement('td');
    urlCell.textContent = url;
    const issuesCell = document.createElement('td');
    issuesCell.textContent = issues.join('; ') || 'None';
    row.appendChild(urlCell);
    row.appendChild(issuesCell);
    tbody.appendChild(row);
  });
}
