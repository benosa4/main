import { useEffect, useState } from 'react';
import twemoji from 'twemoji';

export function MessageList() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setMessages((m) => [...m, custom.detail]);
    };
    window.addEventListener('new-message', handler);
    return () => window.removeEventListener('new-message', handler);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && (
        <div className="text-neutral-500">No messages</div>
      )}
      {messages.map((m, i) => (
        <div
          key={i}
          className="emoji-text"
          dangerouslySetInnerHTML={{ __html: twemoji.parse(m) }}
        />
      ))}
    </div>
  );
}
