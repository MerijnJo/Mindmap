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
  isOpen,
  guidance,
  isLoading,
  error,
  nodeCount,
  selectedNode,
  onAnalyze,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <aside className="coach-drawer absolute left-4 top-20 z-20 flex max-h-[min(620px,calc(100vh-6rem))] w-[320px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-2 border-neutral-900 shadow-[8px_8px_0_rgba(0,0,0,0.14)]">
      <div className="border-b border-neutral-900 py-4 pl-10 pr-7">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold leading-tight text-neutral-950">AI Mind Map Coach</h1>
          <button
            className="coach-icon-button"
            onClick={onClose}
            title="Close coach"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-neutral-900 py-3 pl-10 pr-7">
        <div className="min-w-0">
          <p className="truncate text-sm leading-5 text-neutral-800">
            {selectedNode ? `Focused on "${selectedNode.data?.label || 'Untitled'}"` : `${nodeCount} node${nodeCount === 1 ? '' : 's'} in this map`}
          </p>
        </div>
        <button
          className="border border-neutral-900 bg-white px-3 py-1 font-sans text-sm text-neutral-950 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="my-4 ml-10 mr-7 border border-red-300 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      {!guidance && !error && (
        <div className="py-4 pl-10 pr-7 font-serif text-lg leading-7 text-neutral-900">
          Ask the coach to review your map structure and suggest what to think about next.
        </div>
      )}

      {guidance && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="border-b border-neutral-900 py-4 pl-10 pr-7 font-serif text-base leading-6 text-neutral-900">
            {guidance.overview}
          </p>

          <div className="flex flex-col">
            {(guidance.suggestions || []).map((suggestion, index) => (
              <div key={`${suggestion.nodeId || 'map'}-${index}`} className="border-b border-neutral-900 py-4 pl-10 pr-7">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif text-xl font-bold leading-6 text-neutral-950">{suggestion.title}</h2>
                  <span className="font-sans text-xs text-neutral-700">
                    {suggestion.type}
                  </span>
                </div>
                <p className="mt-4 font-serif text-base leading-6 text-neutral-900">{suggestion.message}</p>
                <p className="mt-3 font-serif text-base font-bold leading-6 text-neutral-950">{suggestion.question}</p>
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
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const styledEdges = useMemo(
    () => edges.map((edge) => ({
      ...edge,
      animated: false,
      type: 'straight',
      style: {
        stroke: '#9ca3af',
        strokeWidth: 1.4,
        strokeDasharray: '6 7',
        ...(edge.style || {}),
      },
    })),
    [edges],
  );
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
    <div style={{ width: '100vw', height: '100vh' }} className="mindmap-canvas-shell relative overflow-hidden">
      <header className="site-topbar absolute left-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-900 bg-white/90 px-5 backdrop-blur-sm">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-2xl font-bold leading-none text-neutral-950">Mindmap</span>
          <span className="hidden font-sans text-sm text-neutral-500 sm:inline">Personal idea canvas</span>
        </div>
        <button
          className="coach-launcher border border-neutral-900 bg-white px-4 py-2 font-serif text-base font-bold text-neutral-950 shadow-[4px_4px_0_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-neutral-50"
          onClick={() => setIsCoachOpen((open) => !open)}
        >
          {isCoachOpen ? 'Close Coach' : 'AI Coach'}
        </button>
      </header>
      <GuidancePanel
        isOpen={isCoachOpen}
        guidance={guidance}
        isLoading={isAnalyzing}
        error={guidanceError}
        nodeCount={nodes.length}
        selectedNode={selectedNode}
        onAnalyze={handleAnalyzeMindMap}
        onClose={() => setIsCoachOpen(false)}
      />
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'straight',
          animated: false,
          style: { stroke: '#9ca3af', strokeWidth: 1.4, strokeDasharray: '6 7' },
        }}
      >
        <Controls position="top-right" className="flow-controls" />
        <Background variant="dots" gap={20} size={1.45} color="#aeb8c6" />
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
