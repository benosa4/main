// Avatar.tsx
import React from 'react';

interface AvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

const Avatar = ({ name = 'U', size = 96, className }: AvatarProps) => {
  const initials = name.slice(0, 2).toUpperCase();
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full bg-gradient-to-br 
        from-purple-500 to-blue-500 text-white font-bold shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;