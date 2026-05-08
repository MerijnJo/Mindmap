export async function fetchImageForTopic(topic) {
  try {
    // This calls our local backend proxy, NOT Unsplash directly
    const response = await fetch(`/api/images/search?topic=${encodeURIComponent(topic)}`);
    
    if (!response.ok) {
      // Capture the exact error from the server (e.g. 504 Gateway Timeout or 404)
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Failed to fetch image from backend:", error);
    throw error; // Rethrow to let the UI handle it
  }
}