const DB_NAME = 'chat-app';
const DB_VERSION = 2;
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
