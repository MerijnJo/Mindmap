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
  const colorClass = isRoot
    ? 'mind-node-root'
    : isChild
      ? 'mind-node-child'
      : 'mind-node-detail';
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
    <div className={`mind-map-node group relative shadow-sm transition hover:shadow-md
      ${nodeSizeClass}
      ${colorClass}
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

      <div className={`${hasImage ? 'flex items-center gap-2 rounded-t-[18px] border-b border-current px-3 py-1.5' : 'flex min-h-[inherit] flex-col items-center justify-center px-4 py-4'}`}>
        <input
          className={`nodrag min-w-0 flex-1 border-none bg-transparent text-center font-sans font-medium text-neutral-950 outline-none placeholder:text-neutral-400
            ${hasImage ? 'text-base leading-6' : ''}
            ${!hasImage && isRoot ? 'text-xl' : ''}
            ${!hasImage && isChild ? 'text-lg' : ''}
            ${!hasImage && !isRoot && !isChild ? 'text-base' : ''}
          `}
          value={data.label || ''}
          onChange={onChange}
          placeholder="Enter idea..."
        />

        {hasImage && (
          <button
            className={`nodrag flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50
              ${isFetching ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleFetchImage}
            disabled={isFetching}
            title="Regenerate image"
          >
            {isFetching ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
                <path d="M3 21v-5h5" />
                <path d="M3 12A9 9 0 0 1 18.4 5.6L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            )}
          </button>
        )}

        {!hasImage && (
          <button
            className={`nodrag mt-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50
              ${isFetching ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleFetchImage}
            disabled={isFetching}
            title="Find image"
          >
            {isFetching ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {hasImage && (
        <div className="relative overflow-hidden rounded-b-[18px]">
          <img src={data.placeholderImageURL} alt="Node content" className={`block ${imageSizeClass} w-full object-cover pointer-events-none`} />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Top}
        className="opacity-0"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      
      <button
        className="nodrag absolute right-[-22px] top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white text-2xl font-semibold leading-none text-indigo-600 opacity-0 shadow-lg transition hover:bg-indigo-50 focus:opacity-100 focus:outline-none group-hover:opacity-100"
        onClick={onAddChild}
        title="Add child node"
      >
        +
      </button>
    </div>
  );
}
