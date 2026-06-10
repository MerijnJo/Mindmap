import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  getNodesBounds,
  getViewportForBounds,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';

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
      label: 'Hoofdonderwerp',
      placeholderImageURL: null,
      level: 0,
    },
  },
];

const initialEdges = [];

const EXPORT_PADDING = 80;
const EXPORT_MIN_WIDTH = 900;
const EXPORT_MIN_HEIGHT = 650;

const followUpPrompts = [
  {
    id: 'next',
    label: 'Wat kan ik toevoegen?',
  },
  {
    id: 'connect',
    label: 'Hoe hangen deze ideeen samen?',
  },
  {
    id: 'clarify',
    label: 'Wat kan duidelijker?',
  },
];

function getFollowUpReply(promptId, guidance) {
  const suggestions = guidance?.suggestions || [];
  const matchingSuggestion =
    suggestions.find((suggestion) => suggestion.type === promptId)
    || suggestions.find((suggestion) => promptId === 'next' && suggestion.type === 'next-step')
    || suggestions.find((suggestion) => promptId === 'connect' && suggestion.type === 'connection')
    || suggestions.find((suggestion) => promptId === 'clarify' && suggestion.type === 'clarify')
    || suggestions[0];

  if (!matchingSuggestion) {
    return 'Ik zou beginnen met een klein idee dat duidelijk bij je hoofdonderwerp past.';
  }

  return `${matchingSuggestion.message} ${matchingSuggestion.question}`;
}

function downloadImage(dataUrl, fileName) {
  const link = document.createElement('a');

  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

function getExportFileName(nodes) {
  const rootLabel = nodes.find((node) => node.id === 'root')?.data?.label || 'mind-map';
  const safeLabel = rootLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeLabel || 'mind-map'}.png`;
}

function GuidancePanel({
  isOpen,
  guidance,
  isLoading,
  error,
  nodeCount,
  selectedNode,
  activeFollowUp,
  onAnalyze,
  onFollowUp,
}) {
  if (!isOpen) return null;

  return (
    <aside className="coach-drawer absolute left-0 top-16 z-20 flex h-[calc(100vh-4rem)] w-[320px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-r border-indigo-100 bg-[#eef3ff]">
      <div className="coach-section py-6">
        <h1 className="font-sans text-2xl font-bold leading-tight text-indigo-700">AI Coach</h1>
        <p className="mt-1 font-sans text-sm text-slate-500">
          {guidance ? 'Stel een vervolgvraag.' : 'Klaar om te kijken?'}
        </p>
      </div>

      <div className="coach-section pb-5">
        <button
          className="coach-analyze-button"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Aan het nadenken...' : 'Analyseer mindmap'}
        </button>
      </div>

      <div className="coach-section pb-3">
        <p className="truncate font-sans text-sm leading-5 text-slate-600">
          {selectedNode
            ? `Focus op "${selectedNode.data?.label || 'Naamloos'}"`
            : `${nodeCount} node${nodeCount === 1 ? '' : 's'} in deze mindmap`}
        </p>
      </div>

      {error && (
        <div className="coach-error mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      {!guidance && !error && (
        <div className="coach-section min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="coach-bubble coach-bubble-ai">
            Klik op Analyseer mindmap, dan kijk ik eerst naar je ideeen.
          </div>
        </div>
      )}

      {guidance && (
        <div className="coach-section min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="coach-bubble coach-bubble-ai">
            {guidance.overview}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {(guidance.suggestions || []).map((suggestion, index) => (
              <div
                key={`${suggestion.nodeId || 'map'}-${index}`}
                className={`coach-bubble ${
                  index % 2 === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className={`text-base font-bold leading-6 ${index % 2 === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {suggestion.title}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{suggestion.message}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{suggestion.question}</p>
              </div>
            ))}
          </div>

          {activeFollowUp && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="coach-bubble coach-bubble-user">
                {followUpPrompts.find((prompt) => prompt.id === activeFollowUp)?.label}
              </div>
              <div className="coach-bubble coach-bubble-ai">
                {getFollowUpReply(activeFollowUp, guidance)}
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-indigo-100 pt-4">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Vraag verder</p>
            <div className="mt-3 flex flex-col gap-2">
              {followUpPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="coach-follow-up"
                  onClick={() => onFollowUp(prompt.id)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
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
  const [isExporting, setIsExporting] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState(null);

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
      setActiveFollowUp(null);
    } catch (error) {
      console.error(error);
      setGuidanceError(
        `AI-hulp is mislukt. Controleer of de backend draait en HF_API_KEY is ingesteld. ${error.message}`,
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [edges, nodes, selectedNodeId]);

  const handleExportImage = useCallback(async () => {
    if (nodes.length === 0) return;

    const flowViewport = document.querySelector('.react-flow__viewport');
    if (!flowViewport) {
      alert('Ik kon het mindmap-canvas niet vinden om te exporteren.');
      return;
    }

    const nodesBounds = getNodesBounds(nodes);
    const imageWidth = Math.max(Math.ceil(nodesBounds.width + EXPORT_PADDING * 2), EXPORT_MIN_WIDTH);
    const imageHeight = Math.max(Math.ceil(nodesBounds.height + EXPORT_PADDING * 2), EXPORT_MIN_HEIGHT);
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      EXPORT_PADDING / Math.max(imageWidth, imageHeight),
    );

    setIsExporting(true);
    document.body.classList.add('is-exporting-mindmap');

    try {
      const dataUrl = await toPng(flowViewport, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      downloadImage(dataUrl, getExportFileName(nodes));
    } catch (error) {
      console.error(error);
      alert('Exporteren is mislukt. Als je mindmap online afbeeldingen gebruikt, probeer de afbeelding opnieuw te laden of exporteer nog een keer.');
    } finally {
      document.body.classList.remove('is-exporting-mindmap');
      setIsExporting(false);
    }
  }, [nodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="mindmap-canvas-shell relative overflow-hidden">
      <header className="site-topbar absolute left-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-indigo-100 px-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-sans text-3xl font-extrabold leading-none text-indigo-600">MindFlow</span>
          <span className="hidden font-sans text-sm text-slate-500 sm:inline">Jouw ideeencanvas</span>
        </div>
        <div className="topbar-actions">
          <button
            className="export-button"
            onClick={handleExportImage}
            disabled={isExporting}
          >
            {isExporting ? 'Aan het exporteren...' : 'Exporteer PNG'}
          </button>
          <button
            className="coach-launcher"
            onClick={() => setIsCoachOpen((open) => !open)}
          >
            {isCoachOpen ? 'Sluit' : 'AI Coach'}
          </button>
        </div>
      </header>

      <GuidancePanel
        isOpen={isCoachOpen}
        guidance={guidance}
        isLoading={isAnalyzing}
        error={guidanceError}
        nodeCount={nodes.length}
        selectedNode={selectedNode}
        activeFollowUp={activeFollowUp}
        onAnalyze={handleAnalyzeMindMap}
        onFollowUp={setActiveFollowUp}
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
