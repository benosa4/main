import { useEffect } from 'react';
import { storyStore } from './model';

export const useStories = () => {
  useEffect(() => {
    storyStore.load();
  }, []);

  return storyStore;
};
