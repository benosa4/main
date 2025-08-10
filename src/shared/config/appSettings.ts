import { makeAutoObservable, runInAction } from 'mobx';
import type { AppSettingsDTO } from '../db';
import { loadAppSettingsFromDB, saveAppSettingsToDB } from '../db';
import { menuStore } from '../../features/menu/model';

export type ThemeMode = 'dark' | 'light';

export interface AppSettingsState {
  theme: ThemeMode;
  animations: boolean;
  version: 'A' | 'K';
}

const DEFAULTS: AppSettingsState = {
  theme: 'dark',
  animations: true,
  version: 'K',
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
        ? { theme: dto.theme, animations: dto.animations, version: dto.version }
        : { ...DEFAULTS };
      runInAction(() => {
        this.state = merged;
        // sync menu version
        menuStore.version = merged.version;
        this.applyEffects();
      });
      if (!dto) await this.persist();
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
    };
    await saveAppSettingsToDB(dto);
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
    menuStore.version = v;
    void this.persist();
  }

  toggleVersion() {
    this.setVersion(this.state.version === 'K' ? 'A' : 'K');
  }
}

export const appSettingsStore = new AppSettingsStore();

export function useAppSettings() {
  // lightweight hook for init from pages
  if (!appSettingsStore.loading && document.readyState !== 'loading') {
    // noop; init called once elsewhere ideally
  }
  return appSettingsStore;
}

