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

const nodeTypes = { mindMapNode: MindMapNode };

const initialNodes = [
  {
    id: 'root',
    type: 'mindMapNode',
    draggable: false,
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
    <aside className="coach-drawer absolute left-0 top-16 z-20 flex h-[calc(100vh-4rem)] w-[320px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-r border-indigo-100 bg-[#eef3ff]">
      <div className="coach-section relative py-8 text-center">
        <button
          className="coach-icon-button absolute right-4 top-4"
          onClick={onClose}
          title="Close coach"
        >
          x
        </button>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-indigo-500 bg-white shadow-[0_12px_28px_rgba(67,56,202,0.2)]">
          <span className="font-sans text-3xl font-extrabold text-indigo-600">AI</span>
        </div>
        <h1 className="mt-4 font-sans text-2xl font-bold leading-tight text-indigo-700">AI Coach</h1>
        <p className="mt-1 font-sans text-sm text-slate-500">Ready to explore?</p>
      </div>

      <div className="coach-section pb-5">
        <button
          className="coach-analyze-button"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Analyze Mind Map'}
        </button>
      </div>

      <div className="coach-section pb-4">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Coach Suggestions
        </p>
        <p className="mt-2 truncate font-sans text-sm leading-5 text-slate-600">
          {selectedNode
            ? `Focused on "${selectedNode.data?.label || 'Untitled'}"`
            : `${nodeCount} node${nodeCount === 1 ? '' : 's'} in this map`}
        </p>
      </div>

      {error && (
        <div className="coach-error mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      {!guidance && !error && (
        <div className="coach-section">
          <div className="rounded-sm border border-indigo-100 bg-white p-5 font-sans text-base leading-7 text-slate-800 shadow-sm">
            Ask the coach to review your map structure and suggest what to think about next.
          </div>
        </div>
      )}

      {guidance && (
        <div className="coach-section min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="rounded-sm border border-indigo-100 bg-white p-5 font-sans text-base leading-7 text-slate-800 shadow-sm">
            {guidance.overview}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {(guidance.suggestions || []).map((suggestion, index) => (
              <div
                key={`${suggestion.nodeId || 'map'}-${index}`}
                className={`rounded-sm border p-4 font-sans shadow-sm ${
                  index % 2 === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className={`text-base font-bold leading-6 ${index % 2 === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {suggestion.title}
                  </h2>
                  <span className="text-xs text-slate-500">{suggestion.type}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{suggestion.message}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{suggestion.question}</p>
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
        stroke: '#b9b8cf',
        strokeWidth: 2,
        strokeDasharray: '7 7',
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
      <header className="site-topbar absolute left-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-indigo-100 px-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-sans text-3xl font-extrabold leading-none text-indigo-600">MindFlow</span>
          <span className="hidden font-sans text-sm text-slate-500 sm:inline">Personal idea canvas</span>
        </div>
        <button
          className="coach-launcher"
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
          style: { stroke: '#b9b8cf', strokeWidth: 2, strokeDasharray: '7 7' },
        }}
      >
        <Controls position="top-right" className="flow-controls" />
        <Background variant="dots" gap={20} size={1.4} color="#c7cbe6" />
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
