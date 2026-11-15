import type { StoredSnapshot } from '../shared/contracts';

/**
 * Origin Private File System (OPFS) and IndexedDB hybrid snapshot storage.
 * Stores binary screenshot captures (WebP) separated from structured metadata.
 */
export class SnapshotStore {
  private opfsAvailable: boolean | null = null;

  private async checkOpfs(): Promise<boolean> {
    if (this.opfsAvailable !== null) return this.opfsAvailable;
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.getDirectory === 'function') {
        await navigator.storage.getDirectory();
        this.opfsAvailable = true;
      } else {
        this.opfsAvailable = false;
      }
    } catch {
      this.opfsAvailable = false;
    }
    return this.opfsAvailable;
  }

  async saveSnapshot(id: string, dataUrl: string): Promise<void> {
    const hasOpfs = await this.checkOpfs();

    if (hasOpfs) {
      try {
        const root = await navigator.storage.getDirectory();
        const snapshotsDir = await root.getDirectoryHandle('snapshots', { create: true });
        const fileHandle = await snapshotsDir.getFileHandle(`${id}.webp`, { create: true });
        const writable = await fileHandle.createWritable();

        // Convert dataUrl to blob/arrayBuffer
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await writable.write(blob);
        await writable.close();
        return;
      } catch {
        // Fall back to IndexedDB on OPFS write failure
      }
    }

    // Fallback: save to IndexedDB snapshots table
    const db = await this.openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      const record: StoredSnapshot = {
        id,
        dataUrl,
        mimeType: 'image/webp',
        timestamp: Date.now(),
      };
      tx.objectStore('snapshots').put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSnapshot(id: string): Promise<string | undefined> {
    const hasOpfs = await this.checkOpfs();

    if (hasOpfs) {
      try {
        const root = await navigator.storage.getDirectory();
        const snapshotsDir = await root.getDirectoryHandle('snapshots', { create: false });
        const fileHandle = await snapshotsDir.getFileHandle(`${id}.webp`);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
      } catch {
        // Fallback to IndexedDB
      }
    }

    const db = await this.openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readonly');
      const req = tx.objectStore('snapshots').get(id);
      req.onsuccess = () => {
        const record = req.result as StoredSnapshot | undefined;
        resolve(record?.dataUrl);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Automated LRU Purge: deletes unpinned snapshots older than maxAgeMs (default 7 days).
   */
  async purgeOldSnapshots(pinnedIds: Set<string>, maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    let purgedCount = 0;

    const db = await this.openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const snapshot = cursor.value as StoredSnapshot;
          if (snapshot.timestamp < cutoff && !pinnedIds.has(snapshot.id)) {
            cursor.delete();
            purgedCount++;
          }
          cursor.continue();
        } else {
          resolve(purgedCount);
        }
      };
      req.onerror = () => reject(tx.error);
    });
  }

  private openIdb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('meridian-db', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const snapshotStore = new SnapshotStore();
