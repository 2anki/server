import { ImageEntry } from '../types';

const META_KEY = 'io_deck_meta';
const DB_NAME = '2anki-io';
const STORE_NAME = 'images';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteBlob(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllBlobs(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

interface PersistedMeta {
  deckName: string;
  mode: 'hide_all' | 'hide_one';
  images: Array<{ id: string; header: string; rects: ImageEntry['rects'] }>;
}

export function saveMeta(
  deckName: string,
  mode: 'hide_all' | 'hide_one',
  entries: ImageEntry[]
): void {
  const meta: PersistedMeta = {
    deckName,
    mode,
    images: entries.map((e) => ({ id: e.id, header: e.header, rects: e.rects })),
  };
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function loadMeta(): PersistedMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as PersistedMeta) : null;
  } catch {
    return null;
  }
}

export async function hydrateEntries(meta: PersistedMeta): Promise<ImageEntry[]> {
  const entries: ImageEntry[] = [];
  for (const img of meta.images) {
    const blob = await loadBlob(img.id);
    if (blob == null) continue;
    const file = new File([blob], img.id, { type: blob.type });
    entries.push({
      id: img.id,
      file,
      header: img.header,
      rects: img.rects,
      previewUrl: URL.createObjectURL(blob),
    });
  }
  return entries;
}

export async function persistNewImages(newEntries: ImageEntry[]): Promise<void> {
  for (const entry of newEntries) {
    await saveBlob(entry.id, entry.file);
  }
}

export async function removePersistedImage(id: string): Promise<void> {
  await deleteBlob(id);
}

export async function clearPersistence(): Promise<void> {
  localStorage.removeItem(META_KEY);
  await clearAllBlobs();
}
