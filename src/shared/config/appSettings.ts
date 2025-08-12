import { makeAutoObservable, runInAction } from 'mobx';
import type { AppSettingsDTO } from '../db';
import { loadAppSettingsFromDB, saveAppSettingsToDB, loadAppSettingsFromRemote, saveAppSettingsToRemote } from '../db';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface AppSettingsState {
  theme: ThemeMode;
  animations: boolean;
  animationProfile: 'low' | 'balanced' | 'max';
  animationPrefs: {
    interface: {
      menuTransitions: boolean;
      sendMessage: boolean;
      mediaView: boolean;
      typing: boolean;
      contextMenus: boolean;
      contextBlur: boolean;
      rightMenu: boolean;
      deletion: boolean;
    };
    stickers: {
      emojiAnimation: boolean;
      loopAnimation: boolean;
      animatedReactions: boolean;
      stickerEffects: boolean;
    };
    autoplay: {
      gif: boolean;
      video: boolean;
    };
  };
  version: 'A' | 'K';
  lastConversationId?: number | null;
  chatWallpaperUrl?: string | null;
  chatWallpaperBlur: boolean;
  chatWallpaperGallery: { url: string; cacheDataUrl?: string | null }[];
  chatColor: string; // HEX
  textSize: number; // px
  timeFormat: '12h' | '24h';
  keyboardMode: 'enter' | 'ctrlEnter';
  notifications: {
    web: boolean;
    background: boolean;
    volume: number; // 0..10, default 5
    direct: { enabled: boolean; preview: boolean };
    groups: { enabled: boolean; preview: boolean };
    channels: { enabled: boolean };
    other: { contactJoined: boolean };
  };
  dataMemory: {
    autoPhoto: { contacts: boolean; direct: boolean; groups: boolean; channels: boolean };
    autoVideoGif: { contacts: boolean; direct: boolean; groups: boolean; channels: boolean };
    autoFiles: { contacts: boolean; direct: boolean; groups: boolean; channels: boolean };
    maxFileSizeMb: number; // 0..10
  };
  privacy: {
    blacklistCount: number;
    blacklist: { id: string; displayName: string; username: string; avatarUrl?: string | null }[];
    passcodeEnabled: boolean;
    cloudPasswordEnabled: boolean;
    activeSitesCount: number;
    visibilities: {
      phoneNumber: 'nobody'|'contacts'|'everyone'|'not_used';
      lastSeen: 'everyone'|'contacts'|'nobody';
      profilePhotos: 'everyone'|'contacts'|'nobody';
      about: 'everyone'|'contacts'|'nobody';
      birthday: 'contacts'|'everyone'|'nobody';
      gifts: 'miniapps'|'everyone'|'contacts'|'nobody';
      forwardLink: 'not_used'|'everyone'|'contacts'|'nobody';
      calls: 'everyone'|'contacts'|'nobody';
      voiceMsgs: 'everyone'|'contacts'|'nobody';
      messages: 'everyone'|'contacts'|'nobody';
      groupAdd: 'everyone'|'contacts'|'nobody';
    };
    sensitive18plus: boolean;
    showChatWindowTitle: boolean;
  };
}

const DEFAULTS: AppSettingsState = {
  theme: 'dark',
  animations: true,
  animationProfile: 'balanced',
  animationPrefs: {
    interface: {
      menuTransitions: true,
      sendMessage: true,
      mediaView: true,
      typing: true,
      contextMenus: true,
      contextBlur: true,
      rightMenu: false,
      deletion: false,
    },
    stickers: {
      emojiAnimation: false,
      loopAnimation: false,
      animatedReactions: false,
      stickerEffects: false,
    },
    autoplay: {
      gif: false,
      video: false,
    },
  },
  version: 'K',
  lastConversationId: null,
  chatWallpaperUrl: null,
  chatWallpaperBlur: false,
  chatWallpaperGallery: [],
  chatColor: '#2563eb', // tailwind blue-600
  textSize: 16,
  timeFormat: '24h',
  keyboardMode: 'enter',
  notifications: {
    web: false,
    background: false,
    volume: 5,
    direct: { enabled: true, preview: true },
    groups: { enabled: true, preview: true },
    channels: { enabled: true },
    other: { contactJoined: true },
  },
  dataMemory: {
    autoPhoto: { contacts: true, direct: true, groups: false, channels: false },
    autoVideoGif: { contacts: false, direct: false, groups: false, channels: false },
    autoFiles: { contacts: false, direct: false, groups: false, channels: false },
    maxFileSizeMb: 5,
  },
  privacy: {
    blacklistCount: 3,
    blacklist: [
      { id: 'u1', displayName: 'Иван Петров', username: 'ivan_petrov', avatarUrl: 'https://placehold.co/48x48?text=IP' },
      { id: 'u2', displayName: 'Alice', username: 'alice', avatarUrl: 'https://placehold.co/48x48?text=A' },
      { id: 'u3', displayName: 'Bob', username: 'bob', avatarUrl: 'https://placehold.co/48x48?text=B' },
    ],
    passcodeEnabled: false,
    cloudPasswordEnabled: false,
    activeSitesCount: 2,
    visibilities: {
      phoneNumber: 'not_used',
      lastSeen: 'everyone',
      profilePhotos: 'everyone',
      about: 'everyone',
      birthday: 'contacts',
      gifts: 'miniapps',
      forwardLink: 'not_used',
      calls: 'everyone',
      voiceMsgs: 'everyone',
      messages: 'everyone',
      groupAdd: 'everyone',
    },
    sensitive18plus: false,
    showChatWindowTitle: true,
  },
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
            animationProfile: (dto.animationProfile as any) ?? DEFAULTS.animationProfile,
            animationPrefs: (dto.animationPrefs as any) ?? DEFAULTS.animationPrefs,
            version: dto.version ?? DEFAULTS.version,
            lastConversationId: dto.lastConversationId ?? null,
            chatWallpaperUrl: (dto as any).chatWallpaperUrl ?? (dto as any).chatBackgroundUrl ?? null,
            chatWallpaperBlur: dto.chatWallpaperBlur ?? DEFAULTS.chatWallpaperBlur,
            chatWallpaperGallery: dto.chatWallpaperGallery ?? DEFAULTS.chatWallpaperGallery,
            chatColor: dto.chatColor ?? DEFAULTS.chatColor,
            textSize: dto.textSize ?? DEFAULTS.textSize,
            timeFormat: dto.timeFormat ?? DEFAULTS.timeFormat,
            keyboardMode: dto.keyboardMode ?? DEFAULTS.keyboardMode,
            notifications: dto.notifications ?? DEFAULTS.notifications,
            dataMemory: dto.dataMemory ?? DEFAULTS.dataMemory,
            privacy: {
              blacklistCount: (dto.privacy?.blacklist?.length ?? dto.privacy?.blacklistCount ?? DEFAULTS.privacy.blacklistCount) as number,
              blacklist: dto.privacy?.blacklist ?? DEFAULTS.privacy.blacklist,
              passcodeEnabled: dto.privacy?.passcodeEnabled ?? DEFAULTS.privacy.passcodeEnabled,
              cloudPasswordEnabled: dto.privacy?.cloudPasswordEnabled ?? DEFAULTS.privacy.cloudPasswordEnabled,
              activeSitesCount: dto.privacy?.activeSitesCount ?? DEFAULTS.privacy.activeSitesCount,
              visibilities: dto.privacy?.visibilities ?? DEFAULTS.privacy.visibilities,
              sensitive18plus: dto.privacy?.sensitive18plus ?? DEFAULTS.privacy.sensitive18plus,
              showChatWindowTitle: dto.privacy?.showChatWindowTitle ?? DEFAULTS.privacy.showChatWindowTitle,
            },
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
    root.setAttribute('data-anim-profile', this.state.animationProfile);
    root.setAttribute('data-emoji-anim', this.state.animationPrefs.stickers.emojiAnimation ? 'on' : 'off');
    root.setAttribute('data-emoji-loop', this.state.animationPrefs.stickers.loopAnimation ? 'on' : 'off');
    // allow CSS to know about autoplay preferences (for future hooks)
    root.setAttribute('data-autoplay-gif', this.state.animationPrefs.autoplay.gif ? 'on' : 'off');
    root.setAttribute('data-autoplay-video', this.state.animationPrefs.autoplay.video ? 'on' : 'off');
    root.style.setProperty('--app-text-size', `${this.state.textSize}px`);
    root.style.setProperty('--chat-accent-color', this.state.chatColor);
  }

  async persist() {
    const dto: AppSettingsDTO = {
      id: 'app',
      theme: this.state.theme,
      animations: this.state.animations,
      animationProfile: this.state.animationProfile,
      animationPrefs: this.state.animationPrefs,
      version: this.state.version,
      lastConversationId: this.state.lastConversationId ?? null,
      chatWallpaperUrl: this.state.chatWallpaperUrl ?? null,
      chatWallpaperBlur: this.state.chatWallpaperBlur,
      chatWallpaperGallery: this.state.chatWallpaperGallery,
      chatColor: this.state.chatColor,
      textSize: this.state.textSize,
      timeFormat: this.state.timeFormat,
      keyboardMode: this.state.keyboardMode,
      notifications: this.state.notifications,
      dataMemory: this.state.dataMemory,
      privacy: {
        ...this.state.privacy,
        blacklistCount: this.state.privacy.blacklist?.length ?? this.state.privacy.blacklistCount,
      },
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

  // Notifications setters
  setWebNotifications(on: boolean) {
    this.state.notifications.web = on;
    void this.persist();
  }
  setBackgroundNotifications(on: boolean) {
    this.state.notifications.background = on;
    void this.persist();
  }
  setNotificationsVolume(v: number) {
    const clamped = Math.max(0, Math.min(10, Math.round(v)));
    this.state.notifications.volume = clamped;
    void this.persist();
  }
  setDirectNotifications(on: boolean) {
    this.state.notifications.direct.enabled = on;
    void this.persist();
  }
  setDirectPreview(on: boolean) {
    this.state.notifications.direct.preview = on;
    void this.persist();
  }
  setGroupNotifications(on: boolean) {
    this.state.notifications.groups.enabled = on;
    void this.persist();
  }
  setGroupPreview(on: boolean) {
    this.state.notifications.groups.preview = on;
    void this.persist();
  }
  setChannelNotifications(on: boolean) {
    this.state.notifications.channels.enabled = on;
    void this.persist();
  }
  setOtherContactJoined(on: boolean) {
    this.state.notifications.other.contactJoined = on;
    void this.persist();
  }

  // Data & memory setters
  setAutoPhoto(category: 'contacts'|'direct'|'groups'|'channels', on: boolean) {
    this.state.dataMemory.autoPhoto[category] = on;
    void this.persist();
  }
  setAutoVideoGif(category: 'contacts'|'direct'|'groups'|'channels', on: boolean) {
    this.state.dataMemory.autoVideoGif[category] = on;
    void this.persist();
  }
  setAutoFiles(category: 'contacts'|'direct'|'groups'|'channels', on: boolean) {
    this.state.dataMemory.autoFiles[category] = on;
    void this.persist();
  }
  setMaxFileSizeMb(v: number) {
    const clamped = Math.max(0, Math.min(10, Math.round(v)));
    this.state.dataMemory.maxFileSizeMb = clamped;
    void this.persist();
  }

  // Privacy setters
  setPasscodeEnabled(on: boolean) {
    this.state.privacy.passcodeEnabled = on;
    void this.persist();
  }
  setCloudPasswordEnabled(on: boolean) {
    this.state.privacy.cloudPasswordEnabled = on;
    void this.persist();
  }
  setSensitive18(on: boolean) {
    this.state.privacy.sensitive18plus = on;
    void this.persist();
  }
  setShowChatWindowTitle(on: boolean) {
    this.state.privacy.showChatWindowTitle = on;
    void this.persist();
  }
  setPrivacyVisibility<K extends keyof AppSettingsState['privacy']['visibilities']>(key: K, value: AppSettingsState['privacy']['visibilities'][K]) {
    (this.state.privacy.visibilities[key] as any) = value as any;
    void this.persist();
  }

  // Animation profile and prefs
  setAnimationProfile(profile: 'low' | 'balanced' | 'max') {
    this.state.animationProfile = profile;
    if (profile === 'low') {
      // turn off everything
      this.state.animations = false;
      this.state.animationPrefs = {
        interface: {
          menuTransitions: false,
          sendMessage: false,
          mediaView: false,
          typing: false,
          contextMenus: false,
          contextBlur: false,
          rightMenu: false,
          deletion: false,
        },
        stickers: {
          emojiAnimation: false,
          loopAnimation: false,
          animatedReactions: false,
          stickerEffects: false,
        },
        autoplay: { gif: false, video: false },
      };
    } else if (profile === 'balanced') {
      this.state.animations = true;
      this.state.animationPrefs = {
        interface: {
          menuTransitions: true,
          sendMessage: true,
          mediaView: true,
          typing: true,
          contextMenus: true,
          contextBlur: true,
          rightMenu: false,
          deletion: false,
        },
        stickers: {
          emojiAnimation: false,
          loopAnimation: false,
          animatedReactions: false,
          stickerEffects: false,
        },
        autoplay: { gif: false, video: false },
      };
    } else {
      // max
      this.state.animations = true;
      this.state.animationPrefs = {
        interface: {
          menuTransitions: true,
          sendMessage: true,
          mediaView: true,
          typing: true,
          contextMenus: true,
          contextBlur: true,
          rightMenu: true,
          deletion: true,
        },
        stickers: {
          emojiAnimation: true,
          loopAnimation: true,
          animatedReactions: true,
          stickerEffects: true,
        },
        autoplay: { gif: true, video: true },
      };
    }
    this.applyEffects();
    void this.persist();
  }

  setAnimationGroupEnabled(group: 'interface' | 'stickers' | 'autoplay', enabled: boolean) {
    const prefs = this.state.animationPrefs;
    const groupObj = prefs[group] as any;
    Object.keys(groupObj).forEach((k) => {
      (groupObj as any)[k] = enabled;
    });
    // update global animations based on whether low or any enabled
    const anyOn = this.anyAnimationEnabled();
    this.state.animations = anyOn;
    this.state.animationProfile = this.deriveProfileFromPrefs();
    this.applyEffects();
    void this.persist();
  }

  setAnimationItem(path: ['interface'|'stickers'|'autoplay', string], value: boolean) {
    const [group, key] = path;
    (this.state.animationPrefs as any)[group][key] = value;
    const anyOn = this.anyAnimationEnabled();
    this.state.animations = anyOn;
    this.state.animationProfile = this.deriveProfileFromPrefs();
    this.applyEffects();
    void this.persist();
  }

  private anyAnimationEnabled(): boolean {
    const p = this.state.animationPrefs;
    return (
      Object.values(p.interface).some(Boolean) ||
      Object.values(p.stickers).some(Boolean) ||
      Object.values(p.autoplay).some(Boolean)
    );
  }

  private deriveProfileFromPrefs(): 'low'|'balanced'|'max' {
    // If nothing enabled => low; if exactly matches DEFAULTS => balanced; if all true => max; otherwise keep current
    const p = this.state.animationPrefs;
    const allInterface = Object.values(p.interface).every(Boolean);
    const allStickers = Object.values(p.stickers).every(Boolean);
    const allAutoplay = Object.values(p.autoplay).every(Boolean);
    if (!this.anyAnimationEnabled()) return 'low';
    const isBalanced =
      p.interface.menuTransitions &&
      p.interface.sendMessage &&
      p.interface.mediaView &&
      p.interface.typing &&
      p.interface.contextMenus &&
      p.interface.contextBlur &&
      !p.interface.rightMenu &&
      !p.interface.deletion &&
      !Object.values(p.stickers).some(Boolean) &&
      !Object.values(p.autoplay).some(Boolean);
    if (isBalanced) return 'balanced';
    if (allInterface && allStickers && allAutoplay) return 'max';
    return this.state.animationProfile;
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
