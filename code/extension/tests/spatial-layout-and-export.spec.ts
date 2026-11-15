import { test, expect } from '@playwright/test';
import { compute2DSpatialLayout } from '../src/layout/umap';
import { extractPdfFromBuffer } from '../src/extraction/pdf';

test('Unit: compute2DSpatialLayout projects embeddings and resolves collisions', async () => {
  const dim = 384;
  // Create 3 vectors: vector 0 and 1 are semantically close, vector 2 is orthogonal/distant
  const v0 = new Float32Array(dim);
  const v1 = new Float32Array(dim);
  const v2 = new Float32Array(dim);

  for (let i = 0; i < dim; i++) {
    v0[i] = Math.sin(i * 0.1);
    v1[i] = Math.sin(i * 0.1) + (Math.random() * 0.05); // Very close to v0
    v2[i] = Math.cos(i * 0.1); // Orthogonal / distant
  }

  // Normalize
  const norm0 = Math.hypot(...v0);
  const norm1 = Math.hypot(...v1);
  const norm2 = Math.hypot(...v2);
  for (let i = 0; i < dim; i++) {
    v0[i] /= norm0;
    v1[i] /= norm1;
    v2[i] /= norm2;
  }

  const items = [
    { id: 'item-0', vector: v0 },
    { id: 'item-1', vector: v1 },
    { id: 'item-2', vector: v2 },
  ];

  const positions = compute2DSpatialLayout(items, {
    canvasWidth: 1000,
    canvasHeight: 800,
    iterations: 60,
    minCardDistance: 160,
  });

  expect(positions.size).toBe(3);
  const p0 = positions.get('item-0')!;
  const p1 = positions.get('item-1')!;
  const p2 = positions.get('item-2')!;

  expect(p0).toBeDefined();
  expect(p1).toBeDefined();
  expect(p2).toBeDefined();

  // Cards must satisfy collision distance constraint (minCardDistance)
  const dist01 = Math.hypot(p0.x - p1.x, p0.y - p1.y);
  const dist02 = Math.hypot(p0.x - p2.x, p0.y - p2.y);
  const dist12 = Math.hypot(p1.x - p2.x, p1.y - p2.y);

  expect(dist01).toBeGreaterThanOrEqual(130);
  expect(dist02).toBeGreaterThanOrEqual(130);
  expect(dist12).toBeGreaterThanOrEqual(130);
});

test('Unit: PDF parser extracts text streams and identifies page numbers', async () => {
  // Construct a minimal valid PDF-like byte buffer with text streams
  const pdfString = `%PDF-1.4
1 0 obj
<< /Title (Deep Residual Learning for Image Recognition) >>
endobj
2 0 obj
<< /Type /Page >>
endobj
stream
(1. Introduction) Tj
(Deep convolutional neural networks have achieved breakthrough performance.) Tj
endstream
3 0 obj
<< /Type /Page >>
endobj
stream
(2. Deep Residual Architecture) Tj
(We address the degradation problem by introducing a deep residual learning framework.) Tj
endstream
%%EOF`;

  const buffer = new TextEncoder().encode(pdfString);
  const doc = await extractPdfFromBuffer(buffer, { fallbackTitle: 'ResNet Paper' });

  expect(doc.sourceType).toBe('pdf');
  expect(doc.title).toBe('Deep Residual Learning for Image Recognition');
  expect(doc.blocks.length).toBeGreaterThanOrEqual(2);

  // Check that page numbers were identified
  const hasPageNumber = doc.blocks.some((b) => typeof b.page === 'number' && b.page >= 1);
  expect(hasPageNumber).toBe(true);
});
