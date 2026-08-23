export default async function handler(req, res) {
  try {
    const feeds = [
      {
        name: "Africanews",
        url: "https://www.africanews.com/feed/rss"
      },
      {
        name: "AllAfrica",
        url: "https://allafrica.com/tools/headlines/rdf/latest.rdf"
      }
    ];

    const allNews = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);

        if (!response.ok) continue;

        const xml = await response.text();

        const items =
          xml.match(/<item[\s\S]*?<\/item>/gi) || [];

        items.slice(0, 10).forEach(item => {

          const titleMatch =
            item.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

          const linkMatch =
            item.match(/<link[^>]*>([\s\S]*?)<\/link>/i);

          const descriptionMatch =
            item.match(
              /<description[^>]*>([\s\S]*?)<\/description>/i
            );

          const dateMatch =
            item.match(
              /<(pubDate|dc:date)[^>]*>([\s\S]*?)<\/(pubDate|dc:date)>/i
            );

          if (!titleMatch || !linkMatch) return;

          const clean = text =>
            text
              .replace(/<!\[CDATA\[/g, "")
              .replace(/\]\]>/g, "")
              .replace(/<[^>]*>/g, "")
              .trim();

          allNews.push({
            title: clean(titleMatch[1]),
            link: clean(linkMatch[1]),
            description: descriptionMatch
              ? clean(descriptionMatch[1])
              : "",
            source: feed.name,
            date: dateMatch
              ? clean(dateMatch[2])
              : ""
          });
        });

      } catch (feedError) {
        console.error(
          "Feed error:",
          feed.name,
          feedError
        );
      }
    }

    allNews.sort((a, b) => {
      const dateA =
        new Date(a.date || 0).getTime();

      const dateB =
        new Date(b.date || 0).getTime();

      return dateB - dateA;
    });

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json({
      success: true,
      updated: new Date().toISOString(),
      news: allNews.slice(0, 20)
    });

  } catch (error) {

    console.error(
      "News API error:",
      error
    );

    res.status(500).json({
      success: false,
      news: [],
      error: "Unable to load news."
    });
  }
}
