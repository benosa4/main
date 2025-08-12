import { makeAutoObservable, runInAction } from 'mobx';
import type { AppSettingsDTO } from '../db';
import { loadAppSettingsFromDB, saveAppSettingsToDB, loadAppSettingsFromRemote, saveAppSettingsToRemote } from '../db';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface AppSettingsState {
  theme: ThemeMode;
  animations: boolean;
  version: 'A' | 'K';
  lastConversationId?: number | null;
  chatWallpaperUrl?: string | null;
  chatWallpaperBlur: boolean;
  chatWallpaperGallery: { url: string; cacheDataUrl?: string | null }[];
  chatColor: string; // HEX
  textSize: number; // px
  timeFormat: '12h' | '24h';
  keyboardMode: 'enter' | 'ctrlEnter';
}

const DEFAULTS: AppSettingsState = {
  theme: 'dark',
  animations: true,
  version: 'K',
  lastConversationId: null,
  chatWallpaperUrl: null,
  chatWallpaperBlur: false,
  chatWallpaperGallery: [],
  chatColor: '#2563eb', // tailwind blue-600
  textSize: 16,
  timeFormat: '24h',
  keyboardMode: 'enter',
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
      let dto = await loadAppSettingsFromDB();
      if (!dto) {
        // fallback to mock remote when local missing
        dto = await loadAppSettingsFromRemote();
      }
      const merged: AppSettingsState = dto
        ? {
            theme: (dto.theme as ThemeMode) ?? DEFAULTS.theme,
            animations: dto.animations ?? DEFAULTS.animations,
            version: dto.version ?? DEFAULTS.version,
            lastConversationId: dto.lastConversationId ?? null,
            chatWallpaperUrl: (dto as any).chatWallpaperUrl ?? (dto as any).chatBackgroundUrl ?? null,
            chatWallpaperBlur: dto.chatWallpaperBlur ?? DEFAULTS.chatWallpaperBlur,
            chatWallpaperGallery: dto.chatWallpaperGallery ?? DEFAULTS.chatWallpaperGallery,
            chatColor: dto.chatColor ?? DEFAULTS.chatColor,
            textSize: dto.textSize ?? DEFAULTS.textSize,
            timeFormat: dto.timeFormat ?? DEFAULTS.timeFormat,
            keyboardMode: dto.keyboardMode ?? DEFAULTS.keyboardMode,
          }
        : { ...DEFAULTS };
      runInAction(() => {
        this.state = merged;
        this.applyEffects();
      });
      // Ensure current wallpaper present in gallery
      if (this.state.chatWallpaperUrl) {
        const exists = this.state.chatWallpaperGallery.find((g) => g.url === this.state.chatWallpaperUrl);
        if (!exists) {
          this.state.chatWallpaperGallery = [{ url: this.state.chatWallpaperUrl, cacheDataUrl: null }, ...this.state.chatWallpaperGallery];
        }
      }
      // Всегда записываем актуальные настройки, чтобы точно существовала запись
      await this.persist();
    } finally {
      this.loading = false;
    }
  }

  private applyEffects() {
    const root = document.documentElement;
    const mode = this.state.theme === 'auto'
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : this.state.theme;
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-animations', this.state.animations ? 'on' : 'off');
    root.style.setProperty('--app-text-size', `${this.state.textSize}px`);
    root.style.setProperty('--chat-accent-color', this.state.chatColor);
  }

  async persist() {
    const dto: AppSettingsDTO = {
      id: 'app',
      theme: this.state.theme,
      animations: this.state.animations,
      version: this.state.version,
      lastConversationId: this.state.lastConversationId ?? null,
      chatWallpaperUrl: this.state.chatWallpaperUrl ?? null,
      chatWallpaperBlur: this.state.chatWallpaperBlur,
      chatWallpaperGallery: this.state.chatWallpaperGallery,
      chatColor: this.state.chatColor,
      textSize: this.state.textSize,
      timeFormat: this.state.timeFormat,
      keyboardMode: this.state.keyboardMode,
    };
    await saveAppSettingsToDB(dto);
    // mock remote sync
    try {
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
    const next = this.state.theme === 'dark' ? 'light' : this.state.theme === 'light' ? 'auto' : 'dark';
    this.setTheme(next);
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

  setChatWallpaperUrl(url: string | null) {
    this.state.chatWallpaperUrl = url ?? null;
    void this.persist();
  }

  setChatWallpaperBlur(on: boolean) {
    this.state.chatWallpaperBlur = on;
    void this.persist();
  }

  addWallpaperToGallery(item: { url: string; cacheDataUrl?: string | null }) {
    const exists = this.state.chatWallpaperGallery.find((g) => g.url === item.url);
    if (exists) {
      exists.cacheDataUrl = item.cacheDataUrl ?? exists.cacheDataUrl ?? null;
    } else {
      this.state.chatWallpaperGallery = [item, ...this.state.chatWallpaperGallery].slice(0, 60);
    }
    void this.persist();
  }

  setChatColor(hex: string) {
    this.state.chatColor = hex;
    this.applyEffects();
    void this.persist();
  }

  setTextSize(px: number) {
    const v = Math.max(12, Math.min(24, Math.round(px)));
    this.state.textSize = v;
    this.applyEffects();
    void this.persist();
  }

  setTimeFormat(fmt: '12h' | '24h') {
    this.state.timeFormat = fmt;
    void this.persist();
  }

  setKeyboardMode(mode: 'enter' | 'ctrlEnter') {
    this.state.keyboardMode = mode;
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
