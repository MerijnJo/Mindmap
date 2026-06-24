import express from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;
const guidanceTimeoutMs = 45000;
const imageSearchTimeoutMs = 12000;

app.use(express.json({ limit: '1mb' }));

function getHuggingFaceConfig() {
  return {
    apiKey: process.env.HF_API_KEY?.trim(),
    model: process.env.HF_MODEL?.trim() || 'Qwen/Qwen2.5-7B-Instruct',
  };
}

function normalizeImageSearchTerm(term) {
  return String(term || '')
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLabelList(labels) {
  return Array.isArray(labels)
    ? labels.map(normalizeImageSearchTerm).filter(Boolean)
    : [];
}

function normalizeImageContext(topic, context = {}) {
  return {
    label: normalizeImageSearchTerm(context.label || topic),
    rootLabel: normalizeImageSearchTerm(context.rootLabel),
    parentLabels: normalizeLabelList(context.parentLabels),
    childLabels: normalizeLabelList(context.childLabels),
    connectedLabels: normalizeLabelList(context.connectedLabels),
  };
}

function buildDutchContextQuery(topic, context) {
  if (!context.parentLabels.length && !context.rootLabel) {
    return topic;
  }

  const parentLabel = context.parentLabels[context.parentLabels.length - 1];
  const qualifier = parentLabel || context.rootLabel;

  if (!qualifier || qualifier.toLowerCase() === topic.toLowerCase()) {
    return topic;
  }

  return `${qualifier} ${topic}`;
}

function buildSimpleDutchQuery(topic, context) {
  const parts = [
    context.label || topic,
    ...context.childLabels.slice(0, 1),
  ].filter(Boolean);

  return parts.join(' ');
}

function sanitizeImageKeywordsForTopic(keywords, topic) {
  const normalizedTopic = topic.toLowerCase();
  const pollutionWords = [
    'pollution',
    'plastic',
    'trash',
    'waste',
    'garbage',
    'environment',
    'environmental',
    'climate',
    'chemical',
    'chemicals',
    'contamination',
    'contaminated',
    'toxic',
    'vervuiling',
    'milieu',
  ];
  const topicAllowsPollution = pollutionWords.some((word) => normalizedTopic.includes(word));

  if (topicAllowsPollution) return keywords;

  const cleanedKeywords = normalizeImageSearchTerm(keywords)
    .split(' ')
    .filter((word) => !pollutionWords.includes(word.toLowerCase()))
    .join(' ');

  return normalizeImageSearchTerm(cleanedKeywords);
}

async function createImageSearchKeywords(topic, context) {
  const { apiKey, model } = getHuggingFaceConfig();
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), imageSearchTimeoutMs);

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
            content: [
              'Create short English Unsplash image-search keywords for a school mind-map node.',
              'The nodeLabel is the main visual subject and must stay the main subject.',
              'Use parent/root context only as one qualifier, such as habitat, category, or location.',
              'Never replace the nodeLabel with the parent/root topic.',
              'Avoid using pollution, plastic, trash, environment, or climate keywords unless the nodeLabel itself says that.',
              'If nodeLabel is "fish" or "vissen" and parent/root is "ocean", return "ocean fish" or "marine fish", not ocean pollution and not goldfish.',
              'If nodeLabel is "ocean" or "oceaan", return ocean-related keywords, not fish, unless fish is the nodeLabel.',
              'Return only 2 to 5 English keywords, no explanation.',
            ].join(' '),
          },
          {
            role: 'user',
            content: JSON.stringify({
              nodeLabel: topic,
              rootLabel: context.rootLabel,
              parentLabels: context.parentLabels,
              childLabels: context.childLabels,
              connectedLabels: context.connectedLabels,
            }),
          },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const translatedTopic = sanitizeImageKeywordsForTopic(
      extractChatCompletionText(data),
      topic,
    );

    return translatedTopic && translatedTopic.toLowerCase() !== topic.toLowerCase()
      ? translatedTopic
      : null;
  } catch (error) {
    console.warn('Image search keyword creation failed:', error);
    return null;
  }
}

async function searchUnsplash({ accessKey, query, lang }) {
  const params = new URLSearchParams({
    query,
    lang,
    per_page: '1',
    client_id: accessKey,
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), imageSearchTimeoutMs);
  let response;

  try {
    response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Unsplash duurde te lang om te antwoorden. Probeer het zo nog eens.');
      timeoutError.status = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { errors: [responseText] };
  }

  if (!response.ok) {
    console.error('Unsplash API Error:', data);
    const message = data.errors?.[0] || 'Unknown';
    const error = new Error(`Unsplash Error: ${message}`);
    error.status = response.status;
    throw error;
  }

  return data.results?.[0]?.urls?.small || null;
}

function uniqueSearchCandidates(candidates) {
  const seen = new Set();

  return candidates.filter((candidate) => {
    const query = normalizeImageSearchTerm(candidate.query);
    if (!query) return false;

    const key = `${query.toLowerCase()}-${candidate.lang}`;
    if (seen.has(key)) return false;

    seen.add(key);
    candidate.query = query;
    return true;
  });
}

async function handleImageSearch(req, res) {
  const topic = normalizeImageSearchTerm(req.body?.topic || req.query.topic);
  const context = normalizeImageContext(topic, req.body?.context || {});

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

  try {
    const contextualDutchQuery = buildDutchContextQuery(topic, context);
    const simpleDutchQuery = buildSimpleDutchQuery(topic, context);
    const contextualEnglishQuery = await createImageSearchKeywords(topic, context);
    const searchCandidates = uniqueSearchCandidates([
      { query: contextualEnglishQuery, lang: 'en' },
      { query: contextualDutchQuery, lang: 'nl' },
      { query: simpleDutchQuery, lang: 'nl' },
      { query: topic, lang: 'nl' },
      { query: topic, lang: 'en' },
    ]);

    for (const candidate of searchCandidates) {
      const imageUrl = await searchUnsplash({
        accessKey,
        query: candidate.query,
        lang: candidate.lang,
      });

      if (imageUrl) {
        return res.json({
          imageUrl,
          imageProvider: 'unsplash',
          searchQuery: candidate.query,
          searchLanguage: candidate.lang,
          usedContext: Boolean(context.parentLabels.length || context.childLabels.length || context.rootLabel),
        });
      }
    }

    res.status(404).json({ error: 'Geen afbeeldingen gevonden voor dit onderwerp.' });
  } catch (error) {
    console.error("Unsplash API Error:", error);
    res.status(error.status || 500).json({ error: error.message || 'Afbeelding ophalen via Unsplash is mislukt.' });
  }
}

app.get('/api/images/search', handleImageSearch);
app.post('/api/images/search', handleImageSearch);

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

function getNodeContextById(mindMap) {
  return new Map((mindMap?.nodes || []).map((node) => [node.id, node]));
}

function needsBranchRoleRewrite(text) {
  return [
    /\bwelke\s+soorten\b/i,
    /\bwat\s+voor\s+soorten\b/i,
    /\btypes?\b/i,
    /\bvoorbeelden\b/i,
    /\boceaan\b[\s\S]*\brivier\b/i,
    /\brivier\b[\s\S]*\boceaan\b/i,
    /\bhoe\s+helpt\b/i,
    /\bwaarom\s+is\b[\s\S]*\bbelangrijk\s+voor\b/i,
    /\bhoe\s+kan\b[\s\S]*\bbe[iï]nvloeden\b/i,
    /\bveroorzaker\b/i,
  ].some((pattern) => pattern.test(text || ''));
}

function getRootFeedbackText(nodeContext) {
  const label = nodeContext?.label || 'het hoofdonderwerp';

  return {
    message: `Je hoofdonderwerp is duidelijk en je hebt al takken die erbij kunnen passen. Kijk nu welke tak het duidelijkst laat zien waar ${label} over gaat.`,
    question: `Welke tak laat nu het duidelijkst een oorzaak, plek of gevolg van ${label} zien?`,
  };
}

function getBranchRoleText(nodeContext) {
  const label = nodeContext?.label || 'deze node';
  const pathLabels = Array.isArray(nodeContext?.pathLabels) ? nodeContext.pathLabels.filter(Boolean) : [];
  const pathLabel = pathLabels.join(' > ') || label;

  return {
    message: `${label} kan goed in deze tak passen, maar de rol mag duidelijker worden. Laat zien of het een plek, oorzaak, gevolg, voorbeeld of levend wezen is dat met vervuiling te maken heeft.`,
    question: `Welke rol heeft ${label} in de tak ${pathLabel}?`,
  };
}

function normalizeGuidance(guidance, mindMap) {
  const nodeContextById = getNodeContextById(mindMap);
  const suggestionSlots = [
    {
      type: 'next-step',
      title: 'Wat gaat goed',
      fallbackMessage: 'Je hebt al ideeen die bij je hoofdonderwerp passen. Kies een sterke tak en bouw die verder uit.',
      fallbackQuestion: 'Welke tak zou voor een klasgenoot het makkelijkst te begrijpen zijn?',
    },
    {
      type: 'clarify',
      title: 'Kijk hier nog eens naar',
      fallbackMessage: 'Een verbinding kan nog duidelijker worden uitgelegd. Laat zien waarom het kleinere idee onder het grotere idee hoort.',
      fallbackQuestion: 'Waar kun je een node toevoegen of verplaatsen zodat de verbinding makkelijker te volgen is?',
    },
    {
      type: 'off-topic',
      title: 'Past dit erbij',
      fallbackMessage: 'Een idee heeft misschien een duidelijkere weg terug naar het hoofdonderwerp nodig. Je kunt het houden als je die weg in de mindmap laat zien.',
      fallbackQuestion: 'Welke node zou je door een klasgenoot laten uitleggen voordat je beslist waar die hoort?',
    },
  ];

  const suggestions = Array.isArray(guidance?.suggestions) ? guidance.suggestions : [];

  return {
    overview: guidance?.overview || 'Je hebt een begin voor je mindmap. Kijk nu welke ideeen duidelijk met het hoofdonderwerp verbonden zijn.',
    focusNodeId: guidance?.focusNodeId ?? null,
    suggestions: suggestionSlots.map((slot, index) => {
      const suggestion = suggestions[index] || {};
      const nodeContext = nodeContextById.get(suggestion.nodeId);
      const textToCheck = `${suggestion.message || ''} ${suggestion.question || ''}`;
      const shouldRewrite = nodeContext && needsBranchRoleRewrite(textToCheck);
      const rewritten = shouldRewrite
        ? nodeContext.isRoot
          ? getRootFeedbackText(nodeContext)
          : getBranchRoleText(nodeContext)
        : null;

      return {
        nodeId: suggestion.nodeId ?? null,
        type: slot.type,
        title: slot.title,
        message: rewritten?.message || suggestion.message || slot.fallbackMessage,
        question: rewritten?.question || suggestion.question || slot.fallbackQuestion,
      };
    }),
  };
}

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

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const parentIdsByNode = new Map(nodes.map((node) => [node.id, []]));
  const childIdsByNode = new Map(nodes.map((node) => [node.id, []]));

  edges.forEach((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return;

    parentIdsByNode.get(edge.target)?.push(edge.source);
    childIdsByNode.get(edge.source)?.push(edge.target);
  });

  const getLabel = (nodeId) => nodeById.get(nodeId)?.data?.label || '';
  const getPathLabels = (nodeId, seen = new Set()) => {
    if (seen.has(nodeId)) return [getLabel(nodeId)].filter(Boolean);
    seen.add(nodeId);

    const parents = parentIdsByNode.get(nodeId) || [];
    if (parents.length === 0) return [getLabel(nodeId)].filter(Boolean);

    return [
      ...getPathLabels(parents[0], seen),
      getLabel(nodeId),
    ].filter(Boolean);
  };

  const mindMap = {
    selectedNodeId,
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.data?.label || '',
      level: node.data?.level ?? null,
      isRoot: node.id === 'root',
      parentLabels: (parentIdsByNode.get(node.id) || []).map(getLabel).filter(Boolean),
      childLabels: (childIdsByNode.get(node.id) || []).map(getLabel).filter(Boolean),
      pathLabels: getPathLabels(node.id),
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };

  const instructions = `
You are an encouraging Socratic mind map coach for children aged 10 to 15.
Your job is to help the student think, check, and improve their own mind map. Do not complete the work for them.

Language:
- The student is Dutch-speaking. Understand Dutch mind-map labels naturally.
- Always write every user-facing part of your JSON response in Dutch: overview, title, message, and question.
- Keep the JSON property names and the type values in English exactly as requested, because the app uses them internally.
- If the student uses an English word in a node label, you may reuse that word, but the coaching sentence around it must still be Dutch.

Coaching style:
- Write in simple, friendly language that fits a 10 to 15 year old.
- Be warm and specific, but do not sound childish or overly excited.
- Use short sentences. Avoid difficult academic words unless the student's node already uses them.
- Never shame the student. If something may not fit, say it as something to check.

How to reason about the map:
- Treat the root node as the main topic. Every other node should clearly support, explain, or connect back to that topic.
- Use the map structure: connected nodes are supporting ideas or sub-ideas.
- Consider each node's label, level, parentLabels, childLabels, pathLabels, and whether the relationship between directly connected nodes is clear.
- Use pathLabels to distinguish duplicate labels in different branches. "Vissen" under "Oceaan" and "Vissen" under "Rivier" are different branch ideas.
- If the selected node is provided, give it special attention.
- A node is not off-topic just because it is broad, surprising, or imperfect. Mark it off-topic only when the connection to the main topic is unclear.
- Do not judge whether the student's factual ideas are scientifically perfect. Judge whether the mind map structure is clear.
- If a node is a reasonable example or subtopic, do not question whether it belongs. Ask how the student could make its place in the map clearer.
- If a child writes a broad category like "Food" or "Workout", treat it as a category. Ask whether the examples below it fit that category.
- Do not invent relationships between separate branches. Only discuss a connection if an edge exists in the map, or if the student clearly needs a missing link to understand one branch.
- Do not ask how two separate branches "work together" unless they are directly connected in the map.
- Do not merge duplicate labels across separate branches. If two nodes have the same label, only coach the branch shown by that node's pathLabels.
- For environmental-pollution maps, nodes like ocean, river, coral, and fish are usually places or living things affected by pollution. Coach the student to clarify their role in that branch: place, cause, consequence, affected living thing, example, or solution.
- Do not ask students to add species, types, examples, or lists unless the node itself is clearly a category for types, such as "soorten vissen". For a node like "Vissen" under "Rivier", ask what role fish have in river pollution, not which fish species to add.
- Never ask "Welke soorten..." or "Welke types..." for nodes such as Vissen, Koraal, Oceaan, Rivier, Dieren, Planten, or other normal topic nodes. Ask about the node's role in the branch instead.

Guidance rules:
- Do not give direct answers, final conclusions, essay content, or ready-made replacement nodes.
- Do not list correct facts for the topic. Ask the student to test their own ideas instead.
- Prefer questions, observations, and tiny next steps the student can act on right now.
- Start with what is working before asking the student to rethink anything.
- When something may not fit, ask the student to explain the link to the main topic, move it, or decide whether it belongs.
- Avoid questions like "How does X help with the main topic?" because they can sound like a test question. Prefer map-building questions like "Where should X sit?", "What bigger idea does X belong under?", or "What link would make this easier to follow?"
- Every question must be answerable by editing the mind map. Good actions are: add one node, move one node, rename one node, group examples, or draw one connection.
- Broad questions are okay only when they focus on one specific category node and help the student decide what relationship is missing. Do not ask for species/types/examples when the main issue is the node's relationship to the root topic.
- Do not ask vague whole-map questions such as "What aspects would you like to explore?" or questions that compare separate branches, such as "How do these work together?"
- Avoid repeated feedback. The 3 suggestions should point to different nodes or different relationships when possible.
- Do not produce three suggestions about the same label if duplicate labels exist. Use node ids and pathLabels to spread feedback across the map.
- Keep the tone concise and coach-like.

Suggestion structure:
- Always return exactly 3 suggestions.
- Every suggestion must include the exact "id" of one existing node from the provided map in nodeId.
- Use three different nodeId values when the map has at least three non-root nodes.
- Prefer the most relevant non-root node for nodeId. Use the root only for suggestion 1 if the whole main topic is the useful part.
- Suggestion 1 must be type "next-step" and title "Wat gaat goed".
  It should point out one branch, category, or connection that already makes sense.
- Suggestion 2 must be type "clarify" and title "Kijk hier nog eens naar".
  It should point out one connection, grouping, or parent-child relationship that could be clearer.
- Suggestion 3 must be type "off-topic" and title "Past dit erbij".
  It should point out one non-root node that may need a clearer path back to the main topic. Never use the root node for this suggestion. If every node seems to fit, do not call anything wrong; ask the student to double-check the weakest non-root connection.
- Each suggestion must still avoid giving the answer. It should guide the student to decide.

Bad coaching example:
"How does red meat help with muscle growth?"
"How do strength training and supplements work together?"
"What are some specific aspects of muscle growth that you'd like to explore?"
"Welke soorten vissen kunnen we toevoegen?"
"Hoe kunnen we de vissen in de oceaan en de rivier nog duidelijker maken?"
"Waar zou het best passen om de vissen te plaatsen zodat de connectie duidelijker wordt?"

Better coaching example:
"Red meat looks like an example under Food. Would you keep it there, or place it under a smaller group so the branch is easier to follow?"
"Strength Training is its own branch from Muscle Growth. Would adding one smaller exercise example under it make that branch clearer?"
"Supplements is a branch from Muscle Growth. Would you keep it as a main branch, or move it under a bigger category like Food?"
"Vissen staat in de tak Rivier. Welke rol heeft deze node daar: gaat het om dieren die last hebben van vervuiling, of om iets anders?"
"Koraal staat onder Oceaan. Welke kleine toevoeging zou laten zien waarom koraal bij milieuvervuiling hoort?"
"Oceaan is een duidelijke plek in je mindmap. Welke verbinding laat zien dat deze plek met milieuvervuiling te maken heeft?"

Return only valid JSON with this shape:
{
  "overview": "one short child-friendly observation that mentions what is already working and what to check next",
  "focusNodeId": "existing node id to focus on next",
  "suggestions": [
    {
      "nodeId": "exact existing node id from the map",
      "type": "next-step | clarify | connection | off-topic",
      "title": "exactly one of these Dutch titles: Wat gaat goed, Kijk hier nog eens naar, Past dit erbij",
      "message": "2 short Dutch sentences: first say what is useful, then say what to check again without solving it",
      "question": "one guiding Dutch question for the student"
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
            content: `Analyseer deze mindmap en coach de leerling in het Nederlands:\n${JSON.stringify(mindMap, null, 2)}`,
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

    res.json(normalizeGuidance(parseGuidance(text), mindMap));
  } catch (error) {
    console.error('Hugging Face Guidance Error:', error);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Hugging Face took too long to answer. Try again in a moment, or use a faster HF_MODEL.' });
    }

    res.status(500).json({ error: 'Failed to generate AI guidance.' });
  }
});

app.listen(port, () => console.log(`Backend proxy running on port ${port}`));
