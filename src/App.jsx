import { useCallback } from 'react';
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

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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