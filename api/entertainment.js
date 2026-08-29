export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const feeds = {
    music: [
      "https://news.google.com/rss/search?q=music%20Africa%20global&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=African%20music%20artists&hl=en-US&gl=US&ceid=US:en"
    ],

    trending: [
      "https://news.google.com/rss/search?q=trending%20music%20songs%20artists&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=viral%20music%20Africa&hl=en-US&gl=US&ceid=US:en"
    ],

    celebrity: [
      "https://news.google.com/rss/search?q=celebrity%20entertainment&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=celebrity%20news%20Africa&hl=en-US&gl=US&ceid=US:en"
    ],

    theatre: [
      "https://news.google.com/rss/search?q=theatre%20theater%20performances&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=African%20theatre&hl=en-US&gl=US&ceid=US:en"
    ],

    events: [
      "https://news.google.com/rss/search?q=entertainment%20events%20concerts%20premieres&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=Africa%20entertainment%20events&hl=en-US&gl=US&ceid=US:en"
    ],

    awards: [
      "https://news.google.com/rss/search?q=music%20film%20television%20awards&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=African%20entertainment%20awards&hl=en-US&gl=US&ceid=US:en"
    ]
  };

  const requestedCategory =
    typeof req.query.category === "string"
      ? req.query.category
      : "all";

  const categories =
    requestedCategory === "all"
      ? Object.keys(feeds)
      : [requestedCategory];

  try {
    const output = {};

    for (const category of categories) {
      if (!feeds[category]) continue;

      const results = await Promise.allSettled(
        feeds[category].map(url => fetchFeed(url))
      );

      let items = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          items.push(...result.value);
        }
      }

      items = removeDuplicates(items);

      items.sort((a, b) => {
        return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
      });

      output[category] = items.slice(0, 12);
    }

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      data: output
    });

  } catch (error) {
    console.error("Entertainment API error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load entertainment feeds"
    });
  }
}


/* ---------------------------------------
   FETCH RSS
--------------------------------------- */

async function fetchFeed(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BRENZKafricaPlus/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Feed returned ${response.status}`);
    }

    const xml = await response.text();

    return parseRSS(xml);

  } finally {
    clearTimeout(timeout);
  }
}


/* ---------------------------------------
   SIMPLE RSS PARSER
--------------------------------------- */

function parseRSS(xml) {
  const items = [];

  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const item of itemMatches) {

    const title =
      cleanHTML(getTag(item, "title"));

    const description =
      cleanHTML(getTag(item, "description"));

    const link =
      getTag(item, "link");

    const pubDate =
      getTag(item, "pubDate");

    const source =
      cleanHTML(getTag(item, "source"));

    const image =
      extractImage(item, description);

    if (!title || !link) continue;

    items.push({
      title,
      description,
      link,
      pubDate,
      source: source || "Entertainment",
      image
    });
  }

  return items;
}


/* ---------------------------------------
   GET XML TAG
--------------------------------------- */

function getTag(xml, tag) {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = xml.match(regex);

  if (!match) return "";

  return decodeEntities(match[1].trim());
}


/* ---------------------------------------
   IMAGE EXTRACTION
--------------------------------------- */

function extractImage(item, description) {

  const media =
    item.match(
      /<media:content[^>]+url=["']([^"']+)["']/i
    );

  if (media) return media[1];

  const mediaThumbnail =
    item.match(
      /<media:thumbnail[^>]+url=["']([^"']+)["']/i
    );

  if (mediaThumbnail) return mediaThumbnail[1];

  const enclosure =
    item.match(
      /<enclosure[^>]+url=["']([^"']+)["']/i
    );

  if (enclosure) return enclosure[1];

  const imageFromDescription =
    description.match(
      /<img[^>]+src=["']([^"']+)["']/i
    );

  if (imageFromDescription) {
    return imageFromDescription[1];
  }

  return "";
}


/* ---------------------------------------
   CLEAN HTML
--------------------------------------- */

function cleanHTML(value) {

  if (!value) return "";

  return decodeEntities(
    value
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}


/* ---------------------------------------
   HTML ENTITY DECODER
--------------------------------------- */

function decodeEntities(value) {

  if (!value) return "";

  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(code)
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}


/* ---------------------------------------
   REMOVE DUPLICATES
--------------------------------------- */

function removeDuplicates(items) {

  const seen = new Set();

  return items.filter(item => {

    const key =
      item.link ||
      item.title.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}
