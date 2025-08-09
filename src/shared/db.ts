const DB_NAME = 'chat-app';
const DB_VERSION = 1;
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
