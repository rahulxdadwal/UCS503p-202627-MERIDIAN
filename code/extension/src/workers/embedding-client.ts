import type { EmbeddingRequest, EmbeddingResponse, EmbeddingResult } from '../shared/contracts';

export class EmbeddingClient {
  private readonly worker = new Worker(new URL('./embedding.worker.ts', import.meta.url), { type: 'module' });
  private readonly pending = new Map<string, {
    resolve: (result: EmbeddingResult) => void;
    reject: (reason: Error) => void;
    progress?: (message: string) => void;
  }>();
  private disposed = false;

  constructor() {
    this.worker.onmessage = ({ data }: MessageEvent<EmbeddingResponse>) => {
      const request = this.pending.get(data.id);
      if (!request) return;
      if (data.type === 'progress') { request.progress?.(data.message); return; }
      this.pending.delete(data.id);
      if (data.type === 'result') request.resolve(data.result);
      else request.reject(new Error(data.message));
    };
    this.worker.onerror = () => this.fail(new Error('Embedding worker failed. Check packaged assets and reload Meridian.'));
    this.worker.onmessageerror = () => this.fail(new Error('Embedding worker response could not be read.'));
  }

  embed(text: string, progress?: (message: string) => void): Promise<EmbeddingResult> {
    if (this.disposed) return Promise.reject(new Error('Embedding client is closed.'));
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, progress });
      this.worker.postMessage({ type: 'embed', id, text } satisfies EmbeddingRequest);
    });
  }

  private fail(error: Error) {
    for (const request of this.pending.values()) request.reject(error);
    this.pending.clear();
    this.disposed = true;
    this.worker.terminate();
  }

  dispose() { this.fail(new Error('Embedding client was closed.')); }
}
