import { db } from '../storage/db';
import type { CanvasItem, DocumentChunk, ExtractedDocument, QuantizedVector } from '../shared/contracts';

export interface MeridianWorkspaceBundle {
  schemaVersion: '1.0.0';
  exportedAt: number;
  generator: string;
  documents: ExtractedDocument[];
  chunks: DocumentChunk[];
  canvasItems: CanvasItem[];
  embeddings: QuantizedVector[];
}

/**
 * Serializes the complete local workspace into a versioned JSON bundle.
 */
export async function exportWorkspaceJson(): Promise<string> {
  const [documents, canvasItems, embeddings] = await Promise.all([
    db.listDocuments(),
    db.listCanvasItems(),
    db.listQuantizedVectors(),
  ]);

  const allChunks: DocumentChunk[] = [];
  for (const doc of documents) {
    const chunks = await db.getChunksByDocumentId(doc.id);
    allChunks.push(...chunks);
  }

  const bundle: MeridianWorkspaceBundle = {
    schemaVersion: '1.0.0',
    exportedAt: Date.now(),
    generator: 'Meridian Latent Cartographer v0.2.0',
    documents,
    chunks: allChunks,
    canvasItems,
    embeddings,
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  downloadFile(jsonStr, `meridian-workspace-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  return jsonStr;
}

/**
 * Restores a workspace JSON bundle into the local database with full coordinate and vector fidelity.
 */
export async function importWorkspaceJson(rawJson: string): Promise<{
  documentsRestored: number;
  itemsRestored: number;
  embeddingsRestored: number;
}> {
  const bundle = JSON.parse(rawJson) as Partial<MeridianWorkspaceBundle>;
  if (!bundle.schemaVersion || !Array.isArray(bundle.documents) || !Array.isArray(bundle.canvasItems)) {
    throw new Error('Invalid Meridian workspace bundle format.');
  }

  for (const doc of bundle.documents) {
    await db.saveDocument(doc);
  }

  if (Array.isArray(bundle.chunks)) {
    await db.saveChunks(bundle.chunks);
  }

  for (const item of bundle.canvasItems) {
    await db.saveCanvasItem(item);
  }

  if (Array.isArray(bundle.embeddings)) {
    for (const emb of bundle.embeddings) {
      await db.saveQuantizedVector(emb);
    }
  }

  return {
    documentsRestored: bundle.documents.length,
    itemsRestored: bundle.canvasItems.length,
    embeddingsRestored: bundle.embeddings?.length ?? 0,
  };
}

/**
 * Generates a self-contained, standalone HTML file that can be opened in any web browser without server dependencies.
 */
export async function exportStandaloneHtml(): Promise<string> {
  const [documents, canvasItems] = await Promise.all([
    db.listDocuments(),
    db.listCanvasItems(),
  ]);

  const dataPayload = JSON.stringify({ documents, canvasItems });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Meridian Spatial Workspace — Standalone Archive</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #f4f6f3; color: #172a29; }
    header { background: #1b4332; color: #ffffff; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 20px; }
    .badge { background: #52b788; color: #1b4332; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    #canvas-container { position: relative; width: 100vw; height: calc(100vh - 65px); overflow: auto; background: #ffffff; }
    .card { position: absolute; width: 220px; min-height: 100px; padding: 12px; background: #ffffff; border: 1px solid #cde0d5; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); font-size: 13px; }
    .card-title { font-weight: bold; margin-bottom: 6px; font-size: 14px; }
    .card-meta { font-size: 11px; color: #51635e; margin-bottom: 8px; }
    .card-excerpt { font-size: 12px; color: #3a4a45; line-height: 1.4; }
  </style>
</head>
<body>
  <header>
    <h1>🧭 Meridian Spatial Archive</h1>
    <span class="badge">\${canvasItems.length} Artifacts Indexed</span>
  </header>
  <div id="canvas-container"></div>
  <script>
    const data = ${dataPayload};
    const container = document.getElementById('canvas-container');
    data.canvasItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'card';
      el.style.left = (item.position.x + 40) + 'px';
      el.style.top = (item.position.y + 40) + 'px';
      el.innerHTML = '<div class="card-title">' + (item.title || 'Untitled') + '</div>' +
                     '<div class="card-meta">' + (item.sourceType || 'note').toUpperCase() + (item.pinned ? ' · 📌 Pinned' : '') + '</div>' +
                     '<div class="card-excerpt">' + (item.excerpt || '') + '</div>';
      container.appendChild(el);
    });
  </script>
</body>
</html>`;

  downloadFile(html, `meridian-archive-${new Date().toISOString().slice(0, 10)}.html`, 'text/html');
  return html;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
