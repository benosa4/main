import React from 'react';

const ActionButton: React.FC = () => {
  return (
    <button className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs cursor-pointer" aria-label="Message actions">
      ⋯
    </button>
  );
};

export default ActionButton;

