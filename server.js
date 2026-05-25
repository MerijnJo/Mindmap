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

function extractChatCompletionText(data) {
  return data.choices?.[0]?.message?.content?.trim();
}

function parseGuidance(text) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('The AI response did not contain JSON.');
    }

    return JSON.parse(jsonMatch[0]);
  }
}

app.use(express.json({ limit: '1mb' }));

app.post('/api/ai/guidance', async (req, res) => {
  const { nodes = [], edges = [], selectedNodeId = null } = req.body || {};
  const apiKey = process.env.HF_API_KEY?.trim();
  const model = process.env.HF_MODEL?.trim() || 'meta-llama/Llama-3.1-8B-Instruct';

  if (!apiKey) {
    return res.status(500).json({ error: 'HF_API_KEY is missing from the .env file. Please restart the backend.' });
  }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: 'At least one node is required for AI guidance.' });
  }

  const mindMap = {
    selectedNodeId,
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.data?.label || '',
      level: node.data?.level ?? null,
      isRoot: node.id === 'root',
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };

  const instructions = `
You are a Socratic mind map coach for students.
Your job is to guide the student toward a clearer and more fitting mind map, not to complete the work for them.

Rules:
- Do not give direct answers, final conclusions, essay content, or ready-made replacement nodes.
- Prefer questions, observations, and small next steps the student can act on.
- Use the map structure: the root is the main topic, connected nodes are supporting ideas or sub-ideas.
- Consider each node's label, its level, its parent/children, and whether its relationship to the main topic is clear.
- If a node seems off-topic, say it gently and ask the student to explain or reconnect it.
- Keep the tone encouraging, concise, and teacher-like.
- If the selected node is provided, give it special attention.

Return only valid JSON with this shape:
{
  "overview": "one short coaching observation about the whole mind map",
  "focusNodeId": "node id to focus on next, or null",
  "suggestions": [
    {
      "nodeId": "related node id, or null",
      "type": "next-step | clarify | connection | off-topic",
      "title": "short title",
      "message": "brief observation without solving it",
      "question": "one guiding question for the student"
    }
  ]
}
Limit suggestions to 3.
`;

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: instructions,
          },
          {
            role: 'user',
            content: `Analyze this mind map and coach the student:\n${JSON.stringify(mindMap, null, 2)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 700,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Hugging Face API Error:', data);
      const message = data.error?.message || data.error || 'Unknown';
      return res.status(response.status).json({ error: `Hugging Face Error: ${message}` });
    }

    const text = extractChatCompletionText(data);
    if (!text) {
      return res.status(502).json({ error: 'Hugging Face returned an empty response.' });
    }

    res.json(parseGuidance(text));
  } catch (error) {
    console.error('Hugging Face Guidance Error:', error);
    res.status(500).json({ error: 'Failed to generate AI guidance.' });
  }
});

app.listen(port, () => console.log(`Backend proxy running on port ${port}`));
