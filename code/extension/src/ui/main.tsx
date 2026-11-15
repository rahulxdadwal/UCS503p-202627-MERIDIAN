import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EmbeddingClient } from '../workers/embedding-client';
import { layoutClient } from '../workers/layout-client';
import {
  MAX_INPUT_CHARACTERS,
  type CanvasItem,
  type EmbeddingResult,
  type ExtractedDocument,
  type SearchResult,
} from '../shared/contracts';
import {
  extractMarkdown,
  extractPdfFromBuffer,
  extractSnippet,
  extractWebpageFromHtml,
  chunkDocument,
} from '../extraction';
import { db, dequantizeVector, quantizeVector, snapshotStore } from '../storage';
import { searchEngine } from '../search';
import { exportStandaloneHtml, exportWorkspaceJson, importWorkspaceJson } from '../export/workspace';
import { SpatialCanvas } from './SpatialCanvas';
import { PassageInspector } from './PassageInspector';
import './styles.css';

export function App() {
  const client = useRef<EmbeddingClient | null>(null);

  // Diagnostic State (Milestone 1 test compliance)
  const [text, setText] = useState('Meridian organizes research into a private, searchable knowledge map.');
  const [status, setStatus] = useState('Ready to load the packaged model.');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [error, setError] = useState('');

  // Storage and Workspace State
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CanvasItem | null>(null);
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [stats, setStats] = useState({
    documentsCount: 0,
    canvasItemsCount: 0,
    embeddingsCount: 0,
    estimatedSavedBytes: 0,
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLatency, setSearchLatency] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Ingestion / Manual Input State
  const [importType, setImportType] = useState<'markdown' | 'webpage' | 'snippet' | 'pdf'>('markdown');
  const [importTitle, setImportTitle] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importMode, setImportMode] = useState<'lightweight' | 'deep'>('lightweight');
  const [captureStatus, setCaptureStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const instance = new EmbeddingClient();
    client.current = instance;
    void refreshWorkspace();
    return () => {
      instance.dispose();
      layoutClient.dispose();
      client.current = null;
    };
  }, []);

  async function refreshWorkspace() {
    try {
      const items = await db.listCanvasItems();
      setCanvasItems(items);
      const currentStats = await db.getStorageStats();
      setStats(currentStats);
    } catch {
      // IndexedDB initialization
    }
  }

  // --- Diagnostic Inference Execution ---
  async function runDiagnostic() {
    if (!client.current) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await client.current.embed(text, setStatus));
      setStatus('Embedding generated locally.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus('Embedding could not be generated.');
    } finally {
      setBusy(false);
    }
  }

  // --- Semantic Cosine Search Execution ---
  async function handleSearch() {
    if (!client.current || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const queryEmb = await client.current.embed(searchQuery.trim());
      const { results, searchLatencyMs } = await searchEngine.search(queryEmb.vector, {
        topK: 10,
        minScore: 0.05,
      });
      setSearchResults(results);
      setSearchLatency(searchLatencyMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSearching(false);
    }
  }

  // --- Layout Reorganization: UMAP & Spring Physics Worker ---
  async function handleReorganizeMap() {
    if (canvasItems.length === 0) return;
    setIsReorganizing(true);
    try {
      const quantizedVectors = await db.listQuantizedVectors();
      const vectorMap = new Map<string, Float32Array>();

      for (const qv of quantizedVectors) {
        if (!qv.chunkId || !vectorMap.has(qv.documentId)) {
          vectorMap.set(qv.documentId, dequantizeVector(qv));
        }
      }

      const layoutInputs = canvasItems.map((item) => ({
        id: item.id,
        vector: vectorMap.get(item.id) ?? new Float32Array(384),
        pinned: item.pinned,
        position: item.position,
      }));

      const newPositions = await layoutClient.computeLayout(layoutInputs, {
        canvasWidth: 1400,
        canvasHeight: 900,
        iterations: 80,
        minCardDistance: 240,
      });

      for (const [id, pos] of Object.entries(newPositions)) {
        await db.updateCanvasItem(id, { position: pos });
      }

      await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsReorganizing(false);
    }
  }

  // --- Ingestion Pipeline: Parse -> Chunk -> Embed -> Quantize -> Store ---
  async function processAndSaveDocument(
    doc: ExtractedDocument,
    snapshotUrl?: string,
    mode: 'lightweight' | 'deep' = 'lightweight'
  ) {
    if (!client.current) throw new Error('Embedding engine client not ready.');

    if (doc.sourceUrl) {
      const existing = await db.findDocumentByUrl(doc.sourceUrl);
      if (existing) {
        setCaptureStatus(`Updating existing entry for: ${doc.sourceUrl}`);
      }
    }

    await db.saveDocument(doc);

    if (snapshotUrl) {
      await snapshotStore.saveSnapshot(doc.id, snapshotUrl);
    }

    if (mode === 'deep') {
      const chunks = chunkDocument(doc, { windowWords: 256, overlapWords: 50 });
      await db.saveChunks(chunks);

      for (const chunk of chunks) {
        const emb = await client.current.embed(chunk.text);
        const qv = quantizeVector(emb.vector, {
          id: chunk.id,
          documentId: doc.id,
          chunkId: chunk.id,
        });
        await db.saveQuantizedVector(qv);
      }
    } else {
      const sampleText = doc.text.slice(0, 1500) || doc.title;
      const emb = await client.current.embed(sampleText);
      const qv = quantizeVector(emb.vector, {
        id: doc.id,
        documentId: doc.id,
      });
      await db.saveQuantizedVector(qv);
    }

    const spreadX = 80 + (canvasItems.length % 5) * 260;
    const spreadY = 80 + Math.floor(canvasItems.length / 5) * 140;

    const canvasItem: CanvasItem = {
      id: doc.id,
      title: doc.title,
      sourceType: doc.sourceType,
      sourceUrl: doc.sourceUrl,
      excerpt: doc.text.slice(0, 160) + (doc.text.length > 160 ? '…' : ''),
      position: { x: spreadX, y: spreadY },
      pinned: false,
      status: 'ready',
      createdAt: Date.now(),
    };
    await db.saveCanvasItem(canvasItem);
    await refreshWorkspace();
  }

  // --- Manual Ingestion Handler ---
  async function handleManualImport() {
    setBusy(true);
    setCaptureStatus('Ingesting and generating vectors…');
    try {
      let doc: ExtractedDocument;
      if (importType === 'markdown') {
        doc = extractMarkdown(importContent, {
          defaultTitle: importTitle || undefined,
          sourceUrl: importUrl || undefined,
        });
      } else if (importType === 'webpage') {
        doc = extractWebpageFromHtml(importContent, {
          fallbackTitle: importTitle || undefined,
          url: importUrl || undefined,
        });
      } else if (importType === 'snippet') {
        doc = extractSnippet(importContent, {
          title: importTitle || undefined,
        });
      } else {
        throw new Error('Please select a PDF file using the file selector.');
      }

      await processAndSaveDocument(doc, undefined, importMode);
      setCaptureStatus(`Successfully saved "${doc.title}" to Meridian workspace.`);
      setImportContent('');
      setImportTitle('');
      setImportUrl('');
    } catch (err) {
      setCaptureStatus(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  // --- PDF Ingestion Handler ---
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setCaptureStatus(`Reading PDF: ${file.name}…`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await extractPdfFromBuffer(arrayBuffer, {
        fallbackTitle: file.name.replace(/\.[^/.]+$/, ''),
        sourceUrl: file.name,
      });

      await processAndSaveDocument(doc, undefined, importMode);
      setCaptureStatus(`Successfully parsed PDF "${doc.title}" (${doc.blocks.length} blocks).`);
    } catch (err) {
      setCaptureStatus(`PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Helper: Resilient webpage HTML fetcher handling CORS via Wikipedia REST API and Background Worker
  async function fetchWebpageHtml(rawUrl: string): Promise<{ html: string; title?: string }> {
    let url = rawUrl.trim();
    if (!/^https?:\/\//i.test(url) && (url.includes('.') || url.startsWith('localhost'))) {
      url = `https://${url}`;
    }

    // 1. Wikipedia REST API optimization (open CORS with access-control-allow-origin: *)
    const wikiMatch = url.match(/https?:\/\/([a-z0-9_-]+)\.wikipedia\.org\/wiki\/([^#?]+)/i);
    if (wikiMatch) {
      const lang = wikiMatch[1];
      const pageTitle = wikiMatch[2];
      const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(decodeURIComponent(pageTitle))}`;
      try {
        // Standard GET without custom headers avoids preflight OPTIONS blocking
        const res = await fetch(apiUrl);
        if (res.ok) {
          const html = await res.text();
          const cleanTitle = decodeURIComponent(pageTitle).replace(/_/g, ' ');
          return { html, title: cleanTitle };
        }
      } catch {
        // Fallback to service worker
      }
    }

    // 2. Background Service Worker fetch (uses MV3 host_permissions for cross-origin bypass)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const response = await new Promise<any>((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'fetch-url', url }, (res) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve(res);
          });
        });
        if (response && response.success && response.html) {
          return { html: response.html };
        }
      } catch {
        // Fallback to direct fetch
      }
    }

    // 3. Fallback direct fetch (for CORS-enabled endpoints)
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const html = await res.text();
      return { html };
    } catch {
      throw new Error(`Unable to fetch ${url}. Please ensure the extension is reloaded at chrome://extensions and this tab refreshed.`);
    }
  }

  // Helper: Direct capture from extension page without background messaging dependency
  async function captureTargetTabDirectly(requestedUrl?: string): Promise<{ html: string; url: string; title: string; snapshotUrl?: string }> {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      throw new Error('Chrome extension tabs API is not available.');
    }

    const currentTab = (await chrome.tabs.getCurrent?.()) || null;
    const allTabs = await chrome.tabs.query({});

    // Filter out our own Meridian extension tab and internal browser system URLs
    const candidateTabs = allTabs.filter((t) => {
      if (currentTab && t.id === currentTab.id) return false;
      const url = t.url || t.pendingUrl;
      if (url && (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('devtools://') || url.startsWith('about:') || url.startsWith('edge://'))) {
        return false;
      }
      return true;
    });

    if (candidateTabs.length === 0) {
      throw new Error('No open web page found in browser tabs. You can also paste the URL directly into the URL field above.');
    }

    // If a specific URL was requested, prioritize the open tab that matches that URL
    if (requestedUrl) {
      const cleanReq = requestedUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      candidateTabs.sort((a, b) => {
        const uA = (a.url || a.pendingUrl || '').toLowerCase();
        const uB = (b.url || b.pendingUrl || '').toLowerCase();
        const matchA = uA.includes(cleanReq) || (cleanReq.includes('wikipedia.org/wiki/') && uA.includes(cleanReq.split('wikipedia.org/wiki/')[1] || ''));
        const matchB = uB.includes(cleanReq) || (cleanReq.includes('wikipedia.org/wiki/') && uB.includes(cleanReq.split('wikipedia.org/wiki/')[1] || ''));
        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;
        return 0;
      });
    } else {
      // Prioritize active tab in other windows or highest lastAccessed
      candidateTabs.sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0);
      });
    }

    // Try candidate tabs to extract DOM
    let extracted: { html: string; url: string; title: string; snapshotUrl?: string } | null = null;
    let lastError: Error | null = null;

    for (const targetTab of candidateTabs) {
      if (!targetTab.id) continue;
      try {
        let snapshotUrl: string | undefined;
        if (chrome.tabs.captureVisibleTab && targetTab.windowId) {
          try {
            snapshotUrl = await chrome.tabs.captureVisibleTab(targetTab.windowId, { format: 'png' });
          } catch {
            // non-fatal
          }
        }

        if (chrome.scripting && chrome.scripting.executeScript) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: () => ({
              html: document.documentElement.outerHTML,
              url: window.location.href,
              title: document.title,
            }),
          });

          const pageData = results[0]?.result;
          if (pageData && pageData.html) {
            extracted = {
              html: pageData.html,
              url: pageData.url || targetTab.url || '',
              title: pageData.title || targetTab.title || 'Untitled Web Page',
              snapshotUrl,
            };
            break;
          }
        }
      } catch (tabErr) {
        lastError = tabErr instanceof Error ? tabErr : new Error(String(tabErr));
      }
    }

    if (!extracted) {
      // If scripting injection was blocked on the tab, but the tab has a valid http/https url:
      const tabWithUrl = candidateTabs.find((t) => {
        const u = t.url || t.pendingUrl;
        return u && /^https?:\/\//i.test(u);
      });
      if (tabWithUrl) {
        const tabUrl = tabWithUrl.url || tabWithUrl.pendingUrl || '';
        const fetched = await fetchWebpageHtml(tabUrl);
        return {
          html: fetched.html,
          url: tabUrl,
          title: tabWithUrl.title || fetched.title || 'Untitled Web Page',
        };
      }
      throw lastError || new Error('Could not extract content from open tabs. You can paste the URL directly into the URL field.');
    }

    return extracted;
  }

  // --- Browser Extension Tab Capture Handler ---
  async function handleTabCapture() {
    setBusy(true);
    setCaptureStatus('Extracting content from web page…');
    try {
      let capturedData: { html: string; url: string; title: string; snapshotUrl?: string } | null = null;

      let trimmedUrl = importUrl.trim();
      if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl) && (trimmedUrl.includes('.') || trimmedUrl.startsWith('localhost'))) {
        trimmedUrl = `https://${trimmedUrl}`;
      }

      // Step 1: If tab is already open in browser, extract DOM directly (instant, zero network, zero CORS)
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        try {
          capturedData = await captureTargetTabDirectly(trimmedUrl || undefined);
        } catch {
          // Tab direct capture fallback below
        }
      }

      // Step 2: If not extracted from an open tab, fetch via Wikipedia REST / background service worker
      if (!capturedData) {
        if (trimmedUrl && /^https?:\/\//i.test(trimmedUrl)) {
          setCaptureStatus(`Fetching content from ${trimmedUrl}…`);
          const { html, title } = await fetchWebpageHtml(trimmedUrl);
          capturedData = {
            html,
            url: trimmedUrl,
            title: importTitle || title || trimmedUrl,
          };
        } else {
          // Fallback to background worker active tab capture
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            const response = await new Promise<any>((resolve, reject) => {
              chrome.runtime.sendMessage(
                { type: 'capture-active-tab', mode: importMode },
                (res) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(res);
                  }
                }
              );
            });

            if (response && response.success) {
              capturedData = response;
            } else {
              throw new Error(response?.error || 'Unable to capture open tab. Please open a webpage in another tab.');
            }
          } else {
            throw new Error('Chrome extension APIs unavailable. Please paste the webpage URL into the field above.');
          }
        }
      }

      if (!capturedData || !capturedData.html) {
        throw new Error('No content could be extracted from the target page.');
      }

      const doc = extractWebpageFromHtml(capturedData.html, {
        url: capturedData.url,
        fallbackTitle: capturedData.title,
      });

      await processAndSaveDocument(doc, capturedData.snapshotUrl, importMode);
      setCaptureStatus(`Successfully captured and indexed "${doc.title}"!`);
      setImportUrl('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('Extension context invalidated') ||
        msg.includes('Receiving end does not exist') ||
        msg.includes('Could not establish connection')
      ) {
        setCaptureStatus('Extension was recently reloaded in Chrome. Please refresh this tab (Cmd+R or F5) to reconnect.');
      } else {
        setCaptureStatus(`Capture failed: ${msg}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleItemMove(id: string, pos: { x: number; y: number }) {
    await db.updateCanvasItem(id, { position: pos });
    setCanvasItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, position: pos } : it))
    );
  }

  async function togglePin(item: CanvasItem) {
    await db.updateCanvasItem(item.id, { pinned: !item.pinned });
    await refreshWorkspace();
  }

  async function deleteItem(id: string) {
    await db.deleteDocument(id);
    await refreshWorkspace();
  }

  // --- Workspace JSON Import Handler ---
  async function handleWorkspaceFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const textData = await file.text();
      const res = await importWorkspaceJson(textData);
      setCaptureStatus(`Restored ${res.documentsRestored} documents, ${res.itemsRestored} cards, and ${res.embeddingsRestored} vectors!`);
      await refreshWorkspace();
    } catch (err) {
      setError(`Workspace import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  }

  async function handlePurgeSnapshots() {
    const pinnedIds = new Set(canvasItems.filter((i) => i.pinned).map((i) => i.id));
    const count = await snapshotStore.purgeOldSnapshots(pinnedIds, 7 * 24 * 60 * 60 * 1000);
    setCaptureStatus(`Purged ${count} unpinned snapshots older than 7 days.`);
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main>
      <div className="header-banner">
        <div>
          <p className="eyebrow">MERIDIAN · LATENT CARTOGRAPHER</p>
          <h1>Spatial Knowledge Engine</h1>
          <p className="intro">100% on-device semantic search, vector clustering &amp; spatial cartography.</p>
        </div>
      </div>

      {/* Storage and Quantization Status Ribbon */}
      <div className="stats-ribbon">
        <div className="stats-item">
          <span className="stats-label">Indexed Documents:</span>
          <span className="stats-value">{stats.documentsCount}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Stored SQ8 Vectors:</span>
          <span className="stats-value">{stats.embeddingsCount}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">SQ8 Space Saved:</span>
          <span className="stats-value">{(stats.estimatedSavedBytes / 1024).toFixed(1)} KB (&gt;74%)</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Autonomy:</span>
          <span className="stats-value">100% Offline (ONNX WASM)</span>
        </div>
      </div>

      {/* Navigation Quick Jump Links */}
      <nav className="nav-tabs">
        <button className="tab-btn" onClick={() => scrollTo('canvas-section')}>🗺️ 2D Spatial Map</button>
        <button className="tab-btn" onClick={() => scrollTo('search-section')}>🔍 Intent Search</button>
        <button className="tab-btn" onClick={() => scrollTo('ingestion-section')}>📥 Ingestion Station</button>
        <button className="tab-btn" onClick={() => scrollTo('export-section')}>📦 Export &amp; Storage</button>
        <button className="tab-btn" onClick={() => scrollTo('diagnostic-section')}>⚙️ Model Diagnostic</button>
      </nav>

      {/* SECTION 1: 2D SPATIAL CANVAS */}
      <section id="canvas-section" aria-labelledby="canvas-heading">
        <h2 id="canvas-heading">Spatial Knowledge Canvas</h2>
        <p className="hint">
          Drag background to pan, scroll to zoom. Drag cards to reposition. Click a card to inspect passages. Click "Reorganize Map" to project 384D semantic embeddings to 2D with UMAP clustering and collision physics.
        </p>

        <SpatialCanvas
          items={canvasItems}
          onItemMove={handleItemMove}
          onItemPin={togglePin}
          onItemSelect={(item) => setSelectedItem(item)}
          onReorganize={() => void handleReorganizeMap()}
          isReorganizing={isReorganizing}
        />

        <div style={{ marginTop: '24px' }}>
          <h3>Spatial Cards Library ({canvasItems.length})</h3>
          <p className="hint">Accessible card list view (FR-34) with coordinate tracking and pin locks.</p>
          {canvasItems.length === 0 ? (
            <p className="hint">No research documents captured yet. Use the Ingestion Station below.</p>
          ) : (
            <div className="cards-grid">
              {canvasItems.map((item) => (
                <div key={item.id} className="canvas-card">
                  <div>
                    <div className="card-meta">
                      <span className="type-tag">{item.sourceType}</span>
                      <span>Pos: ({item.position.x}, {item.position.y})</span>
                      {item.pinned && <span>📌 Pinned</span>}
                    </div>
                    <h4 className="card-title">{item.title}</h4>
                    <p className="card-body">{item.excerpt}</p>
                  </div>
                  <div className="card-actions">
                    <button className="secondary" onClick={() => void togglePin(item)}>
                      {item.pinned ? 'Unpin' : '📌 Pin'}
                    </button>
                    <button className="secondary" onClick={() => setSelectedItem(item)}>
                      Inspect
                    </button>
                    <button className="danger" onClick={() => void deleteItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: INTENT VECTOR SEARCH */}
      <section id="search-section" aria-labelledby="search-heading">
        <h2 id="search-heading">Intent Vector Search</h2>
        <p className="hint">Real-time cosine similarity search across indexed documents with sub-20ms latency.</p>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Ask or search by concept (e.g., 'Raft consensus', 'gradient descent')…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
          />
          <button onClick={() => void handleSearch()} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Scoring…' : 'Search Intent'}
          </button>
        </div>
        {searchLatency !== null && (
          <p className="hint">
            Retrieved in <strong>{searchLatency.toFixed(1)} ms</strong> (SRL Target: ≤ 20 ms)
          </p>
        )}

        {searchResults.length > 0 && (
          <div className="search-results-grid">
            <h3>Top Matching Artifacts ({searchResults.length})</h3>
            {searchResults.map((res) => (
              <article
                key={res.documentId}
                className="search-result-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const matchItem = canvasItems.find((i) => i.id === res.documentId);
                  if (matchItem) setSelectedItem(matchItem);
                }}
              >
                <div className="card-header">
                  <h4 style={{ margin: 0 }}>{res.title}</h4>
                  <span className="score-badge">Cosine: {res.score.toFixed(4)}</span>
                </div>
                {res.heading && <p className="hint" style={{ margin: '4px 0' }}>Under: <em>{res.heading}</em></p>}
                {res.bestChunkText && <div className="match-excerpt">"{res.bestChunkText}"</div>}
                {res.sourceUrl && (
                  <p className="hint" style={{ marginTop: '8px' }}>
                    Source: <a href={res.sourceUrl} target="_blank" rel="noreferrer">{res.sourceUrl}</a>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: INGESTION STATION */}
      <section id="ingestion-section" aria-labelledby="capture-heading">
        <h2 id="capture-heading">Multi-Source Ingestion Station</h2>
        <p className="hint">Capture live browser tabs or import research papers (PDF), Markdown notes, and code snippets.</p>

        <div style={{ margin: '16px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Paste webpage URL (e.g. https://en.wikipedia.org/...) or leave blank to capture active tab"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            style={{ flex: 1, minWidth: '320px' }}
          />
          <button onClick={() => void handleTabCapture()} disabled={busy}>
            🌐 {importUrl.trim() ? 'Capture from URL' : 'Capture Active Browser Tab'}
          </button>
        </div>

        <hr style={{ margin: '24px 0', borderColor: '#e9ecef' }} />

        <h3>Document &amp; Research Paper Ingestion</h3>
        <label htmlFor="import-type">Source Format</label>
        <select
          id="import-type"
          value={importType}
          onChange={(e) => setImportType(e.target.value as 'markdown' | 'webpage' | 'snippet' | 'pdf')}
        >
          <option value="markdown">Markdown Document (.md)</option>
          <option value="webpage">Webpage Raw HTML</option>
          <option value="pdf">Research Paper PDF (.pdf)</option>
          <option value="snippet">Code / Text Snippet</option>
        </select>

        <label htmlFor="import-mode">Ingestion Mode</label>
        <select
          id="import-mode"
          value={importMode}
          onChange={(e) => setImportMode(e.target.value as 'lightweight' | 'deep')}
        >
          <option value="lightweight">Lightweight Mode (Fast document centroid)</option>
          <option value="deep">Deep Focus Mode (256-word token chunks with 50-word overlap)</option>
        </select>

        {importType === 'pdf' ? (
          <div style={{ marginTop: '16px' }}>
            <label htmlFor="pdf-upload">Upload Local PDF Document</label>
            <input
              id="pdf-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => void handlePdfUpload(e)}
              disabled={busy}
            />
            <p className="hint">Preserves 1-based page numbers and segments text blocks automatically.</p>
          </div>
        ) : (
          <>
            <label htmlFor="import-title">Document Title (Optional)</label>
            <input
              id="import-title"
              type="text"
              placeholder="e.g., Attention Is All You Need"
              value={importTitle}
              onChange={(e) => setImportTitle(e.target.value)}
            />

            <label htmlFor="import-url">Source URL (Optional)</label>
            <input
              id="import-url"
              type="text"
              placeholder="e.g., https://arxiv.org/abs/1706.03762"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />

            <label htmlFor="import-content">Content Payload</label>
            <textarea
              id="import-content"
              rows={8}
              placeholder="Paste raw Markdown, HTML, or code snippet here…"
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
            />

            <div style={{ marginTop: '16px' }}>
              <button onClick={() => void handleManualImport()} disabled={busy || !importContent.trim()}>
                {busy ? 'Processing & Quantizing…' : 'Ingest Document'}
              </button>
            </div>
          </>
        )}

        {captureStatus && <p role="status" data-testid="capture-status">{captureStatus}</p>}
      </section>

      {/* SECTION 4: EXPORT, IMPORT & STORAGE POLICIES */}
      <section id="export-section" aria-labelledby="export-heading">
        <h2 id="export-heading">Workspace Export &amp; Storage Lifecycle</h2>
        <p className="hint">Export your spatial map as a portable JSON bundle or a standalone self-contained HTML archive.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <h3>Portable Workspace Bundles</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => void exportWorkspaceJson()}>
                💾 Export Workspace JSON
              </button>
              <button onClick={() => void exportStandaloneHtml()}>
                🌐 Export Standalone HTML Archive
              </button>
              <label className="button secondary" style={{ margin: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                📂 Import Workspace JSON
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => void handleWorkspaceFileImport(e)}
                />
              </label>
            </div>
          </div>

          <hr style={{ borderColor: '#e9ecef', margin: '16px 0' }} />

          <div>
            <h3>Storage Hygiene &amp; Quota Maintenance</h3>
            <p className="hint">
              Origin Private File System (OPFS) and IndexedDB cache visual thumbnails. Unpinned previews older than 7 days can be purged automatically without affecting pinned items.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="secondary" onClick={() => void handlePurgeSnapshots()}>
                🧹 Purge Unpinned Snapshots (7-day LRU)
              </button>
              <button
                className="danger"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete all workspace documents?')) {
                    for (const item of canvasItems) {
                      await db.deleteDocument(item.id);
                    }
                    await refreshWorkspace();
                  }
                }}
              >
                ⚠️ Reset / Clear Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MODEL DIAGNOSTIC (Milestone 1 Test Compliance) */}
      <section id="diagnostic-section" aria-labelledby="diagnostic-title">
        <h2 id="diagnostic-title">Embedding diagnostic</h2>
        <p>MiniLM · 384 dimensions · WASM CPU · External model loading disabled</p>
        <label htmlFor="text">Text to embed</label>
        <textarea
          id="text"
          rows={4}
          maxLength={MAX_INPUT_CHARACTERS}
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={busy}
        />
        <p className="hint">
          Short text only in this milestone. Long inputs may be truncated by the model; document chunking comes later.
        </p>
        <button onClick={() => void runDiagnostic()} disabled={busy || !text.trim()}>
          {busy ? 'Generating…' : 'Generate embedding'}
        </button>
        <p role="status" data-testid="diagnostic-status">{status}</p>
        {error && (
          <p role="alert">
            {error} Run <code>npm run assets:prepare</code>, rebuild, and reload the extension if assets are missing.
          </p>
        )}
        {result && (
          <div data-testid="embedding-result">
            <dl>
              <div>
                <dt>Dimensions</dt>
                <dd data-testid="dimensions">{result.dimensions}</dd>
              </div>
              <div>
                <dt>Backend</dt>
                <dd>{result.backend}</dd>
              </div>
              <div>
                <dt>Elapsed</dt>
                <dd>{result.elapsedMs.toFixed(1)} ms</dd>
              </div>
              <div>
                <dt>Vector norm</dt>
                <dd>{Math.hypot(...result.vector).toFixed(6)}</dd>
              </div>
            </dl>
            <details>
              <summary>Inspect all vector values</summary>
              <pre data-testid="vector">{JSON.stringify(Array.from(result.vector), null, 2)}</pre>
            </details>
          </div>
        )}
      </section>

      {/* Slide-over Passage Inspector */}
      {selectedItem && (
        <PassageInspector
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onTogglePin={togglePin}
          onDelete={deleteItem}
        />
      )}

      <p className="hint" style={{ marginTop: '32px', textAlign: 'center' }}>
        Meridian Latent Cartographer v0.2.0 · 100% On-Device Spatial Knowledge Engine · All 7 Milestones Implemented.
      </p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
