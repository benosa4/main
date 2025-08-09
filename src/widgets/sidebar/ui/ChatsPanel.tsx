import { observer } from 'mobx-react-lite';
import { useChats } from '../../../features/chats/hooks';
import { lightTokens } from '../../../shared/config/tokens';

export const ChatsPanel = observer(() => {
  const chatStore = useChats();
  const TOKENS = lightTokens;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom pt-2">
      {chatStore.chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => chatStore.selectChat(chat.id)}
          className="px-3"
        >
          <div
            className="flex items-center gap-3 px-3 cursor-pointer"
            style={{
              height: 72,
              borderBottom: `1px solid ${TOKENS.color['border.muted']}`,
              background:
                chatStore.selectedChatId === chat.id
                  ? (TOKENS.color['bg.sidebar.active'] as string)
                  : 'transparent',
              borderRadius: chatStore.selectedChatId === chat.id ? 12 : 0,
            }}
          >
            <img
              src={chat.avatar}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span
                  className="truncate"
                  style={{
                    fontWeight: 600,
                    color: TOKENS.color['text.primary'] as string,
                  }}
                >
                  {chat.name}
                </span>
                <span
                  className="text-[12px]"
                  style={{ color: TOKENS.color['text.muted'] as string }}
                >
                  {chat.lastMessageDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-[14px] truncate"
                  style={{ color: TOKENS.color['text.secondary'] as string }}
                >
                  {chat.lastMessage}
                </span>
                {chat.unread > 0 && (
                  <span
                    className="ml-2 text-[12px] rounded-full px-2 py-[2px]"
                    style={{
                      background: TOKENS.color['bg.unread.badge'] as string,
                      color: TOKENS.color['text.inverse'] as string,
                    }}
                  >
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

