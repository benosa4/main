import { useEffect } from 'react';
import { messageStore } from './model';

export const useMessages = (conversationId: number | null | undefined) => {
  useEffect(() => {
    messageStore.init().catch(() => {});
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    messageStore.load(conversationId).catch(() => {});
    messageStore.startPolling(conversationId);
    return () => messageStore.stopPolling();
  }, [conversationId]);

  return messageStore;
};

