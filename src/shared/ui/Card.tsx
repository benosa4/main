// Card.tsx
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-2xl 
      p-6 shadow-xl border border-white/5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;