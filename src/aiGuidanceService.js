export async function fetchMindMapGuidance({ nodes, edges, selectedNodeId }) {
  const response = await fetch('/api/ai/guidance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nodes, edges, selectedNodeId }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  return response.json();
}
