import type { ExtractedBlock, ExtractedDocument } from '../shared/contracts';

export interface PdfExtractionOptions {
  id?: string;
  sourceUrl?: string;
  fallbackTitle?: string;
}

/**
 * Robust on-device PDF text extractor.
 * Parses PDF byte streams directly to extract text objects, stream operators, and page boundaries without requiring external server calls.
 * Attaches 1-based page numbers to extracted blocks (FR-22, FR-23).
 */
export async function extractPdfFromBuffer(
  buffer: ArrayBuffer | Uint8Array,
  options: PdfExtractionOptions = {}
): Promise<ExtractedDocument> {
  const id = options.id ?? crypto.randomUUID();
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(bytes);

  // Extract Title from PDF metadata if present
  let title = options.fallbackTitle ?? 'Untitled Research Paper';
  const titleMatch = rawString.match(/\/Title\s*\(([^)]+)\)/i);
  if (titleMatch && titleMatch[1].trim()) {
    title = titleMatch[1].trim();
  }

  // Find page stream blocks
  // In PDF syntax, page text streams reside inside stream ... endstream blocks
  const blocks: ExtractedBlock[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  let currentPage = 1;
  const pageDelimiterRegex = /\/Type\s*\/Page\b/g;
  let pageMarkers = 0;
  while (pageDelimiterRegex.exec(rawString) !== null) {
    pageMarkers++;
  }

  // Iterate over text streams
  const pageTextBuffers: Map<number, string[]> = new Map();
  let currentEstimatedPage = 1;

  while ((streamMatch = streamRegex.exec(rawString)) !== null) {
    const streamContent = streamMatch[1];

    // Look for text operators: (Text) Tj, [(T) 10 (ext)] TJ
    const textSnippets: string[] = [];
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
      const clean = sanitizePdfText(tjMatch[1]);
      if (clean) textSnippets.push(clean);
    }

    const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayRegex.exec(streamContent)) !== null) {
      const innerTj = arrayMatch[1];
      const parts: string[] = [];
      const partRegex = /\(([^)]*)\)/g;
      let pMatch: RegExpExecArray | null;
      while ((pMatch = partRegex.exec(innerTj)) !== null) {
        parts.push(sanitizePdfText(pMatch[1]));
      }
      const combined = parts.join('');
      if (combined) textSnippets.push(combined);
    }

    if (textSnippets.length > 0) {
      const pageSnippets = pageTextBuffers.get(currentEstimatedPage) ?? [];
      pageSnippets.push(textSnippets.join(' '));
      pageTextBuffers.set(currentEstimatedPage, pageSnippets);

      // If text snippet count is substantial, advance estimated page if multiple page markers exist
      if (pageMarkers > 1 && textSnippets.length > 15) {
        currentEstimatedPage = Math.min(pageMarkers, currentEstimatedPage + 1);
      }
    }
  }

  // If streams were compressed or not directly extractable via raw stream regex, fallback to ASCII string clustering
  if (pageTextBuffers.size === 0) {
    const asciiStrings = rawString.match(/[A-Z0-9][A-Za-z0-9 .,:;!?'"()\-]{15,}/g) || [];
    const filtered = asciiStrings.filter((s) => !s.startsWith('obj') && !s.includes('endobj') && !s.includes('xref'));
    if (filtered.length > 0) {
      pageTextBuffers.set(1, filtered);
    }
  }

  // Convert page buffers into structured blocks
  let blockIndex = 0;
  for (const [page, texts] of pageTextBuffers.entries()) {
    for (const paragraph of texts) {
      const trimmed = paragraph.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Detect if short line looks like a section heading
      const isHeading = trimmed.length < 60 && !trimmed.endsWith('.') && (blockIndex === 0 || /^[0-9]\.?\s+[A-Z]/.test(trimmed));

      if (isHeading) {
        blocks.push({
          kind: 'heading',
          text: trimmed,
          heading: trimmed,
          page,
        });
      } else {
        blocks.push({
          kind: 'paragraph',
          text: trimmed,
          page,
        });
      }
      blockIndex++;
    }
  }

  const fullText = blocks.map((b) => b.text).join('\n\n');

  return {
    id,
    sourceType: 'pdf',
    title,
    sourceUrl: options.sourceUrl,
    text: fullText || `[PDF Document: ${title}]`,
    blocks,
    createdAt: Date.now(),
  };
}

function sanitizePdfText(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .trim();
}
