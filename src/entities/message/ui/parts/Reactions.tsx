import React from 'react';
import type { MessageReaction } from '../../types';

export interface ReactionsProps {
  reactions?: MessageReaction[];
}

const Reactions: React.FC<ReactionsProps> = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className="flex gap-1 mt-1">
      {reactions.map((r) => (
        <span key={r.emoji} className="text-xs bg-white/10 px-1 rounded-full">
          {r.emoji} {r.count}
        </span>
      ))}
    </div>
  );
};

export default Reactions;

