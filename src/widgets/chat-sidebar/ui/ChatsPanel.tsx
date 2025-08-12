import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { chatStore } from '../../../features/chats/model';
import { chatTabsStore } from '../../../features/chat-tabs/model';
import type { Chat } from '../../../features/chats/api';
import Avatar from '../../../shared/ui/Avatar';
import TwemojiText from '../../../shared/emoji/TwemojiText';
import appSettingsStore from '../../../shared/config/appSettings';

interface Props {
  search: string;
  onStoriesCollapseChange: (collapsed: boolean) => void;
}

const ChatsPanel = observer(({ search, onStoriesCollapseChange }: Props) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const [chatSlides, setChatSlides] = useState<Chat[][]>([]);
  const [translate, setTranslate] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTabId = useRef<number | null>(null);

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

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onStoriesCollapseChange(e.currentTarget.scrollTop > 0);
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

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        ref={tabRef}
        className={`px-2 pt-2 flex gap-2 overflow-x-auto hide-scrollbar ${appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.menuTransitions ? 'transition-all duration-300' : ''}`}
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
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className={`flex h-full ${
            isAnimating && appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.menuTransitions ? 'transition-transform duration-300' : ''
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
    </div>
  );
});

export default ChatsPanel;
