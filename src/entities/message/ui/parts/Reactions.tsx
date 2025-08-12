import React from 'react';
import type { MessageReaction } from '../../types';

export interface ReactionsProps {
  reactions?: MessageReaction[];
  onToggle?: (emoji: string) => void;
}

const colorForEmoji = (emoji: string) => {
  switch (emoji) {
    case '👍':
      return 'bg-green-500 text-white';
    case '❤️':
      return 'bg-rose-500 text-white';
    case '🔥':
      return 'bg-orange-500 text-white';
    case '😂':
      return 'bg-yellow-400 text-black';
    case '💯':
      return 'bg-red-500 text-white';
    case '😮':
      return 'bg-cyan-500 text-white';
    default:
      return 'bg-white/20 text-white';
  }
};

const Reactions: React.FC<ReactionsProps> = ({ reactions, onToggle }) => {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className="flex gap-1 mt-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          className={`text-[11px] px-1 rounded-full cursor-pointer ${colorForEmoji(r.emoji)} hover:opacity-90`}
          onClick={() => onToggle?.(r.emoji)}
        >
          {r.emoji} {r.count}
        </button>
      ))}
    </div>
  );
};

export default Reactions;
