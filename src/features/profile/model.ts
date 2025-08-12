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
          };
          // @ts-ignore keep cache DataURL for UI if present
          (this.profile as any).avatarCacheDataUrl = (cached as any).avatarCacheDataUrl || null;
        });
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
        // @ts-ignore
        avatarCacheDataUrl: null,
      };
      await saveProfileToDB(dto);
    } finally {
      this.loading = false;
    }
  }

  async setAvatar({ remoteUrl, cacheDataUrl }: { remoteUrl: string; cacheDataUrl: string }) {
    if (!this.profile) return;
    this.profile.avatarUrl = remoteUrl;
    // @ts-ignore ephemeral cache for UI
    (this.profile as any).avatarCacheDataUrl = cacheDataUrl;
    const dto: ProfileDTO = {
      id: 'me',
      displayName: this.profile.displayName,
      username: this.profile.username,
      phone: this.profile.phone,
      about: this.profile.about ?? null,
      birthdayLabel: this.profile.birthdayLabel ?? null,
      avatarUrl: this.profile.avatarUrl ?? null,
      // @ts-ignore persist cached DataURL
      avatarCacheDataUrl: cacheDataUrl,
    } as any;
    await saveProfileToDB(dto);
  }
}

export const profileStore = new ProfileStore();
