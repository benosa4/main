// Avatar.tsx

interface AvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

const toInitials = (fullName: string) => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const single = parts[0] || fullName;
  return (single.slice(0, 2)).toUpperCase();
};

const Avatar = ({ name = 'U', size = 96, className }: AvatarProps) => {
  const initials = toInitials(name);
  
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
