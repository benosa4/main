import { makeAutoObservable, runInAction } from 'mobx';
import type { Profile } from './api';
import { fetchProfile } from './api';
import { loadProfileFromDB, saveProfileToDB, type ProfileDTO } from '../../shared/db';

class ProfileStore {
  profile: Profile | null = null;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.loading = true;
    try {
      const cached = await loadProfileFromDB();
      if (cached) {
        runInAction(() => {
          this.profile = {
            displayName: cached.displayName,
            username: cached.username,
            phone: cached.phone,
            about: cached.about ?? null,
            birthdayLabel: cached.birthdayLabel ?? null,
            avatarUrl: cached.avatarUrl ?? null,
            avatarCacheDataUrl: cached.avatarCacheDataUrl ?? null,
          };
        });
        if (cached.avatarUrl && !cached.avatarCacheDataUrl) {
          void this.cacheAvatarFromUrl(cached.avatarUrl);
        }
        return;
      }
      const data = await fetchProfile();
      runInAction(() => {
        this.profile = data;
      });
      const dto: ProfileDTO = {
        id: 'me',
        displayName: data.displayName,
        username: data.username,
        phone: data.phone,
        about: data.about ?? null,
        birthdayLabel: data.birthdayLabel ?? null,
        avatarUrl: data.avatarUrl ?? null,
        // keep empty cache on first fetch
        avatarCacheDataUrl: null,
      };
      await saveProfileToDB(dto);
      if (data.avatarUrl) {
        void this.cacheAvatarFromUrl(data.avatarUrl);
      }
    } finally {
      this.loading = false;
    }
  }

  async setAvatar({ remoteUrl, cacheDataUrl }: { remoteUrl: string; cacheDataUrl: string }) {
    if (!this.profile) return;
    this.profile.avatarUrl = remoteUrl;
    this.profile.avatarCacheDataUrl = cacheDataUrl;
    const dto: ProfileDTO = {
      id: 'me',
      displayName: this.profile.displayName,
      username: this.profile.username,
      phone: this.profile.phone,
      about: this.profile.about ?? null,
      birthdayLabel: this.profile.birthdayLabel ?? null,
      avatarUrl: this.profile.avatarUrl ?? null,
      avatarCacheDataUrl: cacheDataUrl,
    };
    await saveProfileToDB(dto);
  }

  private async cacheAvatarFromUrl(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await this.setAvatar({ remoteUrl: url, cacheDataUrl: dataUrl });
    } catch (err) {
      console.error('failed to cache avatar', err);
    }
  }
}

export const profileStore = new ProfileStore();
