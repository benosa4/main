import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';
import type { Emoji } from '@emoji-mart/data';
import TwemojiText from '../../shared/emoji/TwemojiText';
import EmojiPanel from '../../widgets/emoji-panel/ui/EmojiPanel';
import { useChats } from '../../features/chats/hooks';
import { chatStore } from '../../features/chats/model';
import type { Chat } from '../../features/chats/api';
import { useChatTabs } from '../../features/chat-tabs/hooks';
import { chatTabsStore } from '../../features/chat-tabs/model';
import { useMenu } from '../../features/menu/hooks';
import { menuStore } from '../../features/menu/model';
import { useStories } from '../../features/stories/hooks';
import { storyStore } from '../../features/stories/model';
import { natsStore } from '../../shared/nats/model';
import { StatusText } from '../../shared/ui/StatusText';
import Avatar from '../../shared/ui/Avatar';
import PaperclipIcon from '../../shared/ui/icons/Paperclip';
import TwemojiInput, { TwemojiInputHandle } from '../../shared/emoji/TwemojiInput';

const ChatPage = observer(() => {
  useChats();
  useMenu();
  useStories();
  useChatTabs();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [storiesCollapsed, setStoriesCollapsed] = useState(false);
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

  // 👉 ВАЖНО: реф для TwemojiInput внутри компонента
  const inputRef = useRef<TwemojiInputHandle>(null);

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

  // 👉 новый handleChange для TwemojiInput (строка)
  const handleChange = (v: string) => {
    setMessage(v);
  };

  // 👉 новый handleEmojiSelect: вставка в TwemojiInput, плюс обновление стейта
  const handleEmojiSelect = (emoji: Emoji & { native?: string }) => {
    const native = emoji.native || '';
    if (!native) return;
    inputRef.current?.insert(native);
    inputRef.current?.focus();
    setMessage((prev) => prev + native);
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
  /* eslint-enable react-hooks-exhaustive-deps */

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
        <Avatar name={chat.name} size={56} />
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
              <TwemojiText text={chat.lastMessage} />
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
        className={`flex h-screen text-white relative ${
          menuStore.version === 'A' ? 'mx-0 w-full' : 'mx-[2cm] w-[calc(100%-4cm)]'
        }`}
        data-testid="chat-page-container"
      >
        {/* Sidebar */}
        <aside className="w-1/4 bg-white/20 backdrop-blur-md border-r border-white/20 flex flex-col relative">
          {/* Search and menu */}
          <div className="p-2 flex items-center gap-2 border-b border-white/20">
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
                onChange={(e) => setSearch(e.target.value)}
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
              {menuStore.version === 'A'
                ? menuStore.flattenedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (item.id === 'version') {
                          menuStore.toggleVersion();
                        }
                        setMenuOpen(false);
                        setMoreOpen(false);
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))
                : menuStore.renderedItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group"
                      onMouseEnter={() => item.id === 'more' && setMoreOpen(true)}
                      onMouseLeave={() => item.id === 'more' && setMoreOpen(false)}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (item.id === 'more') return;
                          if (item.id === 'version') {
                            menuStore.toggleVersion();
                          }
                          setMenuOpen(false);
                          setMoreOpen(false);
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'more' && moreOpen && (
                        <div className="absolute top-0 left-full -ml-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-black">
                          {item.children?.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                if (child.id === 'version') {
                                  menuStore.toggleVersion();
                                }
                                setMenuOpen(false);
                                setMoreOpen(false);
                              }}
                            >
                              <span>{child.icon}</span>
                              <span>{child.label}</span>
                            </div>
                          ))}
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
                    className="w-14 h-14 rounded-full p-[4px]"
                    style={{ background: `conic-gradient(${gradient})` }}
                  >
                    <div className="w-full h-full rounded-full p-[2px] bg-white/20">
                      <img
                        src={story.avatar}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
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
                  className="w-full flex-none overflow-y-auto scrollbar-custom bg-white/20 pt-2"
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
              <div className="p-4 bg-white/10 backdrop-blur-md border-b border-white/10 flex items-center gap-3">
                <img src={selected.avatar} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-semibold">{selected.name}</span>
                  <span className="text-sm text-white/70">
                    {natsStore.status !== 'connected' ? (
                      <StatusText label="connecting" />
                    ) : chatStore.updating ? (
                      <StatusText label="updating" />
                    ) : selected.type === 'private' ? (
                      selected.lastSeen
                    ) : (
                      `${selected.participants} участников`
                    )}
                  </span>
                </div>
                {selected.pinnedMessages && selected.pinnedMessages.length > 0 && (
                  <div className="ml-4 max-w-xs text-sm text-white/70 truncate">
                    <TwemojiText
                      text={
                        selected.pinnedMessages[
                          selected.pinnedMessages.length - 1
                        ].text
                      }
                    />
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  {selected.actions.map((act, idx) => (
                    <button
                      key={idx}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
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
                        className={`${
                          m.sender === 'me' ? 'bg-blue-600' : 'bg-white/10'
                        } rounded-lg px-4 py-2 max-w-xs`}
                      >
                        <TwemojiText text={m.text} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 pb-5 flex justify-center">
                <div className="flex items-end w-full max-w-2xl gap-2 relative">
                  <div className="flex items-end flex-1 bg-white/5 rounded-lg px-4 py-2 relative">
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
                          <EmojiPanel
                            onEmojiSelect={(native) =>
                              handleEmojiSelect({ native } as any)
                            }
                          />
                        </div>
                      )}
                    </div>
                    <TwemojiInput
                      ref={inputRef}
                      value={message}
                      onChange={handleChange}
                      placeholder="Message"
                      className="bg-transparent max-h-40 overflow-auto"
                    />
                    <button className="text-xl ml-2 cursor-pointer" aria-label="Attachment">
                      <PaperclipIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer">✈️</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/70">
              Выберите чат
            </div>
          )}
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
});

export default ChatPage;
