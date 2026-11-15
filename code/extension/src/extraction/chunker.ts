import type { DocumentChunk, ExtractedDocument } from '../shared/contracts';

export interface ChunkingOptions {
  windowWords?: number; // Default 256
  overlapWords?: number; // Default 50
}

/**
 * Splits an ExtractedDocument into overlapping sliding-window chunks for fine-grained semantic retrieval.
 * Respects block boundaries (headings, code blocks, paragraphs) where possible.
 */
export function chunkDocument(
  doc: ExtractedDocument,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const windowWords = options.windowWords ?? 256;
  const overlapWords = options.overlapWords ?? 50;
  const chunks: DocumentChunk[] = [];

  let chunkIndex = 0;

  // Process block-by-block to preserve semantic boundaries
  for (const block of doc.blocks) {
    const words = block.text.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    // If block fits within one window
    if (words.length <= windowWords) {
      chunks.push({
        id: `${doc.id}-chk-${chunkIndex++}`,
        documentId: doc.id,
        chunkIndex: chunkIndex - 1,
        text: block.text,
        heading: block.heading,
        page: block.page,
        wordCount: words.length,
      });
      continue;
    }

    // Otherwise apply sliding-window with overlap
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + windowWords, words.length);
      const chunkWords = words.slice(start, end);
      const chunkText = chunkWords.join(' ');

      chunks.push({
        id: `${doc.id}-chk-${chunkIndex++}`,
        documentId: doc.id,
        chunkIndex: chunkIndex - 1,
        text: chunkText,
        heading: block.heading,
        page: block.page,
        wordCount: chunkWords.length,
      });

      if (end >= words.length) break;
      start += Math.max(1, windowWords - overlapWords);
    }
  }

  // Fallback if no blocks produced chunks
  if (chunks.length === 0 && doc.text.trim()) {
    const words = doc.text.split(/\s+/).filter(Boolean);
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + windowWords, words.length);
      const chunkWords = words.slice(start, end);

      chunks.push({
        id: `${doc.id}-chk-${chunkIndex++}`,
        documentId: doc.id,
        chunkIndex: chunkIndex - 1,
        text: chunkWords.join(' '),
        wordCount: chunkWords.length,
      });

      if (end >= words.length) break;
      start += Math.max(1, windowWords - overlapWords);
    }
  }

  return chunks;
}
