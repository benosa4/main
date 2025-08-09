import { useEffect } from 'react';
import { chatStore } from './model';

export const useChats = () => {
  useEffect(() => {
    chatStore.load();
  }, []);

  return chatStore;
};
