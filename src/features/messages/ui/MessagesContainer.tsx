import { useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useMessages } from '../../messages/hooks';
import MessageDateGroup from '../../../entities/message-date-group/ui/MessageDateGroup';

const MessagesContainer = observer(({ conversationId, textSizePx }: { conversationId: number | null | undefined; textSizePx?: number }) => {
  const store = useMessages(conversationId);
  if (!conversationId) return null;
  const groups = store.getGroups(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Жёстко прижимаем к низу при смене чата и изменении количества видимых сообщений
  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [conversationId, totalItems]);

  return (
    <div className="min-h-full flex flex-col justify-end">
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full" style={textSizePx ? { fontSize: `${textSizePx}px` } : undefined}>
        {groups.map((g) => (
          <MessageDateGroup key={g.key} label={g.label} messages={g.items} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
});

export default MessagesContainer;
