import { Handle, Position } from '@xyflow/react';

const typeLabels = {
  'next-step': {
    label: 'Goed bezig',
    className: 'ai-feedback-node-good',
  },
  clarify: {
    label: 'Kijk nog eens',
    className: 'ai-feedback-node-clarify',
  },
  'off-topic': {
    label: 'Past dit erbij?',
    className: 'ai-feedback-node-check',
  },
};

export default function CustomNode({ data }) {
  const meta = typeLabels[data.type] || typeLabels.clarify;
  const handleDismiss = (event) => {
    event.preventDefault();
    event.stopPropagation();
    data.onDismiss?.();
  };
  const stopInteraction = (event) => {
    event.stopPropagation();
  };

  return (
    <div className={`ai-feedback-node ${meta.className}`}>
      <Handle
        id="feedback-target"
        type="target"
        position={Position.Left}
        className="ai-feedback-handle"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ai-feedback-eyebrow">{meta.label}</p>
          <p className="ai-feedback-related">{data.relatedLabel}</p>
        </div>
        <button
          className="ai-feedback-dismiss nodrag nopan"
          onClick={handleDismiss}
          onMouseDown={stopInteraction}
          onPointerDown={stopInteraction}
          title="Verberg feedback"
          type="button"
        >
          x
        </button>
      </div>
      <p className="ai-feedback-message">{data.message}</p>
      <p className="ai-feedback-question">{data.question}</p>
    </div>
  );
}
