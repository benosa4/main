import React from 'react';
import type { MessageReaction } from '../../types';

export interface ReactionsProps {
  reactions?: MessageReaction[];
  onToggle?: (emoji: string) => void;
}

const Reactions: React.FC<ReactionsProps> = ({ reactions, onToggle }) => {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className="flex gap-1 mt-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          className="text-xs bg-white/10 hover:bg-white/20 px-1 rounded-full cursor-pointer"
          onClick={() => onToggle?.(r.emoji)}
        >
          {r.emoji} {r.count}
        </button>
      ))}
    </div>
  );
};

export default Reactions;
