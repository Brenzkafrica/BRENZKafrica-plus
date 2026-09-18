export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  const raw = req.query?.url;
  if (typeof raw !== 'string' || !/^https?:\/\//i.test(raw)) {
    return res.status(400).json({ error: 'A valid http(s) article URL is required.' });
  }

  let target;
  try {
    target = new URL(raw);
  } catch {
    return res.status(400).json({ error: 'Invalid article URL.' });
  }

  const hostname = target.hostname.toLowerCase();
  const blocked = new Set([
    'localhost', '127.0.0.1', '0.0.0.0', '::1',
    'metadata.google.internal', 'metadata.google.internal.'
  ]);
  if (blocked.has(hostname) || hostname.endsWith('.local')) {
    return res.status(403).json({ error: 'Host not allowed.' });
  }

  // Block obvious private/link-local IPv4 destinations.
  const ipv4 = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a,b,c,d] = ipv4.slice(1).map(Number);
    const privateIp = a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 0) || (a >= 224);
    if (privateIp) return res.status(403).json({ error: 'Host not allowed.' });
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(3000),
      headers: {
        'user-agent': 'BRENZKafrica-Plus-ImageResolver/1.0',
        'accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: `Publisher returned ${upstream.status}.` });
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return res.status(415).json({ error: 'Publisher did not return HTML.' });
    }

    const html = (await upstream.text()).slice(0, 700000);
    const candidates = [];

    const add = (value) => {
      if (!value) return;
      const decoded = String(value)
        .replace(/&amp;/gi, '&')
        .replace(/&#x2F;/gi, '/')
        .replace(/&#47;/gi, '/')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
      try {
        const absolute = new URL(decoded, upstream.url || target.toString()).toString();
        if (/^https?:\/\//i.test(absolute)) candidates.push(absolute);
      } catch {}
    };

    const patterns = [
      /<meta[^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/ig,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]*>/ig,
      /<meta[^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/ig,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]*>/ig,
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/ig,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["'][^>]*>/ig
    ];

    for (const pattern of patterns) {
      for (const match of html.matchAll(pattern)) add(match[1]);
    }

    // JSON-LD article/image fields used by many publishers.
    for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig)) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const stack = Array.isArray(parsed) ? parsed : [parsed];
        const walk = (node) => {
          if (!node || typeof node !== 'object') return;
          if (node.image) {
            if (typeof node.image === 'string') add(node.image);
            else if (Array.isArray(node.image)) node.image.forEach(add);
            else if (typeof node.image === 'object') add(node.image.url || node.image.contentUrl);
          }
          if (node.thumbnailUrl) {
            if (Array.isArray(node.thumbnailUrl)) node.thumbnailUrl.forEach(add);
            else add(node.thumbnailUrl);
          }
          for (const value of Object.values(node)) {
            if (value && typeof value === 'object') walk(value);
          }
        };
        stack.forEach(walk);
      } catch {}
    }

    const image = candidates.find(url => {
      try {
        const u = new URL(url);
        return /^https?:$/i.test(u.protocol) && !/\.svg(?:$|\?)/i.test(u.pathname);
      } catch { return false; }
    }) || '';

    return res.status(200).json({ image, source: image ? 'publisher-metadata' : null });
  } catch (error) {
    return res.status(502).json({ error: 'Unable to retrieve publisher metadata.' });
  }
}
