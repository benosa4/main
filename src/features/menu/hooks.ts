import { useEffect } from 'react';
import { menuStore } from './model';

export const useMenu = () => {
  useEffect(() => {
    menuStore.load();
  }, []);

  return menuStore;
};
