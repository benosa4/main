import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import type { Emoji } from '@emoji-mart/data';
import { useChats } from '../../features/chats/hooks';
import { chatStore } from '../../features/chats/model';
import type { Chat } from '../../features/chats/api';
import { useChatTabs } from '../../features/chat-tabs/hooks';
import { chatTabsStore } from '../../features/chat-tabs/model';
import { useMenu } from '../../features/menu/hooks';
import { menuStore } from '../../features/menu/model';
import { useStories } from '../../features/stories/hooks';
import { storyStore } from '../../features/stories/model';
import { lightTokens, darkTokens } from '../../shared/config/tokens';

  const ChatPage = observer(() => {
    useChats();
    useMenu();
    useStories();
    useChatTabs();

  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('chatTheme') as 'light' | 'dark') || 'light'
  );
  const [layoutVersion, setLayoutVersion] = useState<'K' | 'A'>(
    () => (localStorage.getItem('layoutVersion') as 'K' | 'A') || 'K'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [storiesCollapsed, setStoriesCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [chatSlides, setChatSlides] = useState<Chat[][]>([]);
  const [translate, setTranslate] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTabId = useRef<number | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
  const toggleLayoutVersion = () => {
    setLayoutVersion((prev) => (prev === 'K' ? 'A' : 'K'));
  };

  useEffect(() => {
    localStorage.setItem('chatTheme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('layoutVersion', layoutVersion);
  }, [layoutVersion]);

  const TOKENS = theme === 'dark' ? darkTokens : lightTokens;

  const themeVars: React.CSSProperties = {
    // expose variables for inline usage
    ['--primary-color' as any]: String(TOKENS.color['icon.accent']),
    ['--surface-color' as any]: String(TOKENS.color['bg.app']),
    ['--primary-text-color' as any]: String(TOKENS.color['text.primary']),
    ['--secondary-text-color' as any]: String(TOKENS.color['text.secondary']),
    ['--message-out-background-color' as any]: String(TOKENS.color['bg.message.out']),
    ['--message-out-primary-color' as any]: theme === 'dark' ? '#ffffff' : String(TOKENS.color['text.primary']),
    ['--light-filled-secondary-text-color' as any]: String(TOKENS.color['bg.input']),
  } as React.CSSProperties;

    useEffect(() => {
      const el = storyRef.current;
      if (!el) return;
      const handle = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', handle, { passive: false });
      return () => el.removeEventListener('wheel', handle);
    }, []);

    useEffect(() => {
      const el = tabRef.current;
      if (!el) return;
      const handle = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', handle, { passive: false });
      return () => el.removeEventListener('wheel', handle);
    }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEmojiSelect = (emoji: Emoji & { native?: string }) => {
    setMessage((prev) => prev + (emoji.native || ''));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setStoriesCollapsed(e.currentTarget.scrollTop > 0);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showEmoji &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node) &&
        !emojiBtnRef.current?.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

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

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
      const computeChatsForTab = (tabId: number | null) => {
        const tab = chatTabsStore.tabs.find((t) => t.id === tabId) || null;
        const set = tab ? new Set(tab.chatIds) : null;
        return chatStore.chats
          .filter((c) => !set || set.has(c.id))
          .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
      };

      if (prevTabId.current === null) {
        setChatSlides([computeChatsForTab(chatTabsStore.selectedTabId)]);
        prevTabId.current = chatTabsStore.selectedTabId;
        return;
      }

      if (chatTabsStore.selectedTabId !== prevTabId.current) {
        const prevIndex = chatTabsStore.tabs.findIndex(
          (t) => t.id === prevTabId.current
        );
        const newIndex = chatTabsStore.tabs.findIndex(
          (t) => t.id === chatTabsStore.selectedTabId
        );
        const step = newIndex > prevIndex ? 1 : -1;
        const lists: Chat[][] = [];
        for (let i = prevIndex; i !== newIndex + step; i += step) {
          const id = chatTabsStore.tabs[i].id;
          lists.push(computeChatsForTab(id));
        }
        setChatSlides(lists);
        setIsAnimating(true);
        requestAnimationFrame(() =>
          setTranslate(step * -100 * (lists.length - 1))
        );
        prevTabId.current = chatTabsStore.selectedTabId;
      } else {
        setChatSlides([computeChatsForTab(chatTabsStore.selectedTabId)]);
      }
    }, [chatStore.chats, chatTabsStore.selectedTabId, search, chatTabsStore.tabs]);
    /* eslint-enable react-hooks/exhaustive-deps */

  const handleTransitionEnd = () => {
    if (!isAnimating) return;
    const last = chatSlides[chatSlides.length - 1] || [];
    setChatSlides([last]);
    setIsAnimating(false);
    requestAnimationFrame(() => setTranslate(0));
  };

  const renderChatList = (list: Chat[]) =>
    list.map((chat) => (
      <div
        key={chat.id}
        onClick={() => chatStore.selectChat(chat.id)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg mx-2 ${
          chatStore.selectedChatId === chat.id
            ? 'bg-blue-600 text-white'
            : 'hover:bg-blue-600/10'
        }`}
      >
        <img src={chat.avatar} className="w-14 h-14 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <span className="font-semibold">{chat.name}</span>
            <span
              className={`text-xs ${
                chatStore.selectedChatId === chat.id
                  ? 'text-white/90'
                  : 'text-white/70'
              }`}
            >
              {chat.lastMessageDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className={`text-sm truncate ${
                chatStore.selectedChatId === chat.id
                  ? 'text-white/90'
                  : 'text-white/70'
              }`}
            >
              {chat.lastMessage}
            </span>
            {chat.unread > 0 ? (
              <span
                className={`ml-2 text-xs rounded-full px-2 ${
                  chatStore.selectedChatId === chat.id
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-600'
                }`}
              >
                {chat.unread}
              </span>
            ) : (
              <span className="ml-2">📌</span>
            )}
          </div>
        </div>
      </div>
    ));

  const selected = chatStore.selectedChat;

  return (
    <LayoutWithFloatingBg noFrame>
      <div
        className={`flex h-screen relative ${
          layoutVersion === 'K' ? 'mx-[2cm] w-[calc(100%-4cm)]' : 'w-full'
        }`}
        style={{
          ...themeVars,
          backgroundColor: 'var(--surface-color)',
          color: 'var(--primary-text-color)'
        }}
      >
        {/* Sidebar */}
        <aside
          className="flex flex-col relative border-r"
          style={{ width: 340, background: String(TOKENS.color['bg.sidebar']), borderColor: String(TOKENS.color['border.muted']) }}
        >
          {/* Search and menu */}
          <div
            className="p-3 flex items-center gap-2 border-b"
            style={{ borderColor: String(TOKENS.color['border.muted']) }}
          >
            <button
              ref={burgerRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: String(TOKENS.color['bg.input']) }}
            >
              ☰
            </button>
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search"
                className="w-full rounded-[20px] h-10 pl-10 pr-20 focus:outline-none placeholder-[#9AA0A6]"
                style={{
                  background: String(TOKENS.color['bg.search']),
                  color: String(TOKENS.color['text.primary']),
                  border: searchFocused ? `1px solid ${TOKENS.color['icon.accent']}` : '1px solid transparent',
                  boxShadow: searchFocused ? '0 0 0 3px rgba(51,144,236,0.15)' : 'none'
                }}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: String(TOKENS.color['icon.normal']) }}>🔍</div>
              <div
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex -space-x-2 transition-opacity duration-300 ${storiesCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {storyStore.stories.slice(0, 3).map((s) => (
                  <img
                    key={s.id}
                    src={s.avatar}
                    className="w-6 h-6 rounded-full border object-cover shrink-0"
                    style={{ borderColor: String(TOKENS.color['border.muted']) }}
                  />
                ))}
              </div>
            </div>
          </div>
          {menuOpen && (
            <div
              ref={menuRef}
              onMouseLeave={() => {
                setMenuOpen(false);
                setMoreOpen(false);
              }}
              className="absolute top-12 left-2 w-56 rounded-lg shadow-lg z-20 text-sm"
              style={{
                backgroundColor: String(TOKENS.color['bg.header']),
                color: String(TOKENS.color['text.primary']),
                border: `1px solid ${TOKENS.color['border.muted']}`
              }}
            >
              {(layoutVersion === 'A'
                ? (() => {
                    const more = menuStore.items.find((i) => i.id === 'more');
                    const others = menuStore.items.filter((i) => i.id !== 'more');
                    return more ? [...others, ...(more.children || [])] : others;
                  })()
                : menuStore.items
              ).map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => layoutVersion !== 'A' && item.id === 'more' && setMoreOpen(true)}
                  onMouseLeave={() => layoutVersion !== 'A' && item.id === 'more' && setMoreOpen(false)}
                >
                  {(() => {
                    const isDarkToggle = item.id === 'dark';
                    const isVersionToggle = item.id === 'version';
                    const label = isVersionToggle
                      ? layoutVersion === 'A'
                        ? 'Переключить в К версию'
                        : 'Переключить в А версию'
                      : isDarkToggle
                      ? theme === 'dark'
                        ? 'Выключить темный режим'
                        : 'Включить темный режим'
                      : item.label;
                    const icon = isVersionToggle
                      ? '🔄'
                      : isDarkToggle
                      ? theme === 'dark' ? '☀️' : '🌙'
                      : item.icon;
                    return (
                      <div
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                        style={{ backgroundColor: 'transparent' }}
                        onClick={() => {
                          if (isDarkToggle) {
                            toggleTheme();
                            setMenuOpen(false);
                            setMoreOpen(false);
                          } else if (isVersionToggle) {
                            toggleLayoutVersion();
                            setMenuOpen(false);
                            setMoreOpen(false);
                          }
                        }}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })()}
                  {item.id === 'more' && layoutVersion !== 'A' && moreOpen && (
                    <div
                      className="absolute top-0 left-full -ml-2 w-full rounded-lg shadow-lg text-sm"
                      style={{
                        backgroundColor: tokens.surface,
                        color: tokens.primaryText,
                        border: `1px solid ${tokens.borderColor}`
                      }}
                    >
                      {item.children?.map((child) => {
                        const isDarkToggle = child.id === 'dark';
                        const isVersionToggle = child.id === 'version';
                        const label = isDarkToggle
                          ? theme === 'dark'
                            ? 'Выключить темный режим'
                            : 'Включить темный режим'
                          : isVersionToggle
                          ? layoutVersion === 'A'
                            ? 'Переключить в К версию'
                            : 'Переключить в А версию'
                          : child.label;
                        const icon = isDarkToggle
                          ? theme === 'dark' ? '☀️' : '🌙'
                          : isVersionToggle
                          ? '🔄'
                          : child.icon;
                        return (
                          <div
                            key={child.id}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                            style={{
                              backgroundColor: 'transparent'
                            }}
                            onClick={() => {
                              if (isDarkToggle) {
                                toggleTheme();
                                setMenuOpen(false);
                                setMoreOpen(false);
                              } else if (isVersionToggle) {
                                toggleLayoutVersion();
                                setMenuOpen(false);
                                setMoreOpen(false);
                              }
                            }}
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Stories */}
          <div
            ref={storyRef}
            className={`flex gap-4 overflow-x-auto hide-scrollbar transition-all duration-300 ${storiesCollapsed ? 'h-0 p-0 opacity-0 border-b-0' : 'h-[84px] px-3 py-2 opacity-100 border-b'}`}
            style={{ background: String(TOKENS.color['bg.story.strip']), borderColor: String(TOKENS.color['border.muted']) }}
          >
            {storyStore.stories.map((story) => {
              const ringGradient = `linear-gradient(135deg, ${TOKENS.color['bg.story.ring.start']}, ${TOKENS.color['bg.story.ring.end']})`;
              return (
                <div key={story.id} className="flex flex-col items-center w-[64px] shrink-0">
                  <div className="w-[64px] h-[64px] rounded-full p-[3px]" style={{ background: ringGradient }}>
                    <div className="w-full h-full rounded-full p-[2px]" style={{ background: '#fff' }}>
                      <img src={story.avatar} className="w-full h-full rounded-full object-cover" />
                    </div>
                  </div>
                  <span className="text-[12px] mt-1 truncate w-full text-center" style={{ color: String(TOKENS.color['text.secondary']) }}>{story.title}</span>
                </div>
              );
            })}
          </div>
          {/* Tabs removed by design */}
          {/* Chat list */}
          <div className="flex-1 overflow-hidden">
            <div
              className={`flex h-full ${
                isAnimating ? 'transition-transform duration-300' : ''
              }`}
              style={{ transform: `translateX(${translate}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {chatSlides.map((list, idx) => (
                <div
                  key={idx}
                  className="w-full flex-none overflow-y-auto scrollbar-custom pt-2"
                  style={{ background: String(TOKENS.color['bg.sidebar']) }}
                  onScroll={handleChatScroll}
                >
                  {list.map((chat) => (
                    <div key={chat.id} onClick={() => chatStore.selectChat(chat.id)} className="px-3">
                      <div
                        className="flex items-center gap-3 px-3"
                        style={{
                          height: 72,
                          borderBottom: `1px solid ${TOKENS.color['border.muted']}`,
                          background:
                            chatStore.selectedChatId === chat.id
                              ? String(TOKENS.color['bg.sidebar.active'])
                              : 'transparent',
                          borderRadius: chatStore.selectedChatId === chat.id ? 12 : 0
                        }}
                      >
                        <img src={chat.avatar} className="w-11 h-11 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="truncate" style={{ fontWeight: 600, color: String(TOKENS.color['text.primary']) }}>{chat.name}</span>
                            <span className="text-[12px]" style={{ color: String(TOKENS.color['text.muted']) }}>{chat.lastMessageDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[14px] truncate" style={{ color: String(TOKENS.color['text.secondary']) }}>{chat.lastMessage}</span>
                            {chat.unread > 0 ? (
                              <span className="ml-2 text-[12px] rounded-full px-2 py-[2px]" style={{ background: String(TOKENS.color['bg.unread.badge']), color: String(TOKENS.color['text.inverse']) }}>
                                {chat.unread}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setFabOpen((v) => !v)}
            className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl cursor-pointer"
          >
            ✏️
          </button>
          {fabOpen && (
            <div className="absolute bottom-16 right-4 w-48 bg-white text-black border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col gap-2">
              {[
                { id: 'newChannel', icon: '📢', label: 'Новый канал' },
                { id: 'newGroup', icon: '👥', label: 'Новая группа' },
                { id: 'newPrivate', icon: '🔒', label: 'Новый частный канал' }
              ].map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-[720px]">
          {selected ? (
            <>
              <div className="px-6 h-16 border-b flex items-center gap-3" style={{ background: String(TOKENS.color['bg.header']), borderColor: String(TOKENS.color['border.muted']), boxShadow: String(TOKENS.elevation.card) }}>
                <img src={selected.avatar} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span style={{ fontWeight: 600, color: String(TOKENS.color['text.primary']) }}>{selected.name}</span>
                  <span className="text-[12px]" style={{ color: String(TOKENS.color['text.secondary']) }}>
                    {selected.type === 'private' ? selected.lastSeen : `${selected.participants} участников`}
                  </span>
                </div>
                <div className="ml-auto flex gap-2">
                  {selected.actions.map((act, idx) => (
                    <button key={idx} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: String(TOKENS.color['icon.normal']) }}>
                      {act}
                    </button>
                  ))}
                </div>
              </div>
              {selected.pinnedMessages && selected.pinnedMessages.length > 0 && (
                <div className="px-6 py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px]" style={{ background: '#E8F5FF', color: '#2B6EA6', boxShadow: String(TOKENS.elevation.card) }}>
                    📌
                    <span className="text-[12px] truncate max-w-[60ch]">
                      {selected.pinnedMessages[selected.pinnedMessages.length - 1].text}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto" style={{ background: String(TOKENS.color['bg.chat']) }}>
                <div className="px-6 py-4 space-y-2 max-w-2xl mx-auto">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === 'me' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`px-4 py-3 max-w-xs rounded-[16px]`}
                        style={{
                          background:
                            m.sender === 'me'
                              ? String(TOKENS.color['bg.message.out'])
                              : String(TOKENS.color['bg.message.in']),
                          color: String(TOKENS.color['text.primary']),
                          border:
                            m.sender === 'me'
                              ? 'none'
                              : `1px solid ${TOKENS.color['border.message']}`,
                          boxShadow: `0 1px 1px ${TOKENS.color['shadow']}`
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-5 pt-3 flex justify-center border-t" style={{ background: String(TOKENS.color['bg.header']), borderColor: String(TOKENS.color['border.muted']), boxShadow: String(TOKENS.elevation.card) }}>
                <div className="flex items-end w-full max-w-2xl gap-2 relative">
                  <div className="flex items-end flex-1 rounded-[20px] px-4 py-2 relative" style={{ background: String(TOKENS.color['bg.input']) }}>
                    <div className="relative">
                      <button
                        ref={emojiBtnRef}
                        type="button"
                        onClick={() => setShowEmoji((v) => !v)}
                        className="text-2xl mr-2 cursor-pointer"
                        style={{ color: String(TOKENS.color['icon.normal']) }}
                      >
                        😊
                      </button>
                      {showEmoji && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute bottom-full left-0 mb-2 z-10"
                        >
                          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                        </div>
                      )}
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={handleChange}
                      placeholder="Message"
                      rows={1}
                      className="flex-1 bg-transparent focus:outline-none resize-none overflow-hidden"
                      style={{ color: String(TOKENS.color['text.primary']) }}
                    />
                    <button className="text-xl ml-2 cursor-pointer" style={{ color: String(TOKENS.color['icon.normal']) }}>📎</button>
                  </div>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ background: String(TOKENS.color['bg.unread.badge']), color: String(TOKENS.color['text.inverse']) }}>✈️</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: String(TOKENS.color['text.secondary']) }}>
              Выберите чат
            </div>
          )}
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
});

export default ChatPage;
