import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useMenu } from '../../../features/menu/hooks';
import { lightTokens } from '../../../shared/config/tokens';

export const SearchPanel = observer(() => {
  const menuStore = useMenu();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const TOKENS = lightTokens;

  return (
    <div
      className="p-3 flex items-center gap-2 border-b relative"
      style={{ borderColor: TOKENS.color['border.muted'] as string }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        style={{ background: TOKENS.color['bg.input'] as string }}
      >
        ☰
      </button>
      <div className="relative flex-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search"
          className="w-full rounded-[20px] h-10 pl-10 pr-4 focus:outline-none placeholder-[#9AA0A6]"
          style={{
            background: TOKENS.color['bg.search'] as string,
            color: TOKENS.color['text.primary'] as string,
            border: focused
              ? `1px solid ${TOKENS.color['icon.accent']}`
              : '1px solid transparent',
            boxShadow: focused
              ? `0 0 0 3px ${TOKENS.color['focus.ring']}`
              : 'none',
          }}
        />
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: TOKENS.color['icon.normal'] as string }}
        >
          🔍
        </div>
      </div>
      {open && (
        <div
          className="absolute top-12 left-2 w-56 rounded-lg shadow-lg z-20 text-sm"
          onMouseLeave={() => setOpen(false)}
          style={{
            backgroundColor: TOKENS.color['bg.header'] as string,
            color: TOKENS.color['text.primary'] as string,
            border: `1px solid ${TOKENS.color['border.muted']}`,
            boxShadow: TOKENS.color['shadow.panel'] as string,
          }}
        >
          {menuStore.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

