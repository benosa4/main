import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';
import TwemojiText from '../../shared/emoji/TwemojiText';
import { EmojiPicker, Tone } from '../../emoji';
import { nameToNative } from '../../emoji/nameToNative';
import { chatStore } from '../../features/chats/model';
import appSettingsStore from '../../shared/config/appSettings';
import { natsStore } from '../../shared/nats/model';
import { StatusText } from '../../shared/ui/StatusText';
import PaperclipIcon from '../../shared/ui/icons/Paperclip';
import TwemojiInput, { TwemojiInputHandle } from '../../shared/emoji/TwemojiInput';
import MessagesContainer from '../../features/messages/ui/MessagesContainer';
import { messageStore } from '../../features/messages/model';
import ChatSidebar from '../../widgets/chat-sidebar/ui/ChatSidebar';
import { KebabMenu } from '../../shared/ui/kebab/KebabMenu';

const ChatPage = observer(() => {
  // Sidebar moved to ChatSidebar widget
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // 👉 ВАЖНО: реф для TwemojiInput внутри компонента
  const inputRef = useRef<TwemojiInputHandle>(null);
  // Для расчёта порога и управления скроллбаром ввода
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const pendingPrependAdjust = useRef<{ prevHeight: number; prevTop: number } | null>(null);
  const [inputMaxPx, setInputMaxPx] = useState<number | null>(null);
  const [inputScrollable, setInputScrollable] = useState(false);
  const [attachments, setAttachments] = useState<{ id: string; url: string; type: 'image'|'file'; name?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sidebar scrollers handled inside ChatSidebar

  // Порог высоты ввода = половина высоты окна чата (списка сообщений)
  useEffect(() => {
    function recomputeThreshold() {
      const cont = messagesRef.current;
      if (!cont) return;
      const half = Math.floor(cont.clientHeight / 2);
      setInputMaxPx(half > 0 ? half : null);
    }
    recomputeThreshold();
    const ro = new ResizeObserver(recomputeThreshold);
    if (messagesRef.current) ro.observe(messagesRef.current);
    window.addEventListener('resize', recomputeThreshold);
    return () => {
      window.removeEventListener('resize', recomputeThreshold);
      ro.disconnect();
    };
  }, []);

  // Контроль появления полосы прокрутки в поле ввода
  useEffect(() => {
    const el = inputRef.current?.getElement();
    if (!el || !inputMaxPx) {
      setInputScrollable(false);
      return;
    }
    // Если содержимое превышает порог, включаем скроллбар
    setInputScrollable(el.scrollHeight > inputMaxPx + 1);
  }, [message, inputMaxPx]);

  // 👉 новый handleChange для TwemojiInput (строка)
  const handleChange = (v: string) => {
    setMessage(v);
    const convId = chatStore.selectedChatId;
    if (convId) {
      // persist draft locally and to mock remote (debounced by browser event queue)
      import('../../shared/db').then(({ saveDraftToDB }) => saveDraftToDB({ conversationId: convId, text: v })).catch(() => {});
      import('../../shared/db').then(({ saveDraftToRemote }) => saveDraftToRemote({ conversationId: convId, text: v })).catch(() => {});
    }
  };

  // typing indicator mock (local)
  useEffect(() => {
    const convId = chatStore.selectedChatId;
    if (!convId) return;
    if (message) messageStore.setTyping(convId, true);
    const t = setTimeout(() => messageStore.setTyping(convId, false), 1200);
    return () => clearTimeout(t);
  }, [message, chatStore.selectedChatId]);

  // 👉 новый handleEmojiPick: вставка в TwemojiInput, плюс обновление стейта
  const ZWSP = '\u200B';

  const handleEmojiPick = ({ name, tone }: { name: string; tone: Tone }) => {
    const native = nameToNative(name, tone);
    if (!native) return;
    inputRef.current?.insert(`${ZWSP}${native}${ZWSP}`);
    inputRef.current?.focus();
    setShowEmoji(false);
  };

  // Sidebar scroll state handled inside ChatSidebar

  // Инициализация скролла списка сообщений в самый низ при выборе чата
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // при смене чата — прижимаемся к низу
    stickToBottomRef.current = true;
    // сброс поля ввода и панели эмодзи
    setMessage('');
    setShowEmoji(false);
    // загрузить драфт для текущей переписки
    if (chatStore.selectedChatId) {
      const id = chatStore.selectedChatId;
      import('../../shared/db')
        .then(({ loadDraftFromDB }) => loadDraftFromDB(id))
        .then((d) => {
          if (d && typeof d.text === 'string') setMessage(d.text);
        })
        .catch(() => {});
    }
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chatStore.selectedChatId]);

  // Отслеживаем изменение размеров списка/контейнера, чтобы держаться низа
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (pendingPrependAdjust.current) {
        const { prevHeight, prevTop } = pendingPrependAdjust.current;
        // корректируем позицию, чтобы текущая видимая часть не "скакала"
        const afterHeight = el.scrollHeight;
        const delta = afterHeight - prevHeight;
        el.scrollTop = prevTop + delta;
        pendingPrependAdjust.current = null;
        return;
      }
      if (stickToBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Наблюдаем изменения контента, чтобы при первой загрузке/догрузке прилипать к низу
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const mo = new MutationObserver(() => {
      if (stickToBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    mo.observe(el, { childList: true, subtree: true });
    // попытка прижаться сразу после монтирования контента
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
      });
    });
    return () => mo.disconnect();
  }, []);

  // Обработчик прокрутки в области сообщений: удержание низа и догрузка истории
  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 32;
    stickToBottomRef.current = nearBottom;
    // Догрузка более старых сообщений при достижении верха
    if (el.scrollTop <= 60 && chatStore.selectedChatId) {
      const convId = chatStore.selectedChatId;
      const prevHeight = el.scrollHeight;
      const prevTop = el.scrollTop;
      pendingPrependAdjust.current = { prevHeight, prevTop };
      const hidden =
        messageStore.getTotalCount(convId) - messageStore.getVisibleCount(convId);
      if (hidden > 0) {
        messageStore.increaseVisible(convId, Math.min(20, hidden));
      } else {
        void messageStore.loadOlder(convId, 30).then((fetched) => {
          if (!fetched) {
            // нечего догружать — ничего не делаем
            pendingPrependAdjust.current = null;
          }
        });
      }
    }
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

  // Sidebar menu click-outside handled inside ChatSidebar

  // Sidebar chat list animation handled inside ChatSidebar

  // Sidebar transition handled inside ChatSidebar

  // Chat list renderer moved inside ChatSidebar

  const selected = chatStore.selectedChat;

  return (
    <LayoutWithFloatingBg noFrame>
      <div
        className={`flex h-screen text-white relative ${
          appSettingsStore.state.version === 'A' ? 'mx-0 w-full' : 'mx-[2cm] w-[calc(100%-4cm)]'
        }`}
        data-testid="chat-page-container"
      >
        {/* Sidebar */}
        <ChatSidebar />

        {/* Chat window */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {(() => {
            const url = appSettingsStore.state.chatWallpaperUrl;
            const gallery = appSettingsStore.state.chatWallpaperGallery || [];
            if (url) {
              const cache = gallery.find((g) => g.url === url)?.cacheDataUrl || url;
              return (
                <div
                  className="absolute inset-0 -z-10"
                  style={{
                    backgroundImage: `url(${cache})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: appSettingsStore.state.chatWallpaperBlur ? 'blur(8px)' : 'none',
                    transform: 'translateZ(0)',
                  }}
                />
              );
            }
            // No wallpaper — fill chat window with selected solid color
            return (
              <div
                className="absolute inset-0 -z-10"
                style={{ backgroundColor: appSettingsStore.state.chatColor }}
              />
            );
          })()}
          {/* content overlay */}
          {selected ? (
            <>
              <div className="p-4 app-header border-b border-white/10 flex items-center gap-3">
                <img src={selected.avatar} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-semibold">{selected.name}</span>
                  <span className="text-sm text-white/70">
                    {messageStore.isTyping(selected.id) ? (
                      'печатает…'
                    ) : natsStore.status !== 'connected' ? (
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
                <div className="ml-auto flex gap-2 items-center header-right">
                  {selected.actions.map((act, idx) => (
                    <button
                      key={idx}
                      className="icon-btn"
                      aria-label={`action-${idx}`}
                    >
                      {act}
                    </button>
                  ))}
                  <KebabMenu onAction={(a)=>{
                    // Hook actions as needed; for now, log
                    console.log('kebab action', a)
                  }} />
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto hide-scrollbar"
                ref={messagesRef}
                onScroll={handleMessagesScroll}
              >
                <MessagesContainer conversationId={selected?.id ?? null} textSizePx={appSettingsStore.state.textSize} />
              </div>
              {selected && messageStore.isRemoteTyping(selected.id) && (
                <div className="px-6 -mt-2 mb-1 flex justify-center">
                  <div className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{selected.type === 'private' ? `${selected.name}` : 'Кто-то'}</span>
                    <span>печатает</span>
                    {appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.typing ? (
                      <span className="typing-dots animated" aria-hidden>
                        <span></span><span></span><span></span>
                      </span>
                    ) : (
                      <span>…</span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-4 pb-5 flex justify-center">
                <div className="flex items-end w-full max-w-2xl gap-2 relative">
                  <div className="flex items-end flex-1 bg-white/5 rounded-lg px-4 py-2 relative">
                    {attachments.length > 0 && (
                      <div className="absolute -top-20 left-0 right-0 px-2 py-1 flex gap-2 overflow-x-auto hide-scrollbar">
                        {attachments.map((a) => (
                          <div key={a.id} className="relative">
                            {a.type === 'image' ? (
                              <img src={a.url} className="h-16 w-auto rounded-md border border-white/10" />
                            ) : (
                              <a href={a.url} target="_blank" className="underline text-xs" rel="noreferrer">{a.name || 'file'}</a>
                            )}
                            <button
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-xs"
                              onClick={() => setAttachments((arr) => arr.filter((x) => x.id !== a.id))}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <EmojiPicker
                            open={showEmoji}
                            anchorEl={emojiBtnRef.current || undefined}
                            onClose={() => setShowEmoji(false)}
                            onPick={handleEmojiPick}
                            defaultTone="default"
                            persistToneKey="emoji_last_tone"
                          />
                        </div>
                      )}
                    </div>
                    <TwemojiInput
                      ref={inputRef}
                      value={message}
                      onChange={handleChange}
                      placeholder="Message"
                      className={`bg-transparent ${inputScrollable ? 'overflow-y-auto scrollbar-custom' : 'overflow-hidden'}`}
                      style={inputMaxPx ? { maxHeight: `${inputMaxPx}px` } : undefined}
                      onKeyDown={(e) => {
                        const mode = appSettingsStore.state.keyboardMode;
                        if (mode === 'enter') {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            // click send
                            (async () => {
                              const convId = chatStore.selectedChatId;
                              const text = message.trim();
                              if (!convId || (!text && attachments.length === 0)) return;
                              await messageStore.sendMessage(convId, text, attachments.map((a, idx) => ({ id: `${Date.now()}-${idx}`, type: a.type, url: a.url, name: a.name })) as any);
                              setMessage('');
                              setAttachments([]);
                              if (convId) {
                                import('../../shared/db').then(({ deleteDraftFromDB }) => deleteDraftFromDB(convId)).catch(() => {});
                                import('../../shared/db').then(({ deleteDraftFromRemote }) => deleteDraftFromRemote(convId)).catch(() => {});
                              }
                            })();
                          }
                        } else {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            (async () => {
                              const convId = chatStore.selectedChatId;
                              const text = message.trim();
                              if (!convId || (!text && attachments.length === 0)) return;
                              await messageStore.sendMessage(convId, text, attachments.map((a, idx) => ({ id: `${Date.now()}-${idx}`, type: a.type, url: a.url, name: a.name })) as any);
                              setMessage('');
                              setAttachments([]);
                              if (convId) {
                                import('../../shared/db').then(({ deleteDraftFromDB }) => deleteDraftFromDB(convId)).catch(() => {});
                                import('../../shared/db').then(({ deleteDraftFromRemote }) => deleteDraftFromRemote(convId)).catch(() => {});
                              }
                            })();
                          }
                        }
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const { presignForUpload } = await import('../../shared/media/api');
                        const { fileUrl } = await presignForUpload({ filename: f.name, mime: f.type });
                        // For mock, use local data URL as preview
                        const reader = new FileReader();
                        reader.onload = () => {
                          setAttachments((arr) => [
                            ...arr,
                            {
                              id: `${Date.now()}`,
                              url: (reader.result as string) || fileUrl,
                              type: f.type.startsWith('image/') ? 'image' : (f.type.startsWith('video/') ? 'video' : 'file'),
                              mime: f.type,
                              size: f.size,
                              name: f.name,
                            },
                          ]);
                        };
                        reader.readAsDataURL(f);
                        // In real case, PUT to presigned URL here.
                        e.currentTarget.value = '';
                      }}
                    />
                    <button
                      className="text-xl ml-2 cursor-pointer"
                      aria-label="Attachment"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PaperclipIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer"
                    onClick={async () => {
                      const convId = chatStore.selectedChatId;
                      const text = message.trim();
                      if (!convId || (!text && attachments.length === 0)) return;
                      await messageStore.sendMessage(convId, text, attachments.map((a, idx) => ({
                        id: `${Date.now()}-${idx}`,
                        type: a.type,
                        url: a.url,
                        name: a.name,
                      })) as any);
                      setMessage('');
                      setAttachments([]);
                      // remove draft locally and remotely
                      import('../../shared/db').then(({ deleteDraftFromDB }) => deleteDraftFromDB(convId)).catch(() => {});
                      import('../../shared/db').then(({ deleteDraftFromRemote }) => deleteDraftFromRemote(convId)).catch(() => {});
                    }}
                  >
                    ✈️
                  </button>
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
