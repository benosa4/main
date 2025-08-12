import { makeAutoObservable } from 'mobx';

export type SettingsScreen =
  | 'root'
  | 'general'
  | 'animation'
  | 'notifications'
  | 'data'
  | 'privacy'
  | 'folders'
  | 'sessions'
  | 'language'
  | 'stickers';

class SettingsPanelStore {
  open = false;
  stack: SettingsScreen[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  show(screen: SettingsScreen = 'root') {
    this.open = true;
    this.stack = [screen];
  }

  push(screen: SettingsScreen) {
    if (!this.open) this.open = true;
    this.stack = [...this.stack, screen];
  }

  back() {
    if (this.stack.length <= 1) {
      this.close();
    } else {
      this.stack = this.stack.slice(0, -1);
    }
  }

  close() {
    this.open = false;
    this.stack = [];
  }
}

export const settingsPanelStore = new SettingsPanelStore();

