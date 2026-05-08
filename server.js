import express from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/images/search', async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Add .trim() to remove any hidden spaces or Windows carriage returns
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) {
    return res.status(500).json({ error: 'UNSPLASH_ACCESS_KEY is missing from the .env file. Please restart the backend.' });
  }

  // Debugging: Print the first 5 characters to ensure Node is seeing the real key
  console.log(`[Backend] Searching Unsplash with key starting with: ${accessKey.substring(0, 5)}...`);

  // Passing the key in the URL instead of the Authorization header to avoid header-stripping
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=1&client_id=${accessKey}`;

  try {
    // Using native fetch (available in Node.js 18+)
    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      console.error("Unsplash API Error:", data);
      return res.status(response.status).json({ error: `Unsplash Error: ${data.errors?.[0] || 'Unknown'}` });
    }

    if (data.results && data.results.length > 0) {
      res.json({ imageUrl: data.results[0].urls.small });
    } else {
      res.status(404).json({ error: 'No images found for this topic.' });
    }
  } catch (error) {
    console.error("Unsplash API Error:", error);
    res.status(500).json({ error: 'Failed to fetch image from Unsplash' });
  }
});

app.listen(port, () => console.log(`Backend proxy running on port ${port}`));