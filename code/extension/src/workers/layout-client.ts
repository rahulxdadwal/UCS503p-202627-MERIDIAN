import type { LayoutOptions } from '../layout/umap';
import type { LayoutWorkerRequest, LayoutWorkerResponse } from './layout.worker';

export class LayoutClient {
  private worker: Worker | null = null;
  private pending = new Map<string, {
    resolve: (positions: Record<string, { x: number; y: number }>) => void;
    reject: (error: Error) => void;
  }>();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./layout.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (event: MessageEvent<LayoutWorkerResponse>) => {
        const { id, positions } = event.data;
        const request = this.pending.get(id);
        if (request) {
          this.pending.delete(id);
          request.resolve(positions);
        }
      };
      this.worker.onerror = (err) => {
        for (const req of this.pending.values()) {
          req.reject(new Error(err.message || 'Layout worker error'));
        }
        this.pending.clear();
      };
    }
    return this.worker;
  }

  computeLayout(
    items: Array<{
      id: string;
      vector: Float32Array;
      pinned?: boolean;
      position?: { x: number; y: number };
    }>,
    options?: LayoutOptions
  ): Promise<Record<string, { x: number; y: number }>> {
    const id = crypto.randomUUID();
    const worker = this.getWorker();

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      // Transfer vectors as Float32Array
      const payload: LayoutWorkerRequest = {
        id,
        items: items.map((it) => ({
          id: it.id,
          vector: Array.from(it.vector),
          pinned: it.pinned,
          position: it.position,
        })),
        options,
      };

      worker.postMessage(payload);
    });
  }

  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pending.clear();
  }
}

export const layoutClient = new LayoutClient();
