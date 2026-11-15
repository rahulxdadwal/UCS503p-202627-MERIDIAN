# Meridian: Latent Cartographer — Engineering Handoff & Architecture Log

> **Current Extension Version:** `v1.0.0` (Complete Capstone System)  
> **Milestones Completed:** Milestones 1 through 7 (All planned deliverables implemented)  
> **Status:** All build, asset verification, typecheck, and Playwright integration suites passing (10/10 tests passing in 6.7s). `Test_Case.xlsx` synchronized with 33 verified test cases. Complete academic final report authored in `project-report-final/main.tex`.

---

## 📌 Executive Summary of the Complete System

The full scope of **Meridian: Latent Cartographer** has been engineered, integrated, and verified across all 7 milestones:

```text
code/extension/
├── public/manifest.json          # Manifest V3 extension configuration (permissions: activeTab, scripting, tabs, storage)
├── package.json                  # Scripts & dependencies (React 19, Transformers.js, Readability, Vite, Playwright)
├── assets.lock.json              # SHA-256 Checksums for pinned all-MiniLM-L6-v2 ONNX & WASM assets
├── src/
│   ├── background/               # Background service worker (index.ts) with on-demand tab capture orchestration
│   ├── extraction/               # Multi-source extraction (webpage.ts, markdown.ts, pdf.ts, chunker.ts, snippet.ts)
│   ├── storage/                  # Tiered persistence (db.ts, quantization.ts SQ8, opfs.ts snapshot store)
│   ├── search/                   # In-memory cosine similarity search engine (engine.ts)
│   ├── layout/                   # Dimensionality reduction (384d -> 2D) & spring-force collision physics (umap.ts)
│   ├── export/                   # Workspace JSON bundle serializer & standalone single-file HTML generator (workspace.ts)
│   ├── shared/                   # Shared TypeScript data contracts (contracts.ts)
│   ├── workers/                  # Dedicated Web Workers:
│   │   ├── embedding.worker.ts   # ONNX Runtime WebAssembly inference worker
│   │   ├── embedding-client.ts   # Typed promise client for embedding inference
│   │   ├── layout.worker.ts      # Non-blocking UMAP & spring-force layout worker
│   │   └── layout-client.ts      # Typed client manager for spatial layout
│   └── ui/                       # React user interface:
│       ├── main.tsx              # Application root with all sections & quick-jump navigation
│       ├── SpatialCanvas.tsx     # 60 FPS HTML5 infinite canvas with viewport culling, pan/zoom & pin locks
│       ├── PassageInspector.tsx  # Slide-over inspector for deep chunk retrieval & page references
│       └── styles.css            # Stylesheet with responsive layout and semantic badges
├── tests/                        # Automated Playwright test suites (100% offline verification):
│   ├── offline.spec.ts           # Milestone 1: Foundation WASM inference, proxy blackhole, zero network requests
│   ├── extraction-storage.spec.ts# Milestones 2 & 3: Extraction, SQ8 persistence, and sub-20ms cosine search
│   ├── unit-algorithms.spec.ts   # Algorithms: Readability DOM, AST Markdown, 256w/50o chunker, SQ8 error bound
│   ├── spatial-layout-and-export.spec.ts # Milestones 4 & 5: UMAP layout collision solver and PDF byte parser
│   └── url-capture.spec.ts       # Milestone 2 & 7: Resilient URL ingestion via Wikipedia REST API & Service Worker fetch
└── dist/                         # Packaged production extension bundle
```

---

## 🔍 Comprehensive Component Breakdown: What, How & Why

### 1. Multi-Source Extraction Engine (`src/extraction/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`webpage.ts`** | Webpage DOM decluttering & block extraction | Integrates `@mozilla/readability` with DOM tree traversal to extract headings (`h1`–`h6`), code blocks (`<pre><code>` with regex language detection), data tables (`<table>`), and paragraphs. Includes fallback when Readability produces no article. | Cleans non-content clutter (ads, sidebars, cookie banners) and extracts structured research prose and code into typed `ExtractedDocument` objects. |
| **`markdown.ts`** | Pure Markdown parser | Parses raw markdown line-by-line without external dependencies. Identifies `#` through `######` headings, extracts code fences (```` ```lang ````), parses Markdown tables, and extracts the top-level heading as the document title. | Enables researchers to import local `.md` notes and documentation directly into the spatial workspace. |
| **`pdf.ts`** | On-device PDF byte stream parser | Parses PDF byte streams to extract text objects (`Tj`, `TJ`), font stream operators, and `/Page` markers. Attaches 1-based `page` references to extracted blocks. | Ingests local research papers and academic PDFs without requiring cloud extraction APIs or servers. |
| **`snippet.ts`** | Code & quote snippet helper | Wraps text and code fragments with language tags into standard `ExtractedDocument` shape. | Allows quick pasting of standalone code or quotes. |
| **`chunker.ts`** | Sliding-window passage chunker | Splits documents into overlapping sliding windows (256 words per window, 50-word overlap) while respecting paragraph and heading boundaries. Attaches parent heading hierarchy to each chunk. | Enables **Deep Focus Mode**: long research papers can be retrieved down to the specific paragraph that answers a user's query. |

---

### 2. Tiered Persistence Engine & SQ8 Quantization (`src/storage/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`quantization.ts`** | SQ8 Scalar Quantization & Fast Cosine Scoring | Maps Float32 vectors `[-1.0..1.0]` to signed Int8 `[-128..127]` using `scale = (max - min) / 254` and `min`. Implements `cosineSimilarityQuantized()` that evaluates similarity directly against quantized arrays. | Reduces vector storage size from 1,536 bytes to 392 bytes per vector (**74.5% storage savings**, beating the ≥70% requirement). Keeps memory usage minimal for large collections. |
| **`db.ts`** | IndexedDB wrapper (`meridian-db` v1) | Creates 5 object stores (`documents`, `chunks`, `canvas_items`, `embeddings`, `snapshots`) with indexes. Implements atomic CRUD operations, cascade deletes, and URL duplicate lookups. | Persists all research artifacts, embeddings, and canvas coordinates permanently on-device across browser restarts with zero cloud costs. |
| **`opfs.ts`** | OPFS / IndexedDB hybrid snapshot store | Detects `navigator.storage.getDirectory()`. Stores WebP image blobs in OPFS `snapshots/` folder with fallback to IndexedDB. Implements automated 7-day LRU purge. | Keeps heavy binary screenshots out of the structured database, preventing memory bloat while preserving pinned research thumbnails. |

---

### 3. Intent Vector Search Engine (`src/search/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`engine.ts`** | In-memory cosine search & passage highlighter | Takes a query Float32 vector, computes cosine similarity against all stored SQ8 embeddings in parallel, aggregates max scores per document, ranks top K, and fetches matching passage chunks. | Provides sub-20ms instant semantic retrieval. Users search by concept (e.g., query *"Raft leader election"* scores **0.7899** on Distributed Systems, while unrelated Deep Learning scores **0.0659**). |

---

### 4. 2D Spatial Layout & Physics Engine (`src/layout/` & `src/workers/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`umap.ts`** | High-dimensional projection & spring-force collision relaxation | Computes pairwise cosine distance matrix $d_{ij} = \sqrt{2(1 - \cos(\mathbf{v}_i, \mathbf{v}_j))}$. Seeds positions via Classical Multidimensional Scaling (MDS). Runs iterative spring-force relaxation: attractive forces between semantically similar cards, repulsive forces when cards collide ($< 160\text{px}$). Pinned cards maintain $v=0$. | Solves card placement so semantically related research items naturally cluster together without unreadable text overlapping. |
| **`layout.worker.ts`** | Dedicated layout Web Worker | Offloads layout calculations to background worker thread via postMessage. | Prevents main UI thread stutters and ensures 60 FPS viewport smoothness during map reorganization. |
| **`SpatialCanvas.tsx`** | High-performance HTML5 Canvas component | Viewport transformation (infinite pan, mouse-wheel cursor zoom, zoom-to-fit). Viewport culling skips cards outside visible screen bounds. Interactive card dragging, pin locking, and selection. | Gives users a tactile spatial canvas to explore their cognitive research landscape. |

---

### 5. Portability & Export Subsystem (`src/export/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`workspace.ts` (JSON)** | Versioned JSON workspace bundle export & import | Dumps all documents, chunks, SQ8 vectors, and canvas items with exact `(x, y)` coordinates into a versioned JSON object (`schemaVersion: 1.0.0`). Re-imports with atomic database writes. | Allows backing up, transferring, and restoring research workspaces across machines without data loss. |
| **`workspace.ts` (HTML)** | Standalone offline single-file HTML archive | Inlines all documents and canvas items into an inert, zero-dependency HTML file with an embedded client viewer. | Allows sharing a research snapshot with anyone—viewable in any web browser without needing to install the extension. |

---

### 6. Background Orchestration & User Interface (`src/background/` & `src/ui/`)

| Module | What is Done | How it is Done | What is the Use of it |
| :--- | :--- | :--- | :--- |
| **`background/index.ts`** | On-demand tab capture service worker | Handles `capture-active-tab` message. Injects DOM reader via `chrome.scripting.executeScript` and captures visible viewport via `chrome.tabs.captureVisibleTab`. | Enables 1-click capture of current web research without persistent background surveillance. |
| **`ui/main.tsx`** | Unified research workspace | Integrates 2D Spatial Canvas, Intent Search bar with latency metrics, Ingestion Station (Webpage, Markdown, PDF, Snippet), Storage Lifecycle controls, and Model Diagnostic lab. | Comprehensive all-in-one interface for the Latent Cartographer. |
| **`PassageInspector.tsx`** | Slide-over inspector drawer | Displays structured blocks and deep sliding-window chunks with page references and direct source navigation. | Allows users to inspect and verify exact paragraphs retrieved by semantic queries. |

---

## 📊 Verification & Test Traceability ([`Test_Case.xlsx`](../../Test_Case.xlsx))

All **33 test cases** in `Test_Case.xlsx` are verified and pass:

| Test Case Range | Subsystem | Verification Scope | Status |
| :--- | :--- | :--- | :---: |
| **MER-FND-001 – 015** | Foundation Engine | Lifecycle, boundary checks (12k chars), 384D WASM inference, proxy blackhole, zero network leaks, CSP rules, worker queue. | **PASS** |
| **MER-EXT-001 – 003** | Extraction Engine | Readability DOM extraction, Markdown AST blocks, 256w/50o sliding-window chunking. | **PASS** |
| **MER-STO-001 – 005** | Tiered Storage | `meridian-db` CRUD, SQ8 quantization (>74% savings), SQ8 accuracy (<0.002 error), duplicate URL detection, OPFS snapshot store. | **PASS** |
| **MER-SRH-001 – 002** | Vector Search | In-memory cosine similarity ranking, concept discrimination, sub-20ms Search Retrieval Latency ($0.8\text{--}2.5\text{ ms}$). | **PASS** |
| **MER-CAN-001 – 002** | Spatial Canvas | Card persistence, pin lock states, 60 FPS viewport animation with off-screen culling. | **PASS** |
| **MER-PDF-001** | PDF Extraction | Research paper PDF text stream extraction with 1-based page numbers. | **PASS** |
| **MER-UMP-001** | UMAP Layout | Dimensionality reduction ($384\text{d} \to 2\text{D}$) with spring-force collision relaxation ($r \ge 130\text{px}$). | **PASS** |
| **MER-EXP-001 – 002** | Export Engine | Versioned JSON workspace bundle export/import, standalone self-contained offline HTML archive. | **PASS** |
| **MER-LFC-001** | Storage Lifecycle | Automated 7-day LRU snapshot cache purge protecting pinned items. | **PASS** |
| **MER-BNK-001** | System Benchmark | End-to-end performance benchmarks (SRL $\le 20\text{ ms}$, 100% offline isolation). | **PASS** |

---

## 🛠️ Verification & Build Instructions

```bash
# Navigate to extension directory
cd code/extension

# 1. Verify packaged model assets and WASM binary checksums
npm run assets:verify

# 2. Typecheck complete TypeScript source (zero errors)
npm run typecheck

# 3. Build optimized production extension bundle into dist/
npm run build

# 4. Run full Playwright automated offline verification test suite
npm test
```
