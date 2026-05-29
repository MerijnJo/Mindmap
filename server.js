import express from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;
const guidanceTimeoutMs = 45000;

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

function normalizeGuidance(guidance) {
  const suggestionSlots = [
    {
      type: 'next-step',
      title: 'What is good',
      fallbackMessage: 'You already have ideas connected to your main topic. Choose one strong branch and keep building from it.',
      fallbackQuestion: 'Which branch would be easiest for another student to understand?',
    },
    {
      type: 'clarify',
      title: 'Needs another look',
      fallbackMessage: 'One connection could be explained more clearly. Try to show why the smaller idea belongs under the bigger idea.',
      fallbackQuestion: 'Where could you add or move one node so the connection is easier to follow?',
    },
    {
      type: 'off-topic',
      title: 'Check if it fits',
      fallbackMessage: 'One idea may need a clearer path back to the main topic. You can keep it if you can show that path in the map.',
      fallbackQuestion: 'Which node would you ask a classmate to explain before deciding where it belongs?',
    },
  ];

  const suggestions = Array.isArray(guidance?.suggestions) ? guidance.suggestions : [];

  return {
    overview: guidance?.overview || 'You have a start to your mind map. Now check which ideas connect clearly to the main topic.',
    focusNodeId: guidance?.focusNodeId ?? null,
    suggestions: suggestionSlots.map((slot, index) => {
      const suggestion = suggestions[index] || {};

      return {
        nodeId: suggestion.nodeId ?? null,
        type: slot.type,
        title: slot.title,
        message: suggestion.message || slot.fallbackMessage,
        question: suggestion.question || slot.fallbackQuestion,
      };
    }),
  };
}

app.use(express.json({ limit: '1mb' }));

app.post('/api/ai/guidance', async (req, res) => {
  const { nodes = [], edges = [], selectedNodeId = null } = req.body || {};
  const apiKey = process.env.HF_API_KEY?.trim();
  const model = process.env.HF_MODEL?.trim() || 'Qwen/Qwen2.5-7B-Instruct';

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
You are an encouraging Socratic mind map coach for children aged 10 to 15.
Your job is to help the student think, check, and improve their own mind map. Do not complete the work for them.

Coaching style:
- Write in simple, friendly language that fits a 10 to 15 year old.
- Be warm and specific, but do not sound childish or overly excited.
- Use short sentences. Avoid difficult academic words unless the student's node already uses them.
- Never shame the student. If something may not fit, say it as something to check.

How to reason about the map:
- Treat the root node as the main topic. Every other node should clearly support, explain, or connect back to that topic.
- Use the map structure: connected nodes are supporting ideas or sub-ideas.
- Consider each node's label, level, parent/children, and whether the relationship between connected nodes is clear.
- If the selected node is provided, give it special attention.
- A node is not off-topic just because it is broad, surprising, or imperfect. Mark it off-topic only when the connection to the main topic is unclear.
- Do not judge whether the student's factual ideas are scientifically perfect. Judge whether the mind map structure is clear.
- If a node is a reasonable example or subtopic, do not question whether it belongs. Ask how the student could make its place in the map clearer.
- If a child writes a broad category like "Food" or "Workout", treat it as a category. Ask whether the examples below it fit that category.
- Do not invent relationships between separate branches. Only discuss a connection if an edge exists in the map, or if the student clearly needs a missing link to understand one branch.
- Do not ask how two separate branches "work together" unless they are directly connected in the map.

Guidance rules:
- Do not give direct answers, final conclusions, essay content, or ready-made replacement nodes.
- Do not list correct facts for the topic. Ask the student to test their own ideas instead.
- Prefer questions, observations, and tiny next steps the student can act on right now.
- Start with what is working before asking the student to rethink anything.
- When something may not fit, ask the student to explain the link to the main topic, move it, or decide whether it belongs.
- Avoid questions like "How does X help with the main topic?" because they can sound like a test question. Prefer map-building questions like "Where should X sit?", "What bigger idea does X belong under?", or "What link would make this easier to follow?"
- Every question must be answerable by editing the mind map. Good actions are: add one node, move one node, rename one node, group examples, or draw one connection.
- Broad questions are okay only when they focus on one specific node and help the student add examples or subnodes under it, such as "What types of supplements could go under this node?"
- Do not ask vague whole-map questions such as "What aspects would you like to explore?" or questions that compare separate branches, such as "How do these work together?"
- Keep the tone concise and coach-like.

Suggestion structure:
- Always return exactly 3 suggestions.
- Suggestion 1 must be type "next-step" and title "What is good".
  It should point out one branch, category, or connection that already makes sense.
- Suggestion 2 must be type "clarify" and title "Needs another look".
  It should point out one connection, grouping, or parent-child relationship that could be clearer.
- Suggestion 3 must be type "off-topic" and title "Check if it fits".
  It should point out one non-root node that may need a clearer path back to the main topic. Never use the root node for this suggestion. If every node seems to fit, do not call anything wrong; ask the student to double-check the weakest non-root connection.
- Each suggestion must still avoid giving the answer. It should guide the student to decide.

Bad coaching example:
"How does red meat help with muscle growth?"
"How do strength training and supplements work together?"
"What are some specific aspects of muscle growth that you'd like to explore?"

Better coaching example:
"Red meat looks like an example under Food. Would you keep it there, or place it under a smaller group so the branch is easier to follow?"
"Strength Training is its own branch from Muscle Growth. Would adding one smaller exercise example under it make that branch clearer?"
"Supplements is a branch from Muscle Growth. Would you keep it as a main branch, or move it under a bigger category like Food?"
"Supplements is a clear branch. What types or examples could you add underneath it?"

Return only valid JSON with this shape:
{
  "overview": "one short child-friendly observation that mentions what is already working and what to check next",
  "focusNodeId": "node id to focus on next, or null",
  "suggestions": [
    {
      "nodeId": "related node id, or null",
      "type": "next-step | clarify | connection | off-topic",
      "title": "exactly one of: What is good, Needs another look, Check if it fits",
      "message": "2 short sentences: first say what is useful, then say what to check again without solving it",
      "question": "one guiding question for the student"
    }
  ]
}
Return exactly 3 suggestions using the structure above.
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), guidanceTimeoutMs);

    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
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
    clearTimeout(timeoutId);

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

    res.json(normalizeGuidance(parseGuidance(text)));
  } catch (error) {
    console.error('Hugging Face Guidance Error:', error);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Hugging Face took too long to answer. Try again in a moment, or use a faster HF_MODEL.' });
    }

    res.status(500).json({ error: 'Failed to generate AI guidance.' });
  }
});

app.listen(port, () => console.log(`Backend proxy running on port ${port}`));
