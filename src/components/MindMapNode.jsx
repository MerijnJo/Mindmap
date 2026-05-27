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
  const hasImage = Boolean(data.placeholderImageURL);
  const nodeSizeClass = hasImage
    ? isRoot
      ? 'w-[220px]'
      : isChild
        ? 'w-[205px]'
        : 'w-[190px]'
    : isRoot
      ? 'w-[220px] min-h-[96px]'
      : isChild
        ? 'w-[175px] min-h-[78px]'
        : 'w-[165px] min-h-[70px]';
  const imageSizeClass = isRoot ? 'h-[140px]' : isChild ? 'h-[130px]' : 'h-[120px]';

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
        animated: false,
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
    <div className={`mind-map-node group relative border border-neutral-900 bg-white shadow-sm transition hover:shadow-md
      ${nodeSizeClass}
      ${selected ? 'selected-node' : ''}
    `}>
      {id !== 'root' && (
        <div 
          className="absolute left-2 top-1/2 z-20 flex h-8 w-5 -translate-y-1/2 cursor-grab items-center justify-center bg-white/65 text-neutral-900 opacity-80 transition hover:opacity-100 active:cursor-grabbing"
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
          position={Position.Top} 
          className="opacity-0"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}

      <div className={`${hasImage ? 'border-b border-neutral-900 px-8 py-1' : 'flex min-h-[inherit] flex-col items-center justify-center px-4 py-4'}`}>
        <input
          className={`nodrag w-full border-none bg-transparent text-center font-sans font-medium text-neutral-950 outline-none placeholder:text-neutral-400
            ${hasImage ? 'text-base leading-6' : ''}
            ${!hasImage && isRoot ? 'text-xl' : ''}
            ${!hasImage && isChild ? 'text-lg' : ''}
            ${!hasImage && !isRoot && !isChild ? 'text-base' : ''}
          `}
          value={data.label || ''}
          onChange={onChange}
          placeholder="Enter idea..."
        />

        {!hasImage && (
          <button
            className={`nodrag mt-3 flex h-7 w-7 items-center justify-center rounded-none border border-neutral-900 bg-white text-neutral-950 shadow-sm transition hover:bg-neutral-100
              ${isFetching ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleFetchImage}
            disabled={isFetching}
            title="Find image"
          >
            {isFetching ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {hasImage && (
        <div className="relative">
          <img src={data.placeholderImageURL} alt="Node content" className={`block ${imageSizeClass} w-full object-cover pointer-events-none`} />
          <button
            className={`nodrag absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-neutral-900 bg-white/85 text-neutral-950 shadow-sm transition hover:bg-white
              ${isFetching ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleFetchImage}
            disabled={isFetching}
            title="Refresh image"
          >
            {isFetching ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Top}
        className="opacity-0"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      
      <button
        className="nodrag absolute right-[-15px] top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border border-neutral-900 bg-white text-xl leading-none text-neutral-950 opacity-0 shadow-sm transition hover:bg-neutral-100 focus:opacity-100 focus:outline-none group-hover:opacity-100"
        onClick={onAddChild}
        title="Add child node"
      >
        +
      </button>
    </div>
  );
}
