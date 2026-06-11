import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import CustomNode from './components/CustomNode';
import { fetchMindMapGuidance } from './aiGuidanceService';

const nodeTypes = { mindMapNode: MindMapNode, aiFeedback: CustomNode };

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
const AI_ANALYSIS_INTERVAL_MS = 120000;
const AI_ANALYSIS_DEBOUNCE_MS = 2500;
const MIN_LABELED_NODES_FOR_AI = 4;
const AI_FEEDBACK_NODE_PREFIX = 'ai-feedback-';
const AI_FEEDBACK_EDGE_PREFIX = 'ai-feedback-edge-';
const AI_FEEDBACK_NODE_WIDTH = 300;
const AI_FEEDBACK_NODE_HEIGHT = 220;
const AI_FEEDBACK_HORIZONTAL_GAP = 160;
const AI_FEEDBACK_VERTICAL_GAP = 34;

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

function isMindMapNode(node) {
  return node.type === 'mindMapNode';
}

function isAiFeedbackNode(node) {
  return node.type === 'aiFeedback' || node.id.startsWith(AI_FEEDBACK_NODE_PREFIX);
}

function isAiFeedbackEdge(edge) {
  return edge.id?.startsWith(AI_FEEDBACK_EDGE_PREFIX);
}

function getCleanMindMap(nodes, edges) {
  const mindMapNodes = nodes.filter(isMindMapNode);
  const mindMapNodeIds = new Set(mindMapNodes.map((node) => node.id));

  return {
    nodes: mindMapNodes,
    edges: edges.filter((edge) => (
      !isAiFeedbackEdge(edge)
      && mindMapNodeIds.has(edge.source)
      && mindMapNodeIds.has(edge.target)
    )),
  };
}

function getNodeBounds(node) {
  const width = node.width || (node.id === 'root' ? 220 : 190);
  const height = node.height || (node.data?.placeholderImageURL ? 170 : 100);

  return {
    left: node.position.x,
    right: node.position.x + width,
    top: node.position.y,
    bottom: node.position.y + height,
    width,
    height,
  };
}

function clampFeedbackY(y, minY) {
  return Math.max(minY, y);
}

function getNodePathLabel(nodeId, mindMapNodes, mindMapEdges) {
  const nodeById = new Map(mindMapNodes.map((node) => [node.id, node]));
  const parentByNode = new Map();

  mindMapEdges.forEach((edge) => {
    if (!parentByNode.has(edge.target)) {
      parentByNode.set(edge.target, edge.source);
    }
  });

  const pathLabels = [];
  let currentNodeId = nodeId;
  const seen = new Set();

  while (currentNodeId && nodeById.has(currentNodeId) && !seen.has(currentNodeId)) {
    seen.add(currentNodeId);
    const label = nodeById.get(currentNodeId)?.data?.label;
    if (label) pathLabels.unshift(label);
    currentNodeId = parentByNode.get(currentNodeId);
  }

  return pathLabels.join(' > ') || nodeById.get(nodeId)?.data?.label || 'deze node';
}

function createFeedbackGraph({ guidance, mindMapNodes, mindMapEdges, dismissFeedbackNode }) {
  const nodeById = new Map(mindMapNodes.map((node) => [node.id, node]));
  const fallbackNode = nodeById.get(guidance?.focusNodeId) || mindMapNodes.find((node) => node.id !== 'root') || mindMapNodes[0];
  const nonRootNodes = mindMapNodes.filter((node) => node.id !== 'root');
  const mindMapBounds = mindMapNodes.reduce((bounds, node) => {
    const nodeBounds = getNodeBounds(node);

    return {
      minY: Math.min(bounds.minY, nodeBounds.top),
      maxX: Math.max(bounds.maxX, nodeBounds.right),
    };
  }, { minY: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY });
  const feedbackX = Number.isFinite(mindMapBounds.maxX)
    ? mindMapBounds.maxX + AI_FEEDBACK_HORIZONTAL_GAP
    : 600;
  const feedbackMinY = Number.isFinite(mindMapBounds.minY)
    ? mindMapBounds.minY
    : 120;
  const getFallbackForSuggestion = (suggestion, index) => {
    if (nodeById.has(suggestion.nodeId)) return nodeById.get(suggestion.nodeId);
    if (suggestion.type === 'next-step') return fallbackNode;

    return nonRootNodes[index % Math.max(nonRootNodes.length, 1)] || fallbackNode;
  };
  const occupiedFeedbackRects = [];

  return (guidance?.suggestions || []).slice(0, 3).reduce((graph, suggestion, index) => {
    const targetNode = getFallbackForSuggestion(suggestion, index);
    if (!targetNode) return graph;

    const feedbackNodeId = `${AI_FEEDBACK_NODE_PREFIX}${index}`;
    const targetBounds = getNodeBounds(targetNode);
    let feedbackY = clampFeedbackY(
      targetBounds.top + (targetBounds.height / 2) - (AI_FEEDBACK_NODE_HEIGHT / 2),
      feedbackMinY,
    );

    while (occupiedFeedbackRects.some((rect) => (
      feedbackY < rect.bottom + AI_FEEDBACK_VERTICAL_GAP
      && feedbackY + AI_FEEDBACK_NODE_HEIGHT + AI_FEEDBACK_VERTICAL_GAP > rect.top
    ))) {
      feedbackY += AI_FEEDBACK_NODE_HEIGHT + AI_FEEDBACK_VERTICAL_GAP;
    }

    occupiedFeedbackRects.push({
      top: feedbackY,
      bottom: feedbackY + AI_FEEDBACK_NODE_HEIGHT,
    });

    graph.nodes.push({
      id: feedbackNodeId,
      type: 'aiFeedback',
      position: {
        x: feedbackX,
        y: feedbackY,
      },
      draggable: false,
      selectable: false,
      deletable: false,
      data: {
        type: suggestion.type,
        title: suggestion.title,
        message: suggestion.message,
        question: suggestion.question,
        relatedLabel: getNodePathLabel(targetNode.id, mindMapNodes, mindMapEdges),
        onDismiss: () => dismissFeedbackNode(feedbackNodeId),
      },
    });

    graph.edges.push({
      id: `${AI_FEEDBACK_EDGE_PREFIX}${index}`,
      source: targetNode.id,
      target: feedbackNodeId,
      targetHandle: 'feedback-target',
      type: 'straight',
      animated: false,
      selectable: false,
      deletable: false,
      className: 'ai-feedback-edge',
      style: {
        stroke: suggestion.type === 'next-step' ? '#10b981' : '#f43f5e',
        strokeWidth: 2,
        strokeDasharray: '4 6',
      },
    });

    return graph;
  }, { nodes: [], edges: [] });
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [coachStatus, setCoachStatus] = useState('AI kijkt mee');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isAnalyzingRef = useRef(false);
  const latestMindMapSignatureRef = useRef('');
  const analysisTimeoutRef = useRef(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const cleanMindMap = useMemo(() => getCleanMindMap(nodes, edges), [edges, nodes]);
  const mindMapSignature = useMemo(() => JSON.stringify({
    nodes: cleanMindMap.nodes.map((node) => ({
      id: node.id,
      label: node.data?.label || '',
      level: node.data?.level ?? null,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    })),
    edges: cleanMindMap.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
    selectedNodeId,
  }), [cleanMindMap.edges, cleanMindMap.nodes, selectedNodeId]);
  const labeledNodeCount = useMemo(
    () => cleanMindMap.nodes.filter((node) => (node.data?.label || '').trim()).length,
    [cleanMindMap.nodes],
  );
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

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeId(selectedNodes[0]?.id || null);
  }, []);

  const dismissFeedbackNode = useCallback((nodeId) => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setEdges, setNodes]);

  const handleAnalyzeMindMap = useCallback(async ({ silent = false } = {}) => {
    const { nodes: mindMapNodes, edges: mindMapEdges } = getCleanMindMap(nodes, edges);
    const labeledCount = mindMapNodes.filter((node) => (node.data?.label || '').trim()).length;
    const hasEnoughInput = labeledCount >= MIN_LABELED_NODES_FOR_AI;

    if (!hasEnoughInput || isAnalyzingRef.current) {
      if (!hasEnoughInput) {
        setCoachStatus(`Nog ${MIN_LABELED_NODES_FOR_AI - labeledCount} idee${MIN_LABELED_NODES_FOR_AI - labeledCount === 1 ? '' : 'en'} nodig`);
      }
      return;
    }

    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    if (!silent) setCoachStatus('AI kijkt naar je mindmap');

    try {
      const nextGuidance = await fetchMindMapGuidance({
        nodes: mindMapNodes,
        edges: mindMapEdges,
        selectedNodeId,
      });
      const feedbackGraph = createFeedbackGraph({
        guidance: nextGuidance,
        mindMapNodes,
        mindMapEdges,
        dismissFeedbackNode,
      });

      setNodes((currentNodes) => [
        ...currentNodes.filter((node) => !isAiFeedbackNode(node)),
        ...feedbackGraph.nodes,
      ]);
      setEdges((currentEdges) => [
        ...currentEdges.filter((edge) => !isAiFeedbackEdge(edge)),
        ...feedbackGraph.edges,
      ]);
      latestMindMapSignatureRef.current = mindMapSignature;
      setCoachStatus('Feedback staat in je mindmap');
    } catch (error) {
      console.error(error);
      setCoachStatus('AI kon nu niet meekijken');
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
    }
  }, [dismissFeedbackNode, edges, mindMapSignature, nodes, selectedNodeId, setEdges, setNodes]);

  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (labeledNodeCount < MIN_LABELED_NODES_FOR_AI) {
      const remainingCount = MIN_LABELED_NODES_FOR_AI - labeledNodeCount;
      setCoachStatus(`Nog ${remainingCount} idee${remainingCount === 1 ? '' : 'en'} nodig`);
      return undefined;
    }

    setCoachStatus((status) => (
      status === 'AI kijkt naar je mindmap' || status === 'Feedback staat in je mindmap'
        ? status
        : 'AI kijkt mee'
    ));

    analysisTimeoutRef.current = setTimeout(() => {
      if (latestMindMapSignatureRef.current !== mindMapSignature) {
        handleAnalyzeMindMap({ silent: true });
      }
    }, AI_ANALYSIS_DEBOUNCE_MS);

    return () => clearTimeout(analysisTimeoutRef.current);
  }, [handleAnalyzeMindMap, labeledNodeCount, mindMapSignature]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (labeledNodeCount >= MIN_LABELED_NODES_FOR_AI && latestMindMapSignatureRef.current !== mindMapSignature) {
        handleAnalyzeMindMap({ silent: true });
      }
    }, AI_ANALYSIS_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [handleAnalyzeMindMap, labeledNodeCount, mindMapSignature]);

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
          <div className="coach-status" aria-live="polite">
            <span className={isAnalyzing ? 'coach-status-dot is-thinking' : 'coach-status-dot'} />
            {coachStatus}
          </div>
          <button
            className="export-button"
            onClick={handleExportImage}
            disabled={isExporting}
          >
            {isExporting ? 'Aan het exporteren...' : 'Exporteer PNG'}
          </button>
          <button
            className="coach-launcher"
            onClick={() => handleAnalyzeMindMap()}
            disabled={isAnalyzing || labeledNodeCount < MIN_LABELED_NODES_FOR_AI}
          >
            {isAnalyzing ? 'Checkt...' : 'Check nu'}
          </button>
        </div>
      </header>

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
