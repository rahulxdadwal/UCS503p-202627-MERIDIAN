<div align="center">

# 🧭 MERIDIAN: Latent Cartographer
### A Local-First Spatial Knowledge Engine & On-Device Vector Workspace

[![Chromium Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/Language-TypeScript%205.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WASM + ONNX](https://img.shields.io/badge/Inference-ONNX%20Runtime%20WASM-FF6F00?style=for-the-badge&logo=webassembly&logoColor=white)](https://onnxruntime.ai/)
[![Vite 8](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Test Suite](https://img.shields.io/badge/Playwright%20Tests-10%2F10%20Passing-brightgreen?style=for-the-badge&logo=playwright&logoColor=white)](code/extension/tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Institution](https://img.shields.io/badge/TIET-UCS503P%20Capstone-crimson?style=for-the-badge)](https://www.thapar.edu/)

<p align="center">
  <b>Translating high-dimensional research thought into an interactive, navigable 2D spatial canvas.</b><br>
  100% on-device neural vector embeddings • Sub-20ms cosine intent search • SQ8 scalar quantization • Zero cloud telemetry.
</p>

[🌐 Live Documentation Site](https://rahulxdadwal.github.io/UCS503p-202627-MERIDIAN/) • [📄 Academic Capstone Report](project-report-final/main.tex) • [📊 Verified Test Matrix](Test_Case.xlsx) • [🛠️ Architecture Handoff Log](code/extension/HANDOFF.md)

</div>

---

## 📌 Executive Summary

**Meridian: Latent Cartographer** is an advanced, local-first Chromium browser extension developed for students, researchers, and software engineers navigating high-density literature reviews, documentation trees, and multi-source code repositories. 

Traditional browsers manage open research via flat, linear tab bars and static bookmark hierarchies. As tabs accumulate, titles truncate, favicons shrink, and conceptual relationships dissolve—forcing users to re-read sources repeatedly to recover context.

Meridian solves this cognitive fragmentation by:
1. **Vectorizing research material on-device:** Ingesting browser tabs, Wikipedia articles, Markdown files, and PDF preprints directly into dense 384-dimensional semantic vectors using an embedded MiniLM transformer executed via WebAssembly (WASM SIMD).
2. **Projecting concepts onto a 2D spatial canvas:** Applying UMAP dimensionality reduction and spring-force collision physics to organically cluster semantically related artifacts into navigable cognitive neighborhoods.
3. **Delivering sub-20ms semantic intent search:** Utilizing SQ8 scalar quantization to compress vectors by **74.48%**, enabling real-time cosine similarity search ($0.8\text{--}2.5\text{ ms}$) without external APIs, recurring subscription fees, or cloud privacy risks.

---

## 🏛️ System Architecture & Thread Isolation

Meridian enforces strict **thread isolation** to guarantee that CPU-intensive neural inference and mathematical layout physics never degrade the user interface thread:

```text
 Chromium Browser Tab (Main UI Thread)
 ┌────────────────────────────────────────────────────────────────────────┐
 │ React 19 Frontend Shell (Vite 8 + TypeScript)                          │
 │  ├── 60 FPS HTML5 Spatial Canvas (Viewport Culling & Pan/Zoom)         │
 │  ├── Multi-Source Ingestion Station (Webpage, PDF, Markdown, Snippets) │
 │  ├── Sub-20ms Intent Vector Search Bar (< 3ms Retrieval Latency)       │
 │  └── Slide-Over Passage Inspector Drawer                               │
 └──────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     (A) Typed Async Message Channel   (B) Typed Async Message Channel
                    │                                 │
                    ▼                                 ▼
 ┌──────────────────────────────────────┐  ┌───────────────────────────────┐
 │ Dedicated Inference Web Worker       │  │ Dedicated Layout Web Worker   │
 │  ├── ONNX Runtime Web (WASM SIMD)    │  │  ├── Pairwise Cosine Distance │
 │  ├── Xenova/all-MiniLM-L6-v2 Model   │  │  ├── UMAP Projection (384d→2D)│
 │  ├── 384D Dense Vector Generation    │  │  ├── Spring-Force Relaxation  │
 │  └── SQ8 Scalar Quantizer Engine     │  │  └── Pin Lock Constraint Guard│
 └──────────────────┬───────────────────┘  └───────────────────────────────┘
                    │
     (C) Fast Local Binary Channel
                    │
                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Tiered On-Device Persistence Engine                                    │
 │  ├── IndexedDB v1 ("meridian-db"): Documents, Chunks, Quantized Vectors│
 │  └── Origin Private File System (OPFS): WebP Binary Thumbnails (7d LRU)│
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 Core Algorithmic Pillars

### 1. ⚡ Sub-20ms Intent Vector Search Engine
Conventional bookmark search relies on brittle keyword matching. Meridian scores natural-language queries against stored research items in high-dimensional latent space:
* **Algorithm:** Quantized Cosine Similarity:
  $$\text{Cosine Similarity}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\|_2 \|\mathbf{d}\|_2}$$
* **Search Retrieval Latency (SRL):** Evaluates entire multi-document indices in **$0.8\text{--}2.5\text{ ms}$**, vastly outperforming the $\le 20\text{ ms}$ requirement.
* **Passage Highlighting:** Pinpoints the exact 256-word chunk that answers the user's conceptual inquiry.

### 2. 📦 SQ8 Scalar Quantization (74.48% Storage Compression)
Storing raw 32-bit floating point vectors (`Float32Array[384]`) consumes $1,536\text{ bytes}$ per vector, rapidly depleting browser storage quotas:
* **Quantization Scheme:** Linearly scales floats into signed 8-bit integers (`Int8Array[384]`), storing only scalar min/max metadata:
  $$q_i = \text{round}\left(\frac{v_i - \min}{\max - \min} \times 254\right) - 127$$
* **Footprint:** Reduces storage to **$392\text{ bytes}$ per vector** (**$74.48\%$ space reduction**).
* **Mathematical Fidelity:** Preserves vector space geometry with a cosine error delta of **$< 0.002$** (target $\le 0.005$).

### 3. 🗺️ 2D Spatial Knowledge Cartography & UMAP
* **Dimensionality Reduction:** Compresses 384-dimensional semantic relationships down to intuitive 2D canvas coordinates using Classical Multidimensional Scaling (MDS) seeding followed by UMAP manifold learning.
* **Physics Collision Relaxation:** Applies an iterative spring-force solver ($r \ge 160\text{px}$) to eliminate visual overlapping while keeping semantically similar cards clustered together.
* **Pin Locks:** Users can pin any card in place; pinned items maintain zero velocity ($v = 0$) during spatial map reorganizations.

### 4. 📄 Multi-Source Ingestion & Deep Sliding Chunker
* **Webpage DOM Sanitization:** Integrates `@mozilla/readability` to declutter sidebars, advertisements, and cookie banners, extracting structured headings (`h1`–`h6`), prose, data tables, and syntax-tagged code fences (`<pre><code>`).
* **Wikipedia REST API Integration:** Bypasses CORS constraints on Wikipedia URLs (`/api/rest_v1/page/html/`) and routes generic URLs through the background service worker.
* **On-Device PDF Byte Parser:** Parses PDF streams to extract text layers while tagging passages with 1-based physical page numbers.
* **Sliding-Window Chunker:** In **Deep Focus Mode**, slices long documents into overlapping 256-word token windows with 50-word overlaps to enable granular passage-level retrieval.

### 5. 💾 Dual-Tiered Storage & Lifecycle Management
* **Structured Tier (IndexedDB):** 5 typed stores (`documents`, `chunks`, `canvas_items`, `embeddings`, `snapshots`) with duplicate URL detection.
* **Binary Tier (OPFS):** Dedicated WebP image snapshot storage using the Origin Private File System (`navigator.storage.getDirectory()`), isolated from the relational database.
* **Storage Lifecycle (MER-LFC-001):** Automated 7-day LRU cache purge removes stale binary thumbnails while strictly preserving user-pinned artifacts.

### 6. 🌐 Portability & Standalone Export
* **JSON Workspace Bundle:** Dumps the entire research corpus, quantized embeddings, and exact $(x, y)$ canvas coordinates into a portable `schemaVersion: 1.0.0` JSON file.
* **Standalone Offline HTML Archive:** Compiles documents, cards, and canvas visualizers into a single self-contained `.html` file. Anyone can open and explore the research workspace in any browser without installing the extension!

---

## 📊 Empirical Benchmarks & Verification Summary

All seven milestones have been rigorously benchmarked using automated integration tests executed in fresh, sandboxed Chromium instances:

| Architectural Requirement | Constraint / Target | Empirically Measured Result | Status |
| :--- | :---: | :---: | :---: |
| **Search Retrieval Latency (SRL)** | $\le 20\text{ ms}$ | **$0.8\text{--}2.5\text{ ms}$** | :white_check_mark: **PASSED** |
| **Vector Storage Footprint** | $\ge 70\%$ Reduction | **$74.48\%$ Reduction** ($1536 \to 392\text{ B/vec}$) | :white_check_mark: **PASSED** |
| **SQ8 Quantization Cosine Delta** | $\le 0.005$ Error | **$< 0.002$ Delta** | :white_check_mark: **PASSED** |
| **WASM Cold Start Latency** | $\le 800\text{ ms}$ | **$310\text{--}335\text{ ms}$** | :white_check_mark: **PASSED** |
| **WASM Warm Inference Latency** | $\le 15\text{ ms}$ | **$7.1\text{--}11.3\text{ ms}$** | :white_check_mark: **PASSED** |
| **Canvas Render Performance** | $\ge 60\text{ FPS}$ | **60 FPS** (with Viewport Culling) | :white_check_mark: **PASSED** |
| **Network Autonomy** | 0 External Requests | **0 Outgoing HTTP/WS Calls** (Blackholed) | :white_check_mark: **PASSED** |
| **Automated Test Coverage** | 100% Pass Rate | **10 / 10 Playwright Suites Passing** | :white_check_mark: **PASSED** |
| **Test Matrix Verification** | 33 Test Cases | **33 / 33 Verified** ([`Test_Case.xlsx`](Test_Case.xlsx)) | :white_check_mark: **PASSED** |

---

## 🗺️ Multi-Milestone Delivery Matrix

| Milestone | Subsystem Scope | Primary Modules & Code Evidence | Status |
| :--- | :--- | :--- | :---: |
| **M1: Foundation** | Manifest V3 extension, React 19 UI, WASM MiniLM ONNX Worker, offline blackhole test harness. | `src/workers/embedding.worker.ts`, `tests/offline.spec.ts` | :white_check_mark: **PASSED** |
| **M2: Capture & Storage** | Readability DOM extraction, Markdown parser, IndexedDB v1, SQ8 quantization, OPFS snapshot store. | `src/extraction/webpage.ts`, `src/storage/db.ts`, `src/storage/quantization.ts` | :white_check_mark: **PASSED** |
| **M3: Intent Vector Search** | In-memory quantized cosine search, passage score aggregation, sub-20ms retrieval. | `src/search/engine.ts`, `tests/extraction-storage.spec.ts` | :white_check_mark: **PASSED** |
| **M4: Deep Research & PDF** | 256w/50o sliding token chunker, on-device PDF byte parser, slide-over Passage Inspector. | `src/extraction/chunker.ts`, `src/extraction/pdf.ts`, `src/ui/PassageInspector.tsx` | :white_check_mark: **PASSED** |
| **M5: 2D Spatial Canvas** | 60 FPS HTML5 Canvas, UMAP layout worker, spring-force collision physics, card pinning. | `src/ui/SpatialCanvas.tsx`, `src/layout/umap.ts`, `src/workers/layout.worker.ts` | :white_check_mark: **PASSED** |
| **M6: Export & Lifecycle** | Versioned JSON workspace bundle, standalone offline single-file HTML archive, 7-day LRU purge. | `src/export/workspace.ts`, `src/storage/opfs.ts` | :white_check_mark: **PASSED** |
| **M7: Capstone Deliverables** | 10 Playwright test suites, 33 verified test cases in Test_Case.xlsx, complete final LaTeX report. | `project-report-final/main.tex`, `Test_Case.xlsx`, `code/extension/HANDOFF.md` | :white_check_mark: **PASSED** |

---

## 🛠️ Developer Quickstart & Installation

### Prerequisites
- **Node.js:** `v22.12.0` or newer
- **npm:** Included with Node.js
- **Browser:** Google Chrome, Brave, Chromium, or Microsoft Edge

### 1. Clone & Build from Source
```bash
# Clone the repository
git clone https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN.git
cd UCS503p-202627-MERIDIAN/code/extension

# Install project dependencies
npm ci

# Verify cryptographic checksums of packaged model weights and WASM binaries
npm run assets:verify

# Compile TypeScript and bundle production extension via Vite
npm run build
```

The compiled, production-ready extension bundle will be emitted to:
```text
code/extension/dist/
```

### 2. Load the Extension in Chromium
1. Open your browser and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the upper-right corner.
3. Click the **Load unpacked** button.
4. Select the build directory: `UCS503p-202627-MERIDIAN/code/extension/dist/`.
5. Click the **Meridian** icon on your browser toolbar to launch the spatial cartographer!

---

## 🧪 Automated Test Verification

Meridian features a zero-dependency automated Playwright test harness that executes within a sandboxed Chromium profile where all external networking is strictly blackholed:

```bash
cd code/extension
npm test
```

### Test Suite Inventory (10 / 10 Passing in ~6.7s):
1. **`offline.spec.ts` (Foundation Network Blackhole):** Validates 384D WASM inference with all external HTTP/WS traffic routed to blackhole `127.0.0.1:9`.
2. **`extraction-storage.spec.ts` (Extraction & Search):** Verifies Readability DOM decluttering, AST Markdown parsing, IndexedDB persistence, and sub-20ms cosine scoring.
3. **`unit-algorithms.spec.ts` (Core Algorithms):** Validates sliding token chunking (256w/50o), PDF byte parser page indexing, and SQ8 quantization error bound ($< 0.005$).
4. **`spatial-layout-and-export.spec.ts` (UMAP & Export):** Tests non-blocking UMAP projection, spring collision relaxation, and workspace JSON export/import.
5. **`url-capture.spec.ts` (Active Tab & CORS Ingestion):** Verifies open-tab DOM ingestion and Wikipedia REST API capture with automatic card creation.

---

## 📁 Repository Organization

```text
UCS503p-202627-MERIDIAN/
├── assets/                         Institutional branding and documentation assets
├── code/
│   └── extension/                  MERIDIAN Manifest V3 Implementation
│       ├── public/                 Manifest V3 configuration, static icons, and WASM binaries
│       ├── scripts/prepare-assets.mjs Deterministic model asset verification script
│       ├── src/
│       │   ├── background/index.ts Service worker & tab capture orchestration
│       │   ├── export/workspace.ts JSON bundle & standalone offline HTML archive generator
│       │   ├── extraction/         Readability DOM, Markdown AST, PDF parser & sliding chunker
│       │   ├── layout/umap.ts      UMAP dimensionality reduction & spring-force collision physics
│       │   ├── search/engine.ts    In-memory SQ8 cosine similarity search engine
│       │   ├── shared/contracts.ts Central TypeScript data contracts and interfaces
│       │   ├── storage/            IndexedDB v1, SQ8 quantization & OPFS WebP store
│       │   ├── ui/                 HTML5 Spatial Canvas, Passage Inspector, Ingestion Station
│       │   └── workers/            Dedicated Inference and Layout Web Workers
│       ├── tests/                  100% offline Playwright automated verification suites
│       ├── HANDOFF.md              Comprehensive engineering architecture and handoff log
│       └── package.json            Dependencies and NPM scripts
├── docs/                           MkDocs Material documentation source and diagrams
│   ├── diagrams/                   UML Class, Sequence, Activity, and DFD diagrams
│   ├── pages/                      Problem, Solution, Requirements, Demo, and Progress pages
│   └── Test_Case.pdf               Compiled official Foundation Test Verification Report
├── journals/                       Individual weekly student journals (Rahul, Jyotsna, Bisman)
├── project-proposal/               Formal academic project proposal (PDF and LaTeX source)
├── project-report-prototype-stage/ Mid-term prototype evaluation report
├── project-report-final/           Final academic capstone report (main.tex, references.bib)
├── Test_Case_Template.xlsx         Official institutional test case template
├── Test_Case.xlsx                  Synchronized matrix with 33 verified test cases
├── mkdocs.yml                      MkDocs Material documentation configuration
└── README.md                       Professional project overview and architecture manual
```

---

## 👥 Project Team & Academic Supervision

Developed for **UCS503P: Software Engineering Project** at **Thapar Institute of Engineering and Technology**, Patiala, India.

### Faculty Supervisor
* **Dr. Jeelani Asif** — Assistant Professor, Department of Computer Science & Engineering, TIET.

### Student Engineering Team
| Student Name | Roll Number | Primary Engineering Ownership & Contributions |
| :--- | :---: | :--- |
| **Rahul Dadwal** | `1024160014` | Technical direction; Manifest V3 foundation architecture; ONNX WASM MiniLM worker; tiered IndexedDB and SQ8 quantization engine; UMAP spatial canvas physics; Playwright test harness; final capstone report authoring. |
| **Jyotsna Sachdeva** | `1024160133` | Requirements analysis; Level 0/1/2 DFD modeling; multi-source extraction pipeline specifications (Readability DOM, AST Markdown, PDF); vector space topology validation; test case design; MkDocs deployment setup. |
| **Bisman Singh Rai** | `1024160130` | UI/UX spatial canvas design; wireframe specifications; slide-over Passage Inspector layout; test verification documentation (`Test_Case.xlsx` & `docs/Test_Case.pdf`); presentation materials and Gantt scheduling. |

---

## 📄 Academic Deliverables

* **Final Capstone Report:** Formatted under the official `tietreport.cls` class in [`project-report-final/main.tex`](project-report-final/main.tex) with complete literature review, mathematical formulations, architecture diagrams, and empirical benchmark evaluations.
* **Verified Test Case Matrix:** 33 complete test cases (`MER-FND-001` through `MER-BNK-001`) in [`Test_Case.xlsx`](Test_Case.xlsx) and [`docs/Test_Case.pdf`](docs/Test_Case.pdf).
* **Live Project Documentation:** Deployed via GitHub Pages at **[https://rahulxdadwal.github.io/UCS503p-202627-MERIDIAN/](https://rahulxdadwal.github.io/UCS503p-202627-MERIDIAN/)**.

---

## ⚖️ License & Attribution

This software is released under the [MIT License](LICENSE). Embedded machine learning models (`all-MiniLM-L6-v2`) and runtime dependencies (`@huggingface/transformers`, `onnxruntime-web`, `@mozilla/readability`) retain their respective Apache-2.0 and MIT open-source licenses within the packaged extension bundle.
