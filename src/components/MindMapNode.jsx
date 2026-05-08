import { useState } from 'react';
import { useReactFlow, Handle, Position } from '@xyflow/react';
import { fetchImageForTopic } from '../../imageService.js';

export default function MindMapNode({ id, data, selected }) {
  const { updateNodeData, getNodes, setNodes, setEdges } = useReactFlow();
  const [isFetching, setIsFetching] = useState(false);

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

  const handleFetchImage = async () => {
    if (!data.label) {
      alert('Please enter a topic first.');
      return;
    }
    
    setIsFetching(true);
    try {
      const imageUrl = await fetchImageForTopic(data.label);
      
      if (imageUrl) {
        updateNodeData(id, { placeholderImageURL: imageUrl });
      } else {
        alert('No image found for this topic.');
      }
    } catch (error) {
      console.error(error);
      alert(`Search failed!\n\n1. Is 'npm run start-backend' running in a second terminal?\n2. Did you restart Vite?\n\nError details: ${error.message}`);
    }
    setIsFetching(false);
  };

  return (
    <div className={`flex flex-col items-center justify-center relative shadow-md rounded-2xl border group transition-all hover:shadow-lg
      ${isRoot ? 'bg-indigo-600 border-indigo-700 text-white w-[200px] min-h-[90px] p-4' : ''}
      ${isChild ? 'bg-indigo-50 border-indigo-200 w-[160px] min-h-[70px] p-3' : ''}
      ${!isRoot && !isChild ? 'bg-white border-slate-200 w-[140px] min-h-[60px] p-2' : ''}
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
      {data.placeholderImageURL ? (
        <img src={data.placeholderImageURL} alt="Node content" className="mt-3 w-full max-h-32 rounded-md object-cover pointer-events-none" />
      ) : (
        <button
          className={`nodrag mt-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10 cursor-pointer shadow-sm
            ${isRoot ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
            ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleFetchImage}
          disabled={isFetching}
          title="Find Image"
        >
          {isFetching ? (
            <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </button>
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