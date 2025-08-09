import { observer } from 'mobx-react-lite';
import { chatStore } from '../../../features/chats/model';

export const ChatsPanel = observer(() => {
  return (
    <div className="space-y-2">
      {chatStore.chats.map((chat) => (
        <div
          key={chat.id}
          className="cursor-pointer rounded p-2 hover:bg-neutral-100"
        >
          {chat.name}
        </div>
      ))}
    </div>
  );
});
