# MERIDIAN: Latent Cartographer

**A local-first spatial knowledge engine and vector workspace**

MERIDIAN is a local-first Chromium browser extension designed for students, researchers, and developers to collect research material, generate dense semantic representations on-device, and arrange related concepts on an interactive 2D spatial canvas. The project is developed for **UCS503P: Software Engineering Project** at Thapar Institute of Engineering and Technology under the supervision of **Dr. Jeelani Asif**.

---

## 🚀 Current Status: Complete Capstone System

The full planned scope of MERIDIAN has been implemented, verified, and benchmarked across **Milestones 1 through 7**:

- **Milestone 1 (Foundation):** Chromium Manifest V3 scaffold, React 19 + TypeScript + Vite 8 UI, dedicated ONNX Web Worker running `@huggingface/transformers` 3.8.1 (`Xenova/all-MiniLM-L6-v2`) via WebAssembly (WASM) with 100% offline isolation.
- **Milestone 2 (Capture & Persistence):** Active browser tab DOM extraction with `@mozilla/readability`, Wikipedia REST API integration, AST Markdown parser, snippet ingestion, IndexedDB v1 (`meridian-db` with 5 typed stores), SQ8 scalar quantization (**74.48% storage savings**), and OPFS WebP snapshot store with automated 7-day LRU purge.
- **Milestone 3 (Intent Vector Search):** In-memory quantized cosine similarity search engine achieving sub-20ms Search Retrieval Latency (**$0.8\text{--}2.5\text{ ms}$ achieved**).
- **Milestone 4 (Deep Research Chunking & PDF):** 256-word token sliding chunker with 50-word overlap, on-device PDF byte-stream text parser preserving 1-based page numbers, and slide-over Passage Inspector drawer.
- **Milestone 5 (2D Spatial Knowledge Canvas):** 60 FPS HTML5 Canvas with infinite pan, mouse-wheel cursor zoom, viewport culling, card dragging, pin locking, and a dedicated Web Worker executing UMAP dimensionality reduction ($384\text{d} \to 2\text{D}$) and spring-force collision physics ($r \ge 160\text{px}$).
- **Milestone 6 (Product Portability & Export):** Versioned JSON workspace bundle export/import (`schemaVersion: 1.0.0`) and standalone zero-dependency offline single-file HTML archive export.
- **Milestone 7 (Quality Assurance & Academic Deliverables):** 10/10 automated Playwright tests passing offline, 33 verified test cases synchronized in `Test_Case.xlsx`, and a complete academic final capstone report in `project-report-final/main.tex`.

---

## 📊 Verified Performance Benchmarks

All performance constraints have been measured and verified via automated test harnesses:

| Metric / Objective | Constraint Target | Verified Benchmark | Status |
| :--- | :---: | :---: | :---: |
| **Search Retrieval Latency (SRL)** | $\le 20\text{ ms}$ | **$0.8\text{--}2.5\text{ ms}$** | :white_check_mark: **PASSED** |
| **Vector Storage Reduction** | $\ge 70\%$ | **$74.48\%$** ($1536 \to 392\text{ bytes/vector}$) | :white_check_mark: **PASSED** |
| **SQ8 Quantization Cosine Delta** | $\le 0.005$ | **$< 0.002$ delta** | :white_check_mark: **PASSED** |
| **Network Autonomy** | 0 external requests | **0 HTTP/WS requests** (WASM on-device) | :white_check_mark: **PASSED** |
| **Canvas Viewport Render Rate** | $\ge 60\text{ FPS}$ | **60 FPS** with off-screen culling | :white_check_mark: **PASSED** |
| **Automated Test Coverage** | 100% Pass Rate | **10 / 10 Playwright tests passing** | :white_check_mark: **PASSED** |

---

## 🛠️ System Architecture

```text
Toolbar Action / Browser Tab Capture
    │
    ├──> Background Service Worker (src/background/index.ts)
    │        ├── Active Tab DOM Ingestion via chrome.scripting
    │        ├── Wikipedia REST API & Service Worker Fetch Fallback
    │        └── Context Menu 1-Click Capture Hook
    │
    ├──> Ingestion Engine (src/extraction/)
    │        ├── Webpage Readability Sanitizer (webpage.ts)
    │        ├── AST Markdown Parser (markdown.ts)
    │        ├── PDF Byte-Stream Parser (pdf.ts)
    │        └── 256w/50o Sliding Chunker (chunker.ts)
    │
    ├──> Local Inference Worker (src/workers/embedding.worker.ts)
    │        ├── ONNX Runtime WebAssembly (WASM SIMD)
    │        ├── Packaged Xenova/all-MiniLM-L6-v2 ONNX Model
    │        └── 384-Dimensional Dense Vector Generation
    │
    ├──> Tiered Storage Engine (src/storage/)
    │        ├── IndexedDB v1 meridian-db (db.ts)
    │        ├── SQ8 Scalar Quantization Engine (quantization.ts)
    │        └── OPFS WebP Snapshot Store with 7-Day LRU (opfs.ts)
    │
    ├──> Search & Cartography (src/search/ & src/layout/)
    │        ├── In-Memory Cosine Similarity Engine (engine.ts)
    │        ├── Dedicated UMAP Layout Web Worker (layout.worker.ts)
    │        └── Spring-Force Collision Physics Engine (umap.ts)
    │
    └──> User Interface (src/ui/)
             ├── 60 FPS Infinite Spatial Canvas (SpatialCanvas.tsx)
             ├── Passage Inspector Drawer (PassageInspector.tsx)
             ├── Multi-Source Ingestion Station & Intent Search
             └── Standalone HTML & JSON Workspace Exporters (src/export/)
```

All model assets, tokenizer weights, and WebAssembly binaries resolve strictly from the packaged extension bundle (`chrome-extension://`). The system requires zero external cloud APIs, credentials, or remote telemetry.

---

## 📁 Repository Structure

```text
UCS503p-202627-MERIDIAN/
├── assets/                         Documentation and institutional branding assets
├── code/
│   └── extension/                  MERIDIAN Chromium Manifest V3 Implementation
│       ├── public/                 Extension manifest, static icons, and packaged assets
│       ├── scripts/prepare-assets.mjs Reproducible model asset integrity script
│       ├── src/
│       │   ├── background/         Service worker & active-tab capture orchestration
│       │   ├── export/             JSON bundle & standalone HTML archive exporters
│       │   ├── extraction/         Readability, Markdown, PDF, snippet & sliding chunker
│       │   ├── layout/             UMAP high-dimensional projection & spring physics
│       │   ├── search/             In-memory SQ8 cosine search engine
│       │   ├── shared/             Central TypeScript data contracts
│       │   ├── storage/            IndexedDB v1, SQ8 quantization & OPFS store
│       │   ├── ui/                 Spatial Canvas, Passage Inspector, Ingestion Station
│       │   └── workers/            Dedicated Embedding and Layout Web Workers
│       ├── tests/                  100% offline Playwright automated verification suites
│       ├── HANDOFF.md              Comprehensive engineering architecture and handoff log
│       └── package.json            Dependencies and build scripts
├── docs/                           MkDocs documentation source and diagrams
├── journals/                       Individual weekly student journals (Rahul, Jyotsna, Bisman)
├── project-proposal/               Formal academic project proposal (PDF and LaTeX)
├── project-report-prototype-stage/ Mid-term prototype evaluation report
├── project-report-final/           Final academic capstone report (main.tex, references.bib)
├── Test_Case_Template.xlsx         Official institutional test case template
├── Test_Case.xlsx                  Synchronized matrix with 33 verified test cases
├── mkdocs.yml                      MkDocs Material documentation configuration
└── README.md                       Project overview and verification guide
```

---

## 💻 Build & Installation Guide

### Prerequisites
- **Node.js:** `v22.12.0` or newer
- **npm:** Included with Node.js
- **Browser:** Google Chrome, Brave, Chromium, or Microsoft Edge

### 1. Build the Extension Bundle
```bash
# Navigate to extension directory
cd code/extension

# Install dependencies
npm ci

# Verify packaged model assets and WASM binary checksums
npm run assets:verify

# Build production bundle into dist/
npm run build
```

The production extension files will be emitted to `code/extension/dist/`.

### 2. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** via the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the directory: `code/extension/dist/`.
5. Click the **Meridian** icon on your extension toolbar to launch the spatial workspace.

---

## 🧪 Automated Test Verification

The project includes a comprehensive Playwright integration test harness running in Chromium under simulated offline blackhole containment:

```bash
cd code/extension
npm test
```

### Verified Test Suites:
1. **Foundation Offline Isolation (`offline.spec.ts`):** Verifies 384D WASM MiniLM embeddings with all external network requests blackholed to `127.0.0.1:9`.
2. **Extraction & Tiered Storage (`extraction-storage.spec.ts`):** Tests Readability DOM parsing, Markdown extraction, IndexedDB persistence, and sub-20ms cosine search retrieval.
3. **Unit Algorithms (`unit-algorithms.spec.ts`):** Validates the sliding-window chunker (256 words / 50 words overlap), AST Markdown parser, PDF byte parser, and SQ8 quantization error bound ($<0.005$).
4. **Spatial Layout & Export (`spatial-layout-and-export.spec.ts`):** Tests UMAP 2D projection, spring-force collision relaxation, and workspace JSON export/import.
5. **URL & Tab Ingestion (`url-capture.spec.ts`):** Verifies active browser tab DOM capture and Wikipedia REST API extraction with card generation.

---

## 👥 Team Information & Contributions

Developed for **UCS503P: Software Engineering Project** at Thapar Institute of Engineering and Technology under the supervision of **Dr. Jeelani Asif**.

| Member | Roll Number | Primary Module Ownership & Deliverables |
| :--- | :---: | :--- |
| **Rahul Dadwal** | `1024160014` | Project direction; foundation architecture; WASM MiniLM embedding worker; tiered IndexedDB and SQ8 quantization engine; UMAP spatial canvas physics; Playwright test harness; final capstone report authoring. |
| **Jyotsna Sachdeva** | `1024160133` | Requirements analysis; Level 0/1/2 DFD modeling; multi-source extraction pipeline specifications (Readability DOM, AST Markdown, PDF); mathematical vector space topology validation; test case design. |
| **Bisman Singh Rai** | `1024160130` | UI/UX canvas interaction design; wireframe specifications; slide-over Passage Inspector layout; test verification documentation (`Test_Case.xlsx` & `docs/Test_Case.pdf`); MkDocs documentation maintenance. |

---

## 📄 Academic Deliverables

- **Capstone Report:** Complete 6-chapter academic report formatted under `tietreport.cls` in [`project-report-final/main.tex`](project-report-final/main.tex).
- **Test Case Matrix:** 33 verified test cases (`MER-FND-001` through `MER-BNK-001`) in [`Test_Case.xlsx`](Test_Case.xlsx).
- **Documentation Website:** Published via GitHub Pages at [https://rahulxdadwal.github.io/UCS503p-202627-MERIDIAN/](https://rahulxdadwal.github.io/UCS503p-202627-MERIDIAN/).

---

## ⚖️ License

This project is licensed under the [MIT License](LICENSE). Embedded models and WebAssembly runtimes retain their respective open-source licenses inside the extension package.
