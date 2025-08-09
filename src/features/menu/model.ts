import { makeAutoObservable } from 'mobx';
import { MenuItem, fetchMenuItems } from './api';

class MenuStore {
  items: MenuItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.items = await fetchMenuItems();
  }
}

export const menuStore = new MenuStore();
