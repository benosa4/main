import React from 'react';

export interface QuickReactionProps {
  onReact?: (emoji: string) => void;
}

const QUICK = ['👍', '❤️', '🔥', '😂'];

const QuickReaction: React.FC<QuickReactionProps> = ({ onReact }) => {
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {QUICK.map((e) => (
        <button
          key={e}
          className="text-xs rounded-full bg-white/10 hover:bg-white/20 px-1 cursor-pointer"
          onClick={() => onReact?.(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
};

export default QuickReaction;

