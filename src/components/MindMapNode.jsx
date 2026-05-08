import { useReactFlow, Handle, Position } from '@xyflow/react';

export default function MindMapNode({ id, data, selected }) {
  const { updateNodeData, getNodes, setNodes, setEdges } = useReactFlow();

  const onChange = (evt) => {
    updateNodeData(id, { label: evt.target.value });
  };

  // Default to level 0 if not provided
  const level = data.level || 0;
  
  // Dynamic styles based on node depth/level
  const isRoot = level === 0;
  const isChild = level === 1;

  const onAddChild = () => {
    const nodes = getNodes();
    const parentNode = nodes.find((n) => n.id === id);
    if (!parentNode) return;

    const newNodeId = `node-${Math.random().toString(36).substring(2, 9)}`;
    
    const newNode = {
      id: newNodeId,
      type: 'mindMapNode',
      position: {
        x: parentNode.position.x + 250,
        y: parentNode.position.y + (Math.random() * 80 - 40), 
      },
      data: {
        label: '',
        placeholderImageURL: null,
        level: level + 1, // Child is one level deeper than its parent
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `e-${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
        type: 'straight',
        animated: true,
      },
    ]);
  };

  return (
    <div className={`flex flex-col items-center justify-center relative shadow-md rounded-[50%] border group transition-all hover:shadow-lg
      ${isRoot ? 'bg-indigo-600 border-indigo-700 text-white w-[180px] h-[90px]' : ''}
      ${isChild ? 'bg-indigo-50 border-indigo-200 w-[140px] h-[70px]' : ''}
      ${!isRoot && !isChild ? 'bg-white border-slate-200 w-[120px] h-[60px]' : ''}
      ${selected ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
    `}>
      {/* Drag Handle (Forced to left side using inline styles) */}
      {id !== 'root' && (
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-8 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-colors" 
          style={{ left: '16px' }}
          title="Drag node"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="5" r="1.5"></circle>
            <circle cx="16" cy="5" r="1.5"></circle>
            <circle cx="8" cy="12" r="1.5"></circle>
            <circle cx="16" cy="12" r="1.5"></circle>
            <circle cx="8" cy="19" r="1.5"></circle>
            <circle cx="16" cy="19" r="1.5"></circle>
          </svg>
        </div>
      )}

      {/* Target Handle (Center) - for incoming connections */}
      {id !== 'root' && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="opacity-0"
          style={{ left: '50%' }}
        />
      )}

      <input
        className={`nodrag font-semibold outline-none bg-transparent w-[80%] text-center border-none
          ${isRoot ? 'text-white placeholder-indigo-300 text-xl' : ''}
          ${isChild ? 'text-slate-800 placeholder-slate-400 text-lg' : ''}
          ${!isRoot && !isChild ? 'text-slate-800 placeholder-slate-400 text-base' : ''}
        `}
        value={data.label || ''}
        onChange={onChange}
        placeholder="Enter idea..."
      />
      
      {/* Contextual Image Search Placeholder */}
      {data.placeholderImageURL && (
        <img src={data.placeholderImageURL} alt="Node content" className="mt-3 w-full h-auto rounded-md object-cover" />
      )}

      {/* Source Handle (Right) - for outgoing connections */}
      <Handle type="source" position={Position.Right} className="opacity-0" style={{ right: '50%' }} />
      
      {/* "Sprout" Button */}
      <button
        className="nodrag absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 focus:outline-none shadow-sm cursor-pointer z-10"
        style={{ right: '-32px' }}
        onClick={onAddChild}
        title="Add child node"
      >
        +
      </button>
    </div>
  );
}