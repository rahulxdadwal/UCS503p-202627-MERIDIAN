import type {
  CanvasItem,
  DocumentChunk,
  ExtractedDocument,
  QuantizedVector,
  StoredSnapshot,
} from '../shared/contracts';

const DB_NAME = 'meridian-db';
const DB_VERSION = 1;

export class MeridianDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        // Documents Object Store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('sourceUrl', 'sourceUrl', { unique: false });
          docStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Chunks Object Store
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('documentId', 'documentId', { unique: false });
        }

        // Canvas Items Object Store
        if (!db.objectStoreNames.contains('canvas_items')) {
          const canvasStore = db.createObjectStore('canvas_items', { keyPath: 'id' });
          canvasStore.createIndex('status', 'status', { unique: false });
          canvasStore.createIndex('sourceUrl', 'sourceUrl', { unique: false });
        }

        // Quantized Embeddings Object Store
        if (!db.objectStoreNames.contains('embeddings')) {
          const embStore = db.createObjectStore('embeddings', { keyPath: 'id' });
          embStore.createIndex('documentId', 'documentId', { unique: false });
        }

        // Snapshots / Thumbnails Object Store
        if (!db.objectStoreNames.contains('snapshots')) {
          const snapStore = db.createObjectStore('snapshots', { keyPath: 'id' });
          snapStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Document Operations ---

  async saveDocument(doc: ExtractedDocument): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite');
      tx.objectStore('documents').put(doc);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getDocument(id: string): Promise<ExtractedDocument | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readonly');
      const req = tx.objectStore('documents').get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async findDocumentByUrl(url: string): Promise<ExtractedDocument | undefined> {
    if (!url) return undefined;
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readonly');
      const index = tx.objectStore('documents').index('sourceUrl');
      const req = index.get(url);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async listDocuments(): Promise<ExtractedDocument[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readonly');
      const req = tx.objectStore('documents').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['documents', 'chunks', 'canvas_items', 'embeddings', 'snapshots'],
        'readwrite'
      );
      tx.objectStore('documents').delete(id);
      tx.objectStore('canvas_items').delete(id);
      tx.objectStore('snapshots').delete(id);

      // Delete associated chunks
      const chunkStore = tx.objectStore('chunks');
      const chunkIndex = chunkStore.index('documentId');
      const chunkReq = chunkIndex.getAllKeys(id);
      chunkReq.onsuccess = () => {
        for (const key of chunkReq.result) {
          chunkStore.delete(key);
        }
      };

      // Delete associated embeddings
      const embStore = tx.objectStore('embeddings');
      const embIndex = embStore.index('documentId');
      const embReq = embIndex.getAllKeys(id);
      embReq.onsuccess = () => {
        for (const key of embReq.result) {
          embStore.delete(key);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Chunks Operations ---

  async saveChunks(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('chunks', 'readwrite');
      const store = tx.objectStore('chunks');
      for (const chunk of chunks) {
        store.put(chunk);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getChunksByDocumentId(documentId: string): Promise<DocumentChunk[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('chunks', 'readonly');
      const index = tx.objectStore('chunks').index('documentId');
      const req = index.getAll(documentId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Canvas Items Operations ---

  async saveCanvasItem(item: CanvasItem): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('canvas_items', 'readwrite');
      tx.objectStore('canvas_items').put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listCanvasItems(): Promise<CanvasItem[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('canvas_items', 'readonly');
      const req = tx.objectStore('canvas_items').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async updateCanvasItem(id: string, updates: Partial<CanvasItem>): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('canvas_items', 'readwrite');
      const store = tx.objectStore('canvas_items');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (!getReq.result) {
          resolve();
          return;
        }
        const updated = { ...getReq.result, ...updates };
        store.put(updated);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Quantized Embeddings Operations ---

  async saveQuantizedVector(qv: QuantizedVector): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('embeddings', 'readwrite');
      tx.objectStore('embeddings').put(qv);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listQuantizedVectors(): Promise<QuantizedVector[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('embeddings', 'readonly');
      const req = tx.objectStore('embeddings').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Storage Metrics ---

  async getStorageStats(): Promise<{
    documentsCount: number;
    canvasItemsCount: number;
    embeddingsCount: number;
    estimatedSavedBytes: number;
  }> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['documents', 'canvas_items', 'embeddings'], 'readonly');
      const docCountReq = tx.objectStore('documents').count();
      const canvasCountReq = tx.objectStore('canvas_items').count();
      const embCountReq = tx.objectStore('embeddings').count();

      tx.oncomplete = () => {
        const embCount = embCountReq.result;
        // Each raw float32 vector is 384 * 4 = 1536 bytes.
        // SQ8 is 384 * 1 + 8 = 392 bytes.
        // Saved per vector = 1536 - 392 = 1144 bytes (~74.5%).
        const estimatedSavedBytes = embCount * 1144;
        resolve({
          documentsCount: docCountReq.result,
          canvasItemsCount: canvasCountReq.result,
          embeddingsCount: embCount,
          estimatedSavedBytes,
        });
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new MeridianDatabase();
