export default async function handler(req, res) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    const CHANNEL_ID = "UCdWMS9WN8NCtB_Iddw-270Q";

    if (!API_KEY) {
      return res.status(500).json({
        error: "YOUTUBE_API_KEY is not configured."
      });
    }

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet` +
      `&order=date` +
      `&maxResults=20` +
      `&type=video`;

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "YouTube API request failed."
      });
    }

    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle
    }));

    return res.status(200).json({
      success: true,
      channelId: CHANNEL_ID,
      videos
    });

  } catch (error) {

    console.error("YouTube API error:", error);

    return res.status(500).json({
      error: "Unable to connect to YouTube."
    });
  }
}
