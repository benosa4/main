import { observer } from 'mobx-react-lite';
import { LayoutWithFloatingBg } from '../../../shared/ui/LayoutWithFloatingBg';
import { useChats } from '../../../features/chats/hooks';
import { useMenu } from '../../../features/menu/hooks';
import { useStories } from '../../../features/stories/hooks';
import { useChatTabs } from '../../../features/chat-tabs/hooks';
import { Sidebar } from '../../../widgets/sidebar';
import { ChatHeader } from '../../../widgets/header';
import { MessageList } from '../../../widgets/message-list';
import { MessageInput } from '../../../widgets/message-input';

export default observer(function ChatPage() {
  useChats();
  useMenu();
  useStories();
  useChatTabs();

  return (
    <LayoutWithFloatingBg noFrame>
      <div className="grid grid-cols-[340px_1fr] h-dvh">
        <Sidebar />
        <div className="flex flex-col">
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
});
