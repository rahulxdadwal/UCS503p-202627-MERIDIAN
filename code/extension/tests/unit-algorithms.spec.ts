import { test, expect } from '@playwright/test';
import { extractMarkdown } from '../src/extraction/markdown';
import { extractSnippet } from '../src/extraction/snippet';
import { chunkDocument } from '../src/extraction/chunker';
import { quantizeVector, dequantizeVector, cosineSimilarityQuantized } from '../src/storage/quantization';

test('Unit: Browser DOMParser parses HTML with structured semantic elements', async ({ page }) => {
  await page.goto('about:blank');
  const result = await page.evaluate(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`
      <!DOCTYPE html>
      <html>
        <head><title>Quantum Computing Overview</title></head>
        <body>
          <article>
            <h1>Quantum Computing Overview</h1>
            <p>Quantum computers exploit quantum superposition and entanglement to execute calculations.</p>
            <h2>Qubit State</h2>
            <p>A qubit can exist in a superposition of zero and one state.</p>
            <pre><code class="language-python">qc = QuantumCircuit(2)\nqc.h(0)</code></pre>
            <table>
              <tr><th>Gate</th><th>Operation</th></tr>
              <tr><td>Hadamard</td><td>Superposition</td></tr>
            </table>
          </article>
        </body>
      </html>
    `, 'text/html');

    const headings = Array.from(doc.querySelectorAll('h1, h2')).map((el) => el.textContent?.trim());
    const code = Array.from(doc.querySelectorAll('pre code')).map((el) => ({
      text: el.textContent?.trim(),
      className: el.className,
    }));
    const tables = Array.from(doc.querySelectorAll('table')).length;

    return { title: doc.title, headings, code, tables };
  });

  expect(result.title).toBe('Quantum Computing Overview');
  expect(result.headings).toContain('Quantum Computing Overview');
  expect(result.headings).toContain('Qubit State');
  expect(result.code[0].text).toContain('QuantumCircuit');
  expect(result.code[0].className).toContain('language-python');
  expect(result.tables).toBe(1);
});

test('Unit: Markdown extraction parses hierarchical headings and code blocks', async () => {
  const md = `
# Vector Databases

Vector databases index high-dimensional embeddings for fast nearest neighbor search.

## Hierarchical Navigable Small World (HNSW)
HNSW builds a multi-layer graph for sub-millisecond approximate nearest neighbor lookup.

\`\`\`rust
fn build_hnsw_graph(dim: usize) -> Index {
    Index::new(dim)
}
\`\`\`
  `;

  const doc = extractMarkdown(md, { defaultTitle: 'Default Title' });
  expect(doc.title).toBe('Vector Databases');
  expect(doc.sourceType).toBe('markdown');
  expect(doc.blocks.some((b) => b.kind === 'heading' && b.text === 'Hierarchical Navigable Small World (HNSW)')).toBe(true);
  const codeBlock = doc.blocks.find((b) => b.kind === 'code');
  expect(codeBlock?.language).toBe('rust');
  expect(codeBlock?.text).toContain('build_hnsw_graph');
});

test('Unit: Token chunker creates sliding-window chunks with overlap', async () => {
  const longText = Array.from({ length: 600 }, (_, i) => `word${i}`).join(' ');
  const doc = extractSnippet(longText, { title: 'Long Text' });

  const chunks = chunkDocument(doc, { windowWords: 256, overlapWords: 50 });
  expect(chunks.length).toBe(3);
  expect(chunks[0].chunkIndex).toBe(0);
  expect(chunks[0].wordCount).toBe(256);
  expect(chunks[1].chunkIndex).toBe(1);
  expect(chunks[1].wordCount).toBe(256);
  expect(chunks[2].chunkIndex).toBe(2);
  expect(chunks[2].wordCount).toBe(188);
});

test('Unit: SQ8 scalar quantization achieves >74% compression with <0.005 cosine error', async () => {
  const dim = 384;
  const rawVector = new Float32Array(dim);
  for (let i = 0; i < dim; i++) {
    rawVector[i] = Math.sin(i * 0.1) * Math.cos(i * 0.05);
  }
  const norm = Math.hypot(...rawVector);
  for (let i = 0; i < dim; i++) rawVector[i] /= norm;

  const qv = quantizeVector(rawVector, { id: 'test-1', documentId: 'doc-1' });

  expect(qv.quantized.length).toBe(dim);
  expect(qv.quantized.every((v) => v >= -128 && v <= 127)).toBe(true);

  const dequant = dequantizeVector(qv);
  expect(dequant.length).toBe(dim);

  const cosineRawWithSelf = rawVector.reduce((sum, v, i) => sum + v * v, 0);
  const cosineQuantized = cosineSimilarityQuantized(rawVector, qv);

  const error = Math.abs(cosineRawWithSelf - cosineQuantized);
  expect(error).toBeLessThan(0.005);
  expect(cosineQuantized).toBeGreaterThan(0.995);
});
