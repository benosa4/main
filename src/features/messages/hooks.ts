import { useEffect } from 'react';
import { messageStore } from './model';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const useMessages = (conversationId: number | null | undefined) => {
  useEffect(() => {
    messageStore.init().catch(() => {});
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    messageStore.load(conversationId).catch(() => {});
    messageStore.startPolling(conversationId);
    // mock incoming typing + messages via timers
    let typingTimer: ReturnType<typeof setTimeout> | null = null;
    let msgTimer: ReturnType<typeof setTimeout> | null = null;

    const startTypingCycle = () => {
      typingTimer = setTimeout(() => {
        messageStore.setRemoteTyping(conversationId, true);
        setTimeout(() => messageStore.setRemoteTyping(conversationId, false), rand(800, 1500));
        startTypingCycle();
      }, rand(4000, 9000));
    };

    const startIncomingMsgCycle = () => {
      msgTimer = setTimeout(() => {
        const samples = [
          'Ок!',
          'Ща гляну 👀',
          'Супер 🔥',
          'Как думаешь?',
          'Принято 👍',
          'Ха-ха 😂',
        ];
        void messageStore.addIncomingMessage(conversationId, samples[rand(0, samples.length - 1)]);
        startIncomingMsgCycle();
      }, rand(10000, 20000));
    };

    startTypingCycle();
    startIncomingMsgCycle();

    return () => {
      messageStore.stopPolling();
      if (typingTimer) clearTimeout(typingTimer);
      if (msgTimer) clearTimeout(msgTimer);
      messageStore.setRemoteTyping(conversationId, false);
    };
  }, [conversationId]);

  return messageStore;
};
