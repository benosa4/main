import React from 'react';

export interface StickyDateProps {
  label: string;
}

const StickyDate: React.FC<StickyDateProps> = ({ label }) => {
  return (
    <div className="sticky top-0 z-10 flex justify-center py-1">
      <span className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs backdrop-blur-md">
        {label}
      </span>
    </div>
  );
};

export default StickyDate;

