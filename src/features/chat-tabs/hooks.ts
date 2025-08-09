import { useEffect } from 'react';
import { chatTabsStore } from './model';

export const useChatTabs = () => {
  useEffect(() => {
    chatTabsStore.load();
  }, []);

  return chatTabsStore;
};
