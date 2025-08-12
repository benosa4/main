import React from 'react';
import appSettingsStore from '../../../../shared/config/appSettings';

export interface QuickReactionProps {
  onReact?: (emoji: string) => void;
}

const QUICK = ['👍', '❤️', '🔥', '😂'];

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
    default:
      return 'bg-white/20 text-white';
  }
};

const QuickReaction: React.FC<QuickReactionProps> = ({ onReact }) => {
  const animate = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.stickers.animatedReactions;
  return (
    <div className={`flex gap-1 opacity-0 group-hover:opacity-100 ${animate ? 'transition-opacity' : ''}`}>
      {QUICK.map((e) => (
        <button
          key={e}
          className={`text-xs rounded-full px-1 cursor-pointer ${colorForEmoji(e)} ${animate ? 'transition-transform hover:scale-110' : ''}`}
          onClick={() => onReact?.(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
};

export default QuickReaction;
