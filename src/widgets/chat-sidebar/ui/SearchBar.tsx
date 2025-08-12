import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import appSettingsStore from '../../../shared/config/appSettings';
import { menuStore } from '../../../features/menu/model';
import { storyStore } from '../../../features/stories/model';
import { presignForUpload } from '../../../shared/media/api';
import { profileStore } from '../../../features/profile/model';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import Avatar from '../../../shared/ui/Avatar';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  storiesCollapsed: boolean;
}

const SearchBar = observer(({ search, onSearch, storiesCollapsed }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        burgerRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !burgerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="p-2 flex items-center gap-2 border-b border-white/20 relative">
      <button
        ref={burgerRef}
        onClick={() => setMenuOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className="relative flex-1">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search"
          className="w-full bg-white/5 rounded-full px-4 py-2 pr-20 focus:outline-none emoji-text"
        />
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex -space-x-2 transition-opacity duration-300 ${storiesCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {storyStore.stories.slice(0, 3).map((s) => (
            <img
              key={s.id}
              src={s.avatar}
              className="w-6 h-6 rounded-full border border-white/20 object-cover shrink-0"
            />
          ))}
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          onMouseLeave={() => {
            setMenuOpen(false);
            setMoreOpen(false);
          }}
          className="absolute top-12 left-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-sm text-black"
        >
          {appSettingsStore.state.version === 'A'
            ? menuStore.flattenedItems.concat([{ id: 'chatbg', icon: '🖼️', label: 'Выбрать фон чата' } as any]).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.id === 'version') {
                      const next = appSettingsStore.state.version === 'K' ? 'A' : 'K';
                      appSettingsStore.setVersion(next);
                      menuStore.version = next;
                    } else if (item.id === 'dark') {
                      appSettingsStore.toggleTheme();
                    } else if (item.id === 'anim') {
                      appSettingsStore.toggleAnimations();
                    } else if (item.id === 'chatbg') {
                      fileRef.current?.click();
                      return;
                    } else if (item.id === 'user') {
                      settingsPanelStore.show('root');
                      setMenuOpen(false);
                      setMoreOpen(false);
                      return;
                    }
                    setMenuOpen(false);
                    setMoreOpen(false);
                  }}
                >
                  {item.id === 'user' ? (
                    <>
                      {profileStore.profile?.avatarUrl ? (
                        <img src={profileStore.profile.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <Avatar name={profileStore.profile?.displayName || 'U'} size={32} />
                      )}
                      <span className="ml-2">{profileStore.profile?.displayName || 'Имя пользователя'}</span>
                    </>
                  ) : (
                    <>
                      <span>{item.icon}</span>
                      <span>
                        {item.id === 'version'
                          ? appSettingsStore.state.version === 'K'
                            ? 'Переключить в А версию'
                            : 'Переключить в К версию'
                          : item.id === 'dark'
                            ? appSettingsStore.state.theme === 'dark'
                              ? 'Включить светлый режим'
                              : 'Включить темный режим'
                            : item.id === 'anim'
                              ? appSettingsStore.state.animations
                                ? 'Выключить анимацию'
                                : 'Включить анимацию'
                          : item.label}
                      </span>
                    </>
                  )}
                </div>
              ))
            : menuStore.renderedItems.concat([{ id: 'chatbg', icon: '🖼️', label: 'Выбрать фон чата' } as any]).map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => item.id === 'more' && setMoreOpen(true)}
                  onMouseLeave={() => item.id === 'more' && setMoreOpen(false)}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item.id === 'more') return;
                      if (item.id === 'version') {
                        const next = appSettingsStore.state.version === 'K' ? 'A' : 'K';
                        appSettingsStore.setVersion(next);
                        menuStore.version = next;
                      } else if (item.id === 'dark') {
                        appSettingsStore.toggleTheme();
                      } else if (item.id === 'anim') {
                        appSettingsStore.toggleAnimations();
                      } else if (item.id === 'chatbg') {
                        fileRef.current?.click();
                        return;
                      } else if (item.id === 'user') {
                        settingsPanelStore.show('root');
                        setMenuOpen(false);
                        setMoreOpen(false);
                        return;
                      }
                      setMenuOpen(false);
                      setMoreOpen(false);
                    }}
                  >
                    {item.id === 'user' ? (
                      <>
                        {profileStore.profile?.avatarUrl ? (
                          <img src={profileStore.profile.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <Avatar name={profileStore.profile?.displayName || 'U'} size={32} />
                        )}
                        <span className="ml-2">{profileStore.profile?.displayName || 'Имя пользователя'}</span>
                      </>
                    ) : (
                      <>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </div>
                  {item.id === 'more' && moreOpen && (
                    <div className="absolute top-0 left-full -ml-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-black">
                      {item.children?.concat([{ id: 'chatbg', icon: '🖼️', label: 'Выбрать фон чата' } as any]).map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            if (child.id === 'version') {
                              const next = appSettingsStore.state.version === 'K' ? 'A' : 'K';
                              appSettingsStore.setVersion(next);
                              menuStore.version = next;
                            } else if (child.id === 'dark') {
                              appSettingsStore.toggleTheme();
                            } else if (child.id === 'anim') {
                              appSettingsStore.toggleAnimations();
                            } else if (child.id === 'chatbg') {
                              fileRef.current?.click();
                              return;
                            }
                            setMenuOpen(false);
                            setMoreOpen(false);
                          }}
                        >
                          {child.id === 'user' ? (
                            <>
                              {profileStore.profile?.avatarUrl ? (
                                <img src={profileStore.profile.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <Avatar name={profileStore.profile?.displayName || 'U'} size={32} />
                              )}
                              <span className="ml-2">{profileStore.profile?.displayName || 'Имя пользователя'}</span>
                            </>
                          ) : (
                            <>
                              <span>{child.icon}</span>
                              <span>
                                {child.id === 'version'
                                  ? appSettingsStore.state.version === 'K'
                                    ? 'Переключить в А версию'
                                    : 'Переключить в К версию'
                                  : child.id === 'dark'
                                    ? appSettingsStore.state.theme === 'dark'
                                      ? 'Включить светлый режим'
                                      : 'Включить темный режим'
                                    : child.id === 'anim'
                                      ? appSettingsStore.state.animations
                                        ? 'Выключить анимацию'
                                        : 'Включить анимацию'
                                  : child.label}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          // mock presign + read local preview URL
          await presignForUpload({ filename: f.name, mime: f.type });
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = (reader.result as string) || '';
            appSettingsStore.setChatBackgroundUrl(dataUrl);
          };
          reader.readAsDataURL(f);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
});

export default SearchBar;
