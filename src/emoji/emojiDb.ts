import { Tone } from './emojiMap';

export type UsageRow = { key: string; name: string; tone: Tone; count: number; lastUsedAt: number };

const DB_NAME = 'emoji_db';
const STORE = 'usage';
const LS_KEY = 'emoji_usage';

export function isDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

async function withStore<T>(mode: IDBTransactionMode, cb: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const openReq = indexedDB.open(DB_NAME, 1);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    openReq.onerror = () => reject(openReq.error);
    openReq.onsuccess = () => {
      const db = openReq.result;
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      Promise.resolve(cb(store))
        .then((res) => {
          tx.oncomplete = () => resolve(res);
          tx.onerror = () => reject(tx.error);
        })
        .catch(reject);
    };
  });
}

export async function bumpUsage(name: string, tone: Tone): Promise<void> {
  const key = `${name}|${tone}`;
  const now = Date.now();
  if (!isDbAvailable()) {
    const all: UsageRow[] = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    const idx = all.findIndex((r) => r.key === key);
    if (idx >= 0) {
      all[idx].count += 1;
      all[idx].lastUsedAt = now;
    } else {
      all.push({ key, name, tone, count: 1, lastUsedAt: now });
    }
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    return;
  }
  await withStore('readwrite', async (store) => {
    const req = store.get(key);
    const row: UsageRow | undefined = await new Promise<UsageRow | undefined>((resolve, reject) => {
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result as UsageRow | undefined);
    });
    const next: UsageRow = row
      ? { ...row, count: row.count + 1, lastUsedAt: now }
      : { key, name, tone, count: 1, lastUsedAt: now };
    store.put(next);
  });
}

export async function getTopRecents(limit: number): Promise<UsageRow[]> {
  const sort = (rows: UsageRow[]) =>
    rows
      .sort((a, b) => {
        if (b.lastUsedAt === a.lastUsedAt) return b.count - a.count;
        return b.lastUsedAt - a.lastUsedAt;
      })
      .slice(0, limit);
  if (!isDbAvailable()) {
    const all: UsageRow[] = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return sort(all);
  }
  const rows: UsageRow[] = await withStore('readonly', async (store) => {
    const req = store.getAll();
    return await new Promise<UsageRow[]>((resolve, reject) => {
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve((req.result as UsageRow[]) || []);
    });
  });
  return sort(rows);
}
