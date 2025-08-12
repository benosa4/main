import { makeAutoObservable, runInAction } from 'mobx';
import type { AppSettingsDTO } from '../db';
import { loadAppSettingsFromDB, saveAppSettingsToDB } from '../db';

export type ThemeMode = 'dark' | 'light';

export interface AppSettingsState {
  theme: ThemeMode;
  animations: boolean;
  version: 'A' | 'K';
  lastConversationId?: number | null;
  chatBackgroundUrl?: string | null;
}

const DEFAULTS: AppSettingsState = {
  theme: 'dark',
  animations: true,
  version: 'K',
  lastConversationId: null,
  chatBackgroundUrl: null,
};

class AppSettingsStore {
  state: AppSettingsState = { ...DEFAULTS };
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    this.loading = true;
    try {
      const dto = await loadAppSettingsFromDB();
      const merged: AppSettingsState = dto
        ? { theme: dto.theme, animations: dto.animations, version: dto.version, lastConversationId: dto.lastConversationId ?? null, chatBackgroundUrl: dto.chatBackgroundUrl ?? null }
        : { ...DEFAULTS };
      runInAction(() => {
        this.state = merged;
        this.applyEffects();
      });
      // Всегда записываем актуальные настройки, чтобы точно существовала запись
      await this.persist();
    } finally {
      this.loading = false;
    }
  }

  private applyEffects() {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.state.theme);
    root.setAttribute('data-animations', this.state.animations ? 'on' : 'off');
  }

  async persist() {
    const dto: AppSettingsDTO = {
      id: 'app',
      theme: this.state.theme,
      animations: this.state.animations,
      version: this.state.version,
      lastConversationId: this.state.lastConversationId ?? null,
      chatBackgroundUrl: this.state.chatBackgroundUrl ?? null,
    };
    await saveAppSettingsToDB(dto);
    // mock remote sync
    try {
      const { saveAppSettingsToRemote } = await import('../db');
      await saveAppSettingsToRemote(dto);
    } catch {
      // ignore remote errors in mock
    }
  }

  setTheme(mode: ThemeMode) {
    this.state.theme = mode;
    this.applyEffects();
    void this.persist();
  }

  toggleTheme() {
    this.setTheme(this.state.theme === 'dark' ? 'light' : 'dark');
  }

  setAnimations(on: boolean) {
    this.state.animations = on;
    this.applyEffects();
    void this.persist();
  }

  toggleAnimations() {
    this.setAnimations(!this.state.animations);
  }

  setVersion(v: 'A' | 'K') {
    this.state.version = v;
    void this.persist();
  }

  toggleVersion() {
    this.setVersion(this.state.version === 'K' ? 'A' : 'K');
  }

  setLastConversation(id: number | null) {
    this.state.lastConversationId = id ?? null;
    void this.persist();
  }

  setChatBackgroundUrl(url: string | null) {
    this.state.chatBackgroundUrl = url ?? null;
    void this.persist();
  }
}

export const appSettingsStore = new AppSettingsStore();
export default appSettingsStore;

export function useAppSettings() {
  // lightweight hook for init from pages
  if (!appSettingsStore.loading && document.readyState !== 'loading') {
    // noop; init called once elsewhere ideally
  }
  return appSettingsStore;
}
