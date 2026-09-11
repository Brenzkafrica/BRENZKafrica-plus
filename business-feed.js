export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const feeds = {
    africa: 'https://news.google.com/rss/search?q=African%20business%20economy%20companies&hl=en-US&gl=US&ceid=US:en',
    markets: 'https://news.google.com/rss/search?q=Africa%20markets%20stocks%20investment%20companies&hl=en-US&gl=US&ceid=US:en',
    fintech: 'https://news.google.com/rss/search?q=Africa%20fintech%20mobile%20money%20digital%20payments&hl=en-US&gl=US&ceid=US:en',
    economy: 'https://news.google.com/rss/search?q=Africa%20economy%20trade%20inflation%20GDP%20investment&hl=en-US&gl=US&ceid=US:en'
  };

  const category = typeof req.query.category === 'string' ? req.query.category : 'africa';
  if (!feeds[category]) {
    return res.status(400).json({ success: false, error: 'Unknown business category' });
  }

  try {
    const items = await fetchRSS(feeds[category]);
    return res.status(200).json({
      success: true,
      category,
      updatedAt: new Date().toISOString(),
      items: items.slice(0, 10)
    });
  } catch (error) {
    console.error('Business feed error:', category, error);
    return res.status(502).json({
      success: false,
      category,
      error: 'Business feed temporarily unavailable'
    });
  }
}

async function fetchRSS(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BRENZKafricaPlus/1.0' }
    });
    if (!response.ok) throw new Error(`RSS ${response.status}`);
    return parseRSS(await response.text());
  } finally {
    clearTimeout(timer);
  }
}

function parseRSS(xml) {
  const matches = xml.match(/<item[\\s\\S]*?<\\/item>/gi) || [];
  const seen = new Set();
  const items = [];

  for (const item of matches) {
    const title = clean(getTag(item, 'title'));
    const descriptionRaw = getTag(item, 'description');
    const description = clean(descriptionRaw);
    const link = getTag(item, 'link');
    const pubDate = getTag(item, 'pubDate');
    const source = clean(getTag(item, 'source')) || 'Business of Africa';
    const thumbnail = extractImage(item, descriptionRaw);
    const key = link || title.toLowerCase();

    if (!title || !link || seen.has(key)) continue;
    seen.add(key);
    items.push({ title, description, link, pubDate, author: source, source, thumbnail });
  }

  items.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
  return items;
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decode(match[1].trim()) : '';
}

function extractImage(item, description) {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i
  ];
  for (const pattern of patterns) {
    const match = (item + ' ' + (description || '')).match(pattern);
    if (match) return match[1];
  }
  return '';
}

function clean(value) {
  return decode(String(value || '')
    .replace(/<!\\[CDATA\\[|\\]\\]>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim());
}

function decode(value) {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
