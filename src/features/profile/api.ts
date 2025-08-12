export interface Profile {
  displayName: string;
  username: string;
  phone: string;
  about?: string | null;
  birthdayLabel?: string | null;
  avatarUrl?: string | null;
  avatarCacheDataUrl?: string | null;
}

// Mock REST API call
export async function fetchProfile(): Promise<Profile> {
  return Promise.resolve({
    displayName: 'Igor Dronov',
    phone: '+79787396153',
    username: '@Benosa',
    about: 'Infinity',
    birthdayLabel: '29 февраля (45 лет)',
    avatarUrl: null,
  });
}

