import type { ExtractedDocument } from '../shared/contracts';

export interface SnippetExtractionOptions {
  id?: string;
  title?: string;
  language?: string;
}

/**
 * Creates an ExtractedDocument from a standalone code snippet or text fragment.
 */
export function extractSnippet(
  content: string,
  options: SnippetExtractionOptions = {}
): ExtractedDocument {
  const id = options.id ?? crypto.randomUUID();
  const title = options.title ?? (options.language ? `${options.language} Snippet` : 'Code Snippet');
  const language = options.language ?? 'plaintext';

  return {
    id,
    sourceType: 'snippet',
    title,
    text: content,
    blocks: [
      {
        kind: 'code',
        text: content,
        language,
      },
    ],
    createdAt: Date.now(),
  };
}
