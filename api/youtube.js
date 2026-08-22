export default async function handler(req, res) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = "UCdWMS9WN8NCtB_Iddw-270Q";

    if (!API_KEY) {
      return res.status(500).json({
        error: "YOUTUBE_API_KEY is missing"
      });
    }

    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      "?part=snippet" +
      "&channelId=" + CHANNEL_ID +
      "&maxResults=20" +
      "&order=date" +
      "&type=video" +
      "&key=" + API_KEY;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "YouTube API error"
      });
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt
    }));

    return res.status(200).json({
      success: true,
      videos: videos
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
