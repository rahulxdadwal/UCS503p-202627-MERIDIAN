/** Shared integration surface. Coordinate changes with the foundation owner. */
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2' as const;
export const EMBEDDING_DIMENSIONS = 384 as const;
export const MAX_INPUT_CHARACTERS = 12_000;

export interface ExtractedBlock {
  kind: 'paragraph' | 'heading' | 'code' | 'table';
  text: string;
  heading?: string;
  page?: number;
  language?: string;
}

export interface ExtractedDocument {
  id: string;
  sourceType: 'webpage' | 'pdf' | 'markdown' | 'snippet';
  title: string;
  sourceUrl?: string;
  text: string;
  blocks: ExtractedBlock[];
  createdAt?: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  heading?: string;
  page?: number;
  wordCount: number;
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
  createdAt?: number;
}

export interface QuantizedVector {
  id: string;
  documentId: string;
  chunkId?: string;
  dimensions: number;
  scale: number;
  min: number;
  quantized: number[]; // Serialized Int8 representation for cross-boundary IDB persistence
}

export interface StoredSnapshot {
  id: string;
  dataUrl: string;
  mimeType: string;
  timestamp: number;
}

export interface SearchResult {
  documentId: string;
  title: string;
  sourceUrl?: string;
  sourceType: ExtractedDocument['sourceType'];
  score: number;
  bestChunkText?: string;
  heading?: string;
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

export type ExtensionMessage =
  | { type: 'capture-active-tab'; mode?: 'lightweight' | 'deep' }
  | { type: 'capture-active-tab-result'; success: boolean; document?: ExtractedDocument; snapshotUrl?: string; error?: string };
