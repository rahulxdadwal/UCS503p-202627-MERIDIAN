import type { ExtractedBlock, ExtractedDocument } from '../shared/contracts';

export interface MarkdownExtractionOptions {
  id?: string;
  sourceUrl?: string;
  defaultTitle?: string;
}

/**
 * Pure extraction helper for Markdown documents.
 * Preserves hierarchical headings, fenced code blocks with language indicators, tables, and paragraphs.
 */
export function extractMarkdown(
  rawMarkdown: string,
  options: MarkdownExtractionOptions = {}
): ExtractedDocument {
  const id = options.id ?? crypto.randomUUID();
  const lines = rawMarkdown.split(/\r?\n/);
  const blocks: ExtractedBlock[] = [];

  let title = options.defaultTitle ?? 'Untitled Markdown Document';
  let titleFound = false;
  let currentHeading = '';

  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  let inTable = false;
  let tableLines: string[] = [];

  let paragraphLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(' ').trim();
      if (text) {
        blocks.push({
          kind: 'paragraph',
          text,
          heading: currentHeading || undefined,
        });
      }
      paragraphLines = [];
    }
  }

  function flushTable() {
    if (tableLines.length > 0) {
      blocks.push({
        kind: 'table',
        text: tableLines.join('\n'),
        heading: currentHeading || undefined,
      });
      tableLines = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced Code Block handling
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        flushTable();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
        codeLines = [];
      } else {
        blocks.push({
          kind: 'code',
          text: codeLines.join('\n'),
          heading: currentHeading || undefined,
          language: codeLanguage || undefined,
        });
        inCodeBlock = false;
        codeLines = [];
        codeLanguage = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      // Skip pure markdown delimiter rows like |---|---|
      if (!/^\|[\s\-:|]+\|$/.test(trimmed)) {
        tableLines.push(trimmed);
      }
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Heading detection (# Heading)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushTable();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      if (!titleFound && level === 1) {
        title = headingText;
        titleFound = true;
      }
      currentHeading = headingText;
      blocks.push({
        kind: 'heading',
        text: headingText,
        heading: currentHeading,
      });
      continue;
    }

    // Blank line indicates paragraph boundary
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    paragraphLines.push(trimmed);
  }

  // Flush remaining buffers
  flushParagraph();
  flushTable();
  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({
      kind: 'code',
      text: codeLines.join('\n'),
      heading: currentHeading || undefined,
      language: codeLanguage || undefined,
    });
  }

  const fullText = blocks.map((b) => b.text).join('\n\n');

  return {
    id,
    sourceType: 'markdown',
    title,
    sourceUrl: options.sourceUrl,
    text: fullText,
    blocks,
    createdAt: Date.now(),
  };
}
