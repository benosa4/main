import type { AppSettingsState } from '../config/appSettings';

export type ConvType = 'private' | 'group' | 'channel';
export type Kind = 'photo' | 'videoGif' | 'file';

export function autoDownloadAllowed(cfg: AppSettingsState['dataMemory'], kind: Kind, convType: ConvType, sizeBytes?: number): boolean {
  const mb = typeof sizeBytes === 'number' ? sizeBytes / (1024 * 1024) : undefined;
  if (typeof mb === 'number' && mb > cfg.maxFileSizeMb) return false;
  const key: readonly (
    | 'contacts'
    | 'direct'
    | 'groups'
    | 'channels'
  )[] =
    convType === 'private'
      ? ['contacts', 'direct']
      : convType === 'group'
        ? ['groups']
        : ['channels'];
  switch (kind) {
    case 'photo': {
      // For private, allow if either contacts or direct are enabled (no contact granularity available).
      if (convType === 'private') return cfg.autoPhoto.contacts || cfg.autoPhoto.direct;
      return key.includes('groups') ? cfg.autoPhoto.groups : cfg.autoPhoto.channels;
    }
    case 'videoGif': {
      if (convType === 'private') return cfg.autoVideoGif.contacts || cfg.autoVideoGif.direct;
      return key.includes('groups') ? cfg.autoVideoGif.groups : cfg.autoVideoGif.channels;
    }
    case 'file': {
      if (convType === 'private') return cfg.autoFiles.contacts || cfg.autoFiles.direct;
      return key.includes('groups') ? cfg.autoFiles.groups : cfg.autoFiles.channels;
    }
  }
}

