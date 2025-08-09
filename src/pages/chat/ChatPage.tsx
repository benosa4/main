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

  const ChatPage = observer(() => {
    useChats();
    useMenu();
    useStories();
    useChatTabs();

  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('chatTheme') as 'light' | 'dark') || 'light'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    localStorage.setItem('chatTheme', theme);
  }, [theme]);

  // Theme tokens derived from provided light.html and dark.mhtml
  const tokens = theme === 'dark'
    ? {
        primaryColor: '#8774e1',
        lightPrimaryColor: 'rgba(135,116,225,0.08)',
        lightFilledPrimaryColor: '#292730',
        msgOutBg: '#8774e1',
        msgOutText: '#ffffff',
        surface: '#212121',
        primaryText: '#ffffff',
        secondaryText: '#aaaaaa',
        messageBg: '#212121',
        lightFilledMessageBg: '#212121',
        lightFilledSecondary: '#2b2b2b',
        borderColor: 'rgba(255,255,255,0.12)'
      }
    : {
        primaryColor: '#3390ec',
        lightPrimaryColor: 'rgba(51,144,236,0.08)',
        lightFilledPrimaryColor: '#eef6fd',
        msgOutBg: '#e3fee0',
        msgOutText: '#5ca853',
        surface: '#ffffff',
        primaryText: '#000000',
        secondaryText: '#707579',
        messageBg: '#ffffff',
        lightFilledMessageBg: '#ffffff',
        lightFilledSecondary: '#f3f3f4',
        borderColor: 'rgba(0,0,0,0.06)'
      };

  const themeVars: React.CSSProperties = {
    // expose variables for inline usage
    ['--primary-color' as any]: tokens.primaryColor,
    ['--light-primary-color' as any]: tokens.lightPrimaryColor,
    ['--light-filled-primary-color' as any]: tokens.lightFilledPrimaryColor,
    ['--message-out-background-color' as any]: tokens.msgOutBg,
    ['--message-out-primary-color' as any]: tokens.msgOutText,
    ['--surface-color' as any]: tokens.surface,
    ['--primary-text-color' as any]: tokens.primaryText,
    ['--secondary-text-color' as any]: tokens.secondaryText,
    ['--message-background-color' as any]: tokens.messageBg,
    ['--light-filled-message-background-color' as any]: tokens.lightFilledMessageBg,
    ['--light-filled-secondary-text-color' as any]: tokens.lightFilledSecondary,
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
        className={`flex h-screen relative mx-[2cm] w-[calc(100%-4cm)]`}
        style={{
          ...themeVars,
          backgroundColor: 'var(--surface-color)',
          color: 'var(--primary-text-color)'
        }}
      >
        {/* Sidebar */}
        <aside
          className="w-1/4 flex flex-col relative border-r"
          style={{
            backgroundColor: tokens.lightFilledPrimaryColor,
            borderColor: tokens.borderColor
          }}
        >
          {/* Search and menu */}
          <div
            className="p-2 flex items-center gap-2 border-b"
            style={{ borderColor: tokens.borderColor }}
          >
            <button
              ref={burgerRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: 'var(--light-filled-secondary-text-color)' }}
            >
              ☰
            </button>
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full px-4 py-2 pr-20 focus:outline-none"
                style={{
                  backgroundColor: 'var(--light-filled-secondary-text-color)',
                  color: 'var(--primary-text-color)'
                }}
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
                backgroundColor: tokens.surface,
                color: tokens.primaryText,
                border: `1px solid ${tokens.borderColor}`
              }}
            >
              {menuStore.items.map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => item.id === 'more' && setMoreOpen(true)}
                  onMouseLeave={() => item.id === 'more' && setMoreOpen(false)}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'more' && moreOpen && (
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
                        const label = isDarkToggle
                          ? theme === 'dark'
                            ? 'Выключить темный режим'
                            : 'Включить темный режим'
                          : child.label;
                        const icon = isDarkToggle
                          ? theme === 'dark' ? '☀️' : '🌙'
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
            className={`flex gap-4 overflow-x-auto hide-scrollbar transition-all duration-300 ${storiesCollapsed ? 'h-0 p-0 opacity-0 border-b-0' : 'h-24 p-2 opacity-100 border-b border-white/20'}`}
          >
            {storyStore.stories.map((story) => {
              const total = story.segments.length;
              const step = 100 / total;
              const gradient = story.segments
                .map((seg, idx) => {
                  const start = idx * step;
                  const end = start + step;
                  const color = seg.viewed ? '#9ca3af' : '#3b82f6';
                  return `${color} ${start}% ${end}%`;
                })
                .join(', ');

              return (
                <div key={story.id} className="flex flex-col items-center w-14 shrink-0">
                  <div
                    className="w-14 h-14 rounded-full p-[2px]"
                    style={{ background: `conic-gradient(${gradient})` }}
                  >
                    <img
                      src={story.avatar}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="text-xs mt-1">{story.title}</span>
                </div>
              );
            })}
          </div>
          {/* Tabs */}
          <div
            ref={tabRef}
            className="px-2 pt-2 flex gap-2 overflow-x-auto hide-scrollbar transition-all duration-300"
          >
            {chatTabsStore.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => chatTabsStore.selectTab(tab.id)}
                className={`px-3 py-1 rounded-t border whitespace-nowrap cursor-pointer ${
                  chatTabsStore.selectedTabId === tab.id
                    ? 'bg-white/20 border-white/20 border-b-0'
                    : 'bg-white/5 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
                  style={{ backgroundColor: tokens.lightFilledPrimaryColor }}
                  onScroll={handleChatScroll}
                >
                  {renderChatList(list)}
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
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div
                className="p-4 border-b flex items-center gap-3"
                style={{ backgroundColor: 'var(--light-primary-color)', borderColor: tokens.borderColor }}
              >
                <img src={selected.avatar} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-semibold" style={{ color: 'var(--primary-text-color)' }}>{selected.name}</span>
                  <span className="text-sm" style={{ color: 'var(--secondary-text-color)' }}>
                    {selected.type === 'private'
                      ? selected.lastSeen
                      : `${selected.participants} участников`}
                  </span>
                </div>
                {selected.pinnedMessages && selected.pinnedMessages.length > 0 && (
                  <div className="ml-4 max-w-xs text-sm truncate" style={{ color: 'var(--secondary-text-color)' }}>
                    {
                      selected.pinnedMessages[
                        selected.pinnedMessages.length - 1
                      ].text
                    }
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  {selected.actions.map((act, idx) => (
                    <button
                      key={idx}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--light-filled-secondary-text-color)' }}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 max-w-2xl mx-auto">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === 'me' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-xs`}
                        style={{
                          backgroundColor:
                            m.sender === 'me'
                              ? 'var(--message-out-background-color)'
                              : 'var(--light-filled-message-background-color)',
                          color:
                            m.sender === 'me'
                              ? 'var(--message-out-primary-color)'
                              : 'var(--primary-text-color)',
                          border:
                            m.sender === 'me'
                              ? 'none'
                              : `1px solid ${tokens.borderColor}`
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 pb-5 flex justify-center">
                <div className="flex items-end w-full max-w-2xl gap-2 relative">
                  <div
                    className="flex items-end flex-1 rounded-lg px-4 py-2 relative"
                    style={{ backgroundColor: 'var(--light-filled-secondary-text-color)' }}
                  >
                    <div className="relative">
                      <button
                        ref={emojiBtnRef}
                        type="button"
                        onClick={() => setShowEmoji((v) => !v)}
                        className="text-2xl mr-2 cursor-pointer"
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
                      style={{ color: 'var(--primary-text-color)' }}
                    />
                    <button className="text-xl ml-2 cursor-pointer">📎</button>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}
                  >
                    ✈️
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--secondary-text-color)' }}>
              Выберите чат
            </div>
          )}
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
});

export default ChatPage;
