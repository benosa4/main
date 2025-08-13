import { makeAutoObservable } from 'mobx';

export type SettingsScreen =
  | 'root'
  | 'general'
  | 'wallpapers'
  | 'setColor'
  | 'animation'
  | 'notifications'
  | 'data'
  | 'privacy'
  | 'privacy_blacklist'
  | 'privacy_passcode'
  | 'privacy_cloudpass'
  | 'privacy_sites'
  | 'privacy_phone'
  | 'privacy_lastSeen'
  | 'privacy_photos'
  | 'privacy_about'
  | 'privacy_birthday'
  | 'privacy_gifts'
  | 'privacy_forward'
  | 'privacy_calls'
  | 'privacy_voice'
  | 'privacy_messages'
  | 'privacy_groups'
  | 'folders'
  | 'sessions'
  | 'language'
  | 'stickers'
  | 'stickers_emoji'
  | 'stickers_quick';

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
