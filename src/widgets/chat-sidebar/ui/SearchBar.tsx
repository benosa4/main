import { Fragment, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import appSettingsStore from '../../../shared/config/appSettings';
import { menuStore } from '../../../features/menu/model';
import { storyStore } from '../../../features/stories/model';
import { presignForUpload } from '../../../shared/media/api';
import { profileStore } from '../../../features/profile/model';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import Avatar from '../../../shared/ui/Avatar';
import type { MenuItem } from '../../../features/menu/api';
import { KebabButton } from '../../../shared/ui/kebab/KebabButton';
import { Image } from 'lucide-react';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  storiesCollapsed: boolean;
}

const SearchBar = observer(({ search, onSearch, storiesCollapsed }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-2 flex items-center gap-2 border-b border-white/20 relative">
      <Dropdown.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dropdown.Trigger asChild>
          <div>
            <KebabButton ariaLabel="Открыть меню" onOpenChange={setMenuOpen} />
          </div>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content
            align="start"
            side="bottom"
            sideOffset={8}
            className="z-[60] min-w-[240px] w-[min(300px,92vw)] p-[6px] rounded-2xl bg-white/90 backdrop-blur-[2px] border border-[#CFE3F3] shadow-[0_8px_30px_rgba(0,0,0,0.12)] data-[state=open]:animate-dropdown-in data-[state=closed]:animate-dropdown-out"
            style={{ backgroundImage: 'linear-gradient(180deg,#EAF6FF 0%, #E3F0FB 100%)' }}
          >
            <div className="rounded-2xl text-[#0F172A]">
              {(
                appSettingsStore.state.version === 'A'
                  ? menuStore.flattenedItems
                  : menuStore.renderedItems
              )
                .concat([{ id: 'chatbg', icon: <Image className="w-4 h-4" />, label: 'Выбрать фон чата' } as MenuItem])
                .map((item, idx, arr) => (
                  <Fragment key={item.id}>
                    <DropdownMenuItem
                      item={item}
                      onSelect={async (id) => {
                        if (id === 'version') {
                          const next = appSettingsStore.state.version === 'K' ? 'A' : 'K';
                          appSettingsStore.setVersion(next);
                          menuStore.version = next;
                        } else if (id === 'dark') {
                          appSettingsStore.toggleTheme();
                        } else if (id === 'anim') {
                          appSettingsStore.toggleAnimations();
                        } else if (id === 'chatbg') {
                          fileRef.current?.click();
                          return;
                        } else if (id === 'user') {
                          settingsPanelStore.show('root');
                        }
                        setMenuOpen(false);
                      }}
                    />
                    {idx === 1 && idx < arr.length - 1 && (
                      <Dropdown.Separator className="my-1 h-px bg-[#CFE3F3]" />
                    )}
                  </Fragment>
                ))}
            </div>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <div className="relative flex-1">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search"
          className="w-full bg-white/5 rounded-full px-4 py-2 pr-20 focus:outline-none emoji-text"
        />
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex -space-x-2 ${appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.menuTransitions ? 'transition-opacity duration-300' : ''} ${storiesCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {storyStore.stories.slice(0, 3).map((s) => (
            <img
              key={s.id}
              src={s.avatar}
              alt=""
              className="w-6 h-6 rounded-full border border-white/20 object-cover shrink-0"
            />
          ))}
        </div>
      </div>


      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const inputEl = e.currentTarget as HTMLInputElement;
          const f = inputEl.files?.[0];
          if (!f) return;
          // mock presign + read local preview URL
          const { fileUrl } = await presignForUpload({ filename: f.name, mime: f.type });
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = (reader.result as string) || '';
            appSettingsStore.addWallpaperToGallery({ url: fileUrl, cacheDataUrl: dataUrl });
            appSettingsStore.setChatWallpaperUrl(fileUrl);
          };
          reader.readAsDataURL(f);
          if (fileRef.current) fileRef.current.value = '';
        }}
      />
    </div>
  );
});

export default SearchBar;

function DropdownMenuItem({ item, onSelect }: { item: MenuItem; onSelect: (id: string) => void }) {
  const isUser = item.id === 'user';
  const isMore = item.id === 'more' && item.children && item.children.length > 0 && appSettingsStore.state.version !== 'A';
  if (isMore) {
    return (
      <Dropdown.Sub>
        <Dropdown.SubTrigger className="flex items-center justify-between gap-2 h-10 px-3 py-2 rounded-xl cursor-pointer outline-none select-none text-[#0F172A] hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500">
          <div className="flex items-center gap-2">
            <span className="text-[#5B7088]">{item.icon}</span>
            <span className="text-[14px] truncate">{item.label}</span>
          </div>
          <span aria-hidden>›</span>
        </Dropdown.SubTrigger>
        <Dropdown.Portal>
          <Dropdown.SubContent alignOffset={-4} className="min-w-[220px] p-[6px] rounded-2xl bg-white/90 backdrop-blur-[2px] border border-[#CFE3F3] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="rounded-2xl">
              {item.children!.concat([{ id: 'chatbg', icon: <Image className="w-4 h-4" />, label: 'Выбрать фон чата' } as MenuItem]).map((child) => (
                <Dropdown.Item
                  key={child.id}
                  className="group flex items-center gap-[10px] h-10 px-3 py-2 rounded-xl cursor-pointer outline-none select-none text-[#0F172A] hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500"
                  onSelect={(e) => {
                    e.preventDefault();
                    onSelect(child.id);
                  }}
                >
                  <span className="text-[#5B7088]">{child.icon}</span>
                  <span className="text-[14px] truncate">
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
                </Dropdown.Item>
              ))}
            </div>
          </Dropdown.SubContent>
        </Dropdown.Portal>
      </Dropdown.Sub>
    );
  }
  return (
    <Dropdown.Item
      className="group flex items-center gap-[10px] h-10 px-3 py-2 rounded-xl cursor-pointer outline-none select-none text-[#0F172A] hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500"
      onSelect={(e) => {
        e.preventDefault();
        onSelect(item.id);
      }}
    >
      {isUser ? (
        <>
          {profileStore.profile?.avatarCacheDataUrl ? (
            <img src={profileStore.profile.avatarCacheDataUrl} className="w-8 h-8 rounded-full object-cover" />
          ) : profileStore.profile?.avatarUrl ? (
            <img src={profileStore.profile.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <Avatar name={profileStore.profile?.displayName || 'U'} size={32} />
          )}
          <span className="ml-2">{profileStore.profile?.displayName || 'Имя пользователя'}</span>
        </>
      ) : (
        <>
          <span className="text-[#5B7088]">{item.icon}</span>
          <span className="text-[14px] truncate">
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
    </Dropdown.Item>
  );
}
