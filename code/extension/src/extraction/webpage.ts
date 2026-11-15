import { Readability } from '@mozilla/readability';
import type { ExtractedBlock, ExtractedDocument } from '../shared/contracts';

export interface WebpageExtractionOptions {
  id?: string;
  url?: string;
  fallbackTitle?: string;
}

/**
 * Extracts structured document content from raw HTML using Readability and DOM traversal.
 * Pure helper function: operates on HTML strings or DOM documents without Chrome API dependencies.
 */
export function extractWebpageFromHtml(
  html: string,
  options: WebpageExtractionOptions = {}
): ExtractedDocument {
  const id = options.id ?? crypto.randomUUID();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return extractWebpageFromDocument(doc, { ...options, id });
}

/**
 * Extracts structured document content directly from a DOM Document.
 */
export function extractWebpageFromDocument(
  doc: Document,
  options: WebpageExtractionOptions = {}
): ExtractedDocument {
  const id = options.id ?? crypto.randomUUID();
  const url = options.url ?? doc.location?.href ?? '';
  const fallbackTitle = options.fallbackTitle ?? doc.title ?? 'Untitled Webpage';

  // Clone document to avoid mutating the active live page
  const clonedDoc = doc.cloneNode(true) as Document;

  // Remove common non-content noise elements before processing
  const noiseSelectors = ['script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'nav', 'footer'];
  clonedDoc.querySelectorAll(noiseSelectors.join(',')).forEach((el) => el.remove());

  let articleTitle = fallbackTitle;
  let articleContentElement: Element | null = null;
  let articleText = '';

  try {
    const reader = new Readability(clonedDoc, { keepClasses: true });
    const parsed = reader.parse();
    if (parsed) {
      if (parsed.title) articleTitle = parsed.title;
      if (parsed.textContent) articleText = parsed.textContent.trim();
      if (parsed.content) {
        const contentDoc = new DOMParser().parseFromString(parsed.content, 'text/html');
        articleContentElement = contentDoc.body;
      }
    }
  } catch {
    // Readability fallback below
  }

  // Fallback extraction if Readability produced nothing
  if (!articleContentElement) {
    articleContentElement = clonedDoc.body;
    if (!articleText) {
      articleText = clonedDoc.body.textContent?.trim() ?? '';
    }
  }

  // Extract structured semantic blocks in document order
  const blocks: ExtractedBlock[] = [];
  let currentHeading = '';

  function processNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tagName)) {
      const headingText = el.textContent?.trim() ?? '';
      if (headingText) {
        currentHeading = headingText;
        blocks.push({
          kind: 'heading',
          text: headingText,
          heading: currentHeading,
        });
      }
      return;
    }

    if (tagName === 'pre') {
      const codeEl = el.querySelector('code') ?? el;
      const codeText = codeEl.textContent?.trim() ?? '';
      if (codeText) {
        const classNames = codeEl.className || el.className || '';
        const langMatch = classNames.match(/(?:language-|lang-)(\w+)/i);
        const language = langMatch ? langMatch[1] : undefined;
        blocks.push({
          kind: 'code',
          text: codeText,
          heading: currentHeading || undefined,
          language,
        });
      }
      return;
    }

    if (tagName === 'table') {
      const rows = Array.from(el.querySelectorAll('tr')).map((tr) =>
        Array.from(tr.querySelectorAll('th, td'))
          .map((cell) => cell.textContent?.trim() ?? '')
          .join(' | ')
      ).filter(Boolean);

      if (rows.length > 0) {
        blocks.push({
          kind: 'table',
          text: rows.join('\n'),
          heading: currentHeading || undefined,
        });
      }
      return;
    }

    if (tagName === 'p' || tagName === 'blockquote' || tagName === 'li') {
      const paraText = el.textContent?.trim() ?? '';
      if (paraText.length > 10) {
        blocks.push({
          kind: 'paragraph',
          text: paraText,
          heading: currentHeading || undefined,
        });
      }
      return;
    }

    // Traverse children for container elements (div, section, article, etc.)
    for (const child of Array.from(el.childNodes)) {
      processNode(child);
    }
  }

  if (articleContentElement) {
    for (const child of Array.from(articleContentElement.childNodes)) {
      processNode(child);
    }
  }

  // If no structured blocks were detected, wrap whole text in paragraph block
  if (blocks.length === 0 && articleText) {
    blocks.push({
      kind: 'paragraph',
      text: articleText,
    });
  }

  return {
    id,
    sourceType: 'webpage',
    title: articleTitle,
    sourceUrl: url || undefined,
    text: articleText || blocks.map((b) => b.text).join('\n\n'),
    blocks,
    createdAt: Date.now(),
  };
}
