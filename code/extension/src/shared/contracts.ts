/** Shared integration surface. Coordinate changes with the foundation owner. */
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2' as const;
export const EMBEDDING_DIMENSIONS = 384 as const;
export const MAX_INPUT_CHARACTERS = 12_000;

export interface ExtractedDocument {
  id: string;
  sourceType: 'webpage' | 'pdf' | 'markdown' | 'snippet';
  title: string;
  sourceUrl?: string;
  text: string;
  blocks: Array<{
    kind: 'paragraph' | 'heading' | 'code' | 'table';
    text: string;
    heading?: string;
    page?: number;
    language?: string;
  }>;
}

export interface CanvasItem {
  id: string;
  title: string;
  sourceType: ExtractedDocument['sourceType'];
  sourceUrl?: string;
  excerpt: string;
  position: { x: number; y: number };
  pinned: boolean;
  status: 'queued' | 'indexing' | 'ready' | 'failed';
}

export interface EmbeddingResult {
  model: typeof EMBEDDING_MODEL;
  dimensions: typeof EMBEDDING_DIMENSIONS;
  backend: 'wasm';
  vector: Float32Array;
  elapsedMs: number;
}

export type EmbeddingRequest = { type: 'embed'; id: string; text: string };
export type EmbeddingResponse =
  | { type: 'progress'; id: string; message: string }
  | { type: 'result'; id: string; result: EmbeddingResult }
  | { type: 'error'; id: string; message: string };
