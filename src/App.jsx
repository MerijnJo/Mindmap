import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MindMapNode from './components/MindMapNode';
import { fetchMindMapGuidance } from './aiGuidanceService';

// Register the custom node
const nodeTypes = { mindMapNode: MindMapNode };

const initialNodes = [
  {
    id: 'root',
    type: 'mindMapNode',
    draggable: false, // Lock the root node in place
    position: { x: 250, y: 300 },
    data: { 
      label: 'Main Topic', 
      placeholderImageURL: null, 
      level: 0,
    },
  },
];

const initialEdges = [];

function GuidancePanel({
  guidance,
  isLoading,
  error,
  nodeCount,
  selectedNode,
  onAnalyze,
}) {
  return (
    <aside className="absolute right-4 top-4 z-20 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">AI Mind Map Coach</h1>
          <p className="mt-1 text-xs text-slate-500">
            {selectedNode ? `Focused on "${selectedNode.data?.label || 'Untitled'}"` : `${nodeCount} node${nodeCount === 1 ? '' : 's'} in this map`}
          </p>
        </div>
        <button
          className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {!guidance && !error && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Ask the coach to review your map structure and suggest what to think about next.
        </div>
      )}

      {guidance && (
        <div className="flex flex-col gap-3">
          <p className="rounded-md bg-slate-50 p-3 text-sm leading-5 text-slate-700">
            {guidance.overview}
          </p>

          <div className="flex flex-col gap-2">
            {(guidance.suggestions || []).map((suggestion, index) => (
              <div key={`${suggestion.nodeId || 'map'}-${index}`} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">{suggestion.title}</h2>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
                    {suggestion.type}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">{suggestion.message}</p>
                <p className="mt-2 text-sm font-medium leading-5 text-slate-800">{suggestion.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [guidanceError, setGuidanceError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeId(selectedNodes[0]?.id || null);
  }, []);

  const handleAnalyzeMindMap = useCallback(async () => {
    setIsAnalyzing(true);
    setGuidanceError('');

    try {
      const nextGuidance = await fetchMindMapGuidance({ nodes, edges, selectedNodeId });
      setGuidance(nextGuidance);
    } catch (error) {
      console.error(error);
      setGuidanceError(
        `AI guidance failed. Check that the backend is running and HF_API_KEY is set. ${error.message}`,
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [edges, nodes, selectedNodeId]);

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="relative bg-slate-50">
      <GuidancePanel
        guidance={guidance}
        isLoading={isAnalyzing}
        error={guidanceError}
        nodeCount={nodes.length}
        selectedNode={selectedNode}
        onAnalyze={handleAnalyzeMindMap}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <Background variant="dots" gap={15} size={1.5} className="text-slate-200" />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
