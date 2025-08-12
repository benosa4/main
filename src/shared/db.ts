const DB_NAME = 'chat-app';
const DB_VERSION = 7;
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tabs')) {
          db.createObjectStore('tabs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { keyPath: 'id' });
          try {
            store.createIndex('byConversation', 'conversationId', { unique: false });
            store.createIndex(
              'byConversationAndCreatedAt',
              ['conversationId', 'createdAt'],
              { unique: false }
            );
          } catch {
            // index creation may fail on some browsers; ignore
          }
        }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings_remote')) {
        db.createObjectStore('settings_remote', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'conversationId' });
        }
        if (!db.objectStoreNames.contains('drafts_remote')) {
          db.createObjectStore('drafts_remote', { keyPath: 'conversationId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveChatsToDB(chats: import('../features/chats/api').Chat[]) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('chats', 'readwrite');
    const store = tx.objectStore('chats');
    chats.forEach((chat) => {
      const plain = JSON.parse(JSON.stringify(chat));
      store.put(plain);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadChatsFromDB(): Promise<import('../features/chats/api').Chat[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chats', 'readonly');
    const store = tx.objectStore('chats');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as import('../features/chats/api').Chat[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTabsToDB(tabs: import('../features/chat-tabs/api').ChatTab[]) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('tabs', 'readwrite');
    const store = tx.objectStore('tabs');
    tabs.forEach((tab) => {
      const plain = JSON.parse(JSON.stringify(tab));
      store.put(plain);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadTabsFromDB(): Promise<import('../features/chat-tabs/api').ChatTab[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tabs', 'readonly');
    const store = tx.objectStore('tabs');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as import('../features/chat-tabs/api').ChatTab[]);
    req.onerror = () => reject(req.error);
  });
}

// Conversations
export async function saveConversationsToDB(conversations: import('../entities/conversation/types').Conversation[]) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    conversations.forEach((c) => store.put(JSON.parse(JSON.stringify(c))));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadConversationsFromDB(): Promise<import('../entities/conversation/types').Conversation[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('conversations', 'readonly');
    const store = tx.objectStore('conversations');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as any);
    req.onerror = () => reject(req.error);
  });
}

// Messages
export async function putMessagesToDB(messages: import('../entities/message/types').MessageModel[]) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    messages.forEach((m) => store.put(JSON.parse(JSON.stringify(m))));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export interface LoadMessagesParams {
  conversationId: number;
  limit?: number;
  beforeId?: string; // page older than this message id
}

export async function loadMessagesByConversation({ conversationId, limit, beforeId }: LoadMessagesParams) {
  const db = await getDB();
  return new Promise<import('../entities/message/types').MessageModel[]>((resolve, reject) => {
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index?.('byConversation');
    const request = index ? index.getAll(conversationId) : store.getAll();
    request.onsuccess = () => {
      let res = (request.result as any[]).filter((m) => m.conversationId === conversationId);
      // sort ascending by time
      res.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (beforeId) {
        const idx = res.findIndex((m) => m.id === beforeId);
        const end = idx >= 0 ? idx : res.length;
        if (typeof limit === 'number') {
          const start = Math.max(0, end - limit);
          res = res.slice(start, end);
        } else {
          res = res.slice(0, end);
        }
      } else if (typeof limit === 'number') {
        // take the last N items
        res = res.slice(-limit);
      }
      resolve(res as any);
    };
    request.onerror = () => reject(request.error);
  });
}

// App Settings
export interface AppSettingsDTO {
  id: 'app';
  theme: 'dark' | 'light' | 'auto';
  animations: boolean;
  // Animation profile and detailed preferences
  animationProfile?: 'low' | 'balanced' | 'max' | null;
  animationPrefs?: {
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
  } | null;
  version: 'A' | 'K';
  lastConversationId?: number | null;
  // Chat background (wallpaper)
  chatWallpaperUrl?: string | null;
  chatWallpaperBlur?: boolean;
  // Cached gallery of wallpapers (data URLs optional)
  chatWallpaperGallery?: { url: string; cacheDataUrl?: string | null }[];
  // Chat accent color (HEX string like #RRGGBB)
  chatColor?: string | null;
  // Global text size in px
  textSize?: number | null;
  // Time format: 12h or 24h
  timeFormat?: '12h' | '24h';
  // Keyboard send mode
  keyboardMode?: 'enter' | 'ctrlEnter';
  // Notifications
  notifications?: {
    web: boolean;
    background: boolean;
    volume: number; // 0..10
    direct: { enabled: boolean; preview: boolean };
    groups: { enabled: boolean; preview: boolean };
    channels: { enabled: boolean };
    other: { contactJoined: boolean };
  } | null;
}

export async function loadAppSettingsFromDB(): Promise<AppSettingsDTO | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('app');
    req.onsuccess = () => resolve((req.result as AppSettingsDTO) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAppSettingsToDB(settings: AppSettingsDTO): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    // ensure we store a plain-clone (mobx observables can't be cloned by IDB)
    const plain = JSON.parse(JSON.stringify(settings));
    store.put(plain);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Mock remote persistence for settings
export async function loadAppSettingsFromRemote(): Promise<AppSettingsDTO | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings_remote', 'readonly');
    const store = tx.objectStore('settings_remote');
    const req = store.get('app');
    req.onsuccess = () => resolve((req.result as AppSettingsDTO) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAppSettingsToRemote(settings: AppSettingsDTO): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('settings_remote', 'readwrite');
    const store = tx.objectStore('settings_remote');
    const plain = JSON.parse(JSON.stringify(settings));
    store.put(plain);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Profile
export interface ProfileDTO {
  id: 'me';
  displayName: string;
  username: string;
  phone: string;
  about?: string | null;
  birthdayLabel?: string | null;
  avatarUrl?: string | null;
  avatarCacheDataUrl?: string | null;
}

export async function loadProfileFromDB(): Promise<ProfileDTO | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profile', 'readonly');
    const store = tx.objectStore('profile');
    const req = store.get('me');
    req.onsuccess = () => resolve((req.result as ProfileDTO) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProfileToDB(profile: ProfileDTO): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('profile', 'readwrite');
    const store = tx.objectStore('profile');
    store.put({ ...profile });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Drafts (local)
export interface DraftDTO { conversationId: number; text: string }

export async function loadDraftFromDB(conversationId: number): Promise<DraftDTO | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readonly');
    const store = tx.objectStore('drafts');
    const req = store.get(conversationId);
    req.onsuccess = () => resolve((req.result as DraftDTO) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraftToDB(draft: DraftDTO): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('drafts', 'readwrite');
    tx.objectStore('drafts').put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDraftFromDB(conversationId: number): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('drafts', 'readwrite');
    tx.objectStore('drafts').delete(conversationId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Drafts (mock remote)
export async function loadDraftFromRemote(conversationId: number): Promise<DraftDTO | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts_remote', 'readonly');
    const store = tx.objectStore('drafts_remote');
    const req = store.get(conversationId);
    req.onsuccess = () => resolve((req.result as DraftDTO) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraftToRemote(draft: DraftDTO): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('drafts_remote', 'readwrite');
    tx.objectStore('drafts_remote').put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDraftFromRemote(conversationId: number): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('drafts_remote', 'readwrite');
    tx.objectStore('drafts_remote').delete(conversationId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
