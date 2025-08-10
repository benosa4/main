import { logout } from "../../features/auth/api";

function getNavIcon(name: string) {
  const icons = {
    Chat: '💬',
    Logout: '🚪'
  } as const;
  return icons[name as keyof typeof icons] || '🔗';
}

export function Navbar() {

  return (
    <nav className="flex items-center gap-6">
      {['Chat'].map((item) => (
        <a
          key={item}
          href={`/${item.toLowerCase()}`}
          className="flex items-center gap-2 text-base font-medium text-white/90
            hover:text-white transition-colors px-4 py-2 rounded-lg
            hover:bg-white/10 group"
        >
          <span className="group-hover:scale-110 transition-transform">
            {getNavIcon(item)}
          </span>
          {item}
        </a>
      ))}

      {/* Кнопка Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 text-base font-medium text-white/90
          hover:text-white transition-colors px-4 py-2 rounded-lg
          hover:bg-red-600/20 group"
      >
        <span className="group-hover:scale-110 transition-transform">
          {getNavIcon('Logout')}
        </span>
        Logout
      </button>
    </nav>
  );
}
