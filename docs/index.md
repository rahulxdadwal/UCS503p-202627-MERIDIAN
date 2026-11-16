# Meridian: Latent Cartographer

<div class="hero-tagline" style="font-size: 1.25em; font-weight: 500; color: var(--md-primary-fg-color); margin-bottom: 1.5em;">
  Translating high-dimensional thought into a navigable 2D spatial canvas.
</div>

[![Chromium Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://vitejs.dev/)
[![WASM + ONNX](https://img.shields.io/badge/AI%20Engine-ONNX%20%2F%20Transformers.js-FF6F00?style=flat-square&logo=webassembly&logoColor=white)](https://huggingface.co/docs/transformers.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/LICENSE)
[![Institution](https://img.shields.io/badge/TIET-UCS503P%20Software%20Engineering-crimson?style=flat-square)](https://www.thapar.edu/)

!!! tip "🚀 Quick Install — Pre-Packaged Release Available"
    Download the pre-built extension package directly from **[GitHub Releases (v1.0.0)](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/releases/tag/v1.0.0)** and load it unpacked in Chromium in under 30 seconds (zero build tools or dependencies required).

---

## 📌 Executive Summary

**Meridian** is a local-first spatial knowledge engine designed for students, researchers, and developers who work with large collections of browser tabs, articles, documentation, PDFs, Markdown notes, and code snippets.

Instead of placing research material inside a linear bookmark list or rigid folder hierarchy, Meridian represents each item according to its semantic meaning. Related material can then be arranged as cards on an interactive two-dimensional canvas.

The long-term objective is to let a user capture research, explore related ideas visually, search using natural language, inspect matching passages, and reopen the original source without sending private research content to a cloud AI service.

---

## 🎯 Project Objective

Meridian aims to reduce cognitive overload and context fragmentation during complex research sessions by combining:

- **Local semantic embedding generation** without external API reliance.
- **Natural-language similarity search** based on meaning rather than exact keyword overlap.
- **Structured content extraction** preserving headings, code snippets, tables, and prose.
- **Persistent browser storage** utilizing tiered on-device primitives.
- **Two-dimensional semantic organization** for spatial idea clustering.
- **An interactive research canvas** supporting panning, zooming, and card inspection.
- **Offline operation** eliminating paid cloud AI APIs and privacy risks.

---

## 🚦 Current Project Status

Meridian has completed development across all planned software engineering milestones (**Milestones 1 through 7**).

The complete system provides an end-to-end, local-first spatial research workspace:

| Architecture Area | Component / Subsystem | Current Status |
|---|---|:---:|
| **Extension Framework** | Chromium Manifest V3 extension | :white_check_mark: **Implemented & Verified** |
| **Frontend Shell** | React 19, TypeScript, and Vite 8 foundation | :white_check_mark: **Implemented & Verified** |
| **Inference Isolation** | Dedicated embedding Web Worker | :white_check_mark: **Implemented & Verified** |
| **Local Model Runtime** | Local MiniLM model loading (ONNX Runtime) | :white_check_mark: **Implemented & Verified** |
| **Execution Engine** | WebAssembly (WASM SIMD)-based inference | :white_check_mark: **Implemented & Verified** |
| **Vector Geometry** | Real 384-dimensional dense embeddings | :white_check_mark: **Implemented & Verified** |
| **Network Autonomy** | 100% offline blackhole containment | :white_check_mark: **Implemented & Verified** |
| **Ingestion Pipeline** | Multi-source capture (Tabs, Wikipedia, PDF, Markdown) | :white_check_mark: **Implemented & Verified** |
| **Persistence Layer** | Tiered storage (IndexedDB v1, SQ8 quantization, OPFS) | :white_check_mark: **Implemented & Verified** |
| **Search Engine** | Sub-20ms cosine vector intent search | :white_check_mark: **Implemented & Verified** |
| **Visualization** | 2D Spatial Canvas with 60 FPS UMAP layout physics | :white_check_mark: **Implemented & Verified** |
| **Deep Research** | 256w/50o sliding chunker & Passage Inspector | :white_check_mark: **Implemented & Verified** |
| **Workspace Portability** | JSON bundle & standalone offline HTML archive | :white_check_mark: **Implemented & Verified** |

!!! success "Full Capstone Milestone Completion"
    All 7 milestones have been implemented in `code/extension/`, validated with **10/10 automated Playwright tests passing**, mapped to **33 verified test cases** in `Test_Case.xlsx`, and documented in the final capstone report (`project-report-final/main.tex`).

---

## 💎 Core Values

Meridian is architected around four foundational principles:

### 1. Local First
Research content, browsing history, and search queries remain entirely on the user's physical machine. No private research documents or queries are transmitted to external servers.

### 2. Meaning Over Folders
Items are indexed and organized according to high-dimensional semantic similarity rather than relying solely on filenames, URLs, or brittle manual folder hierarchies.

### 3. Responsive Interaction
Machine learning model inference, heavy vector math, and spatial layout projections execute entirely outside the main interface thread inside dedicated Web Workers, ensuring the UI remains smooth and responsive at 60 FPS.

### 4. Progressive Research Depth
Users can select between **Lightweight Mode** for rapid item-level bookmarking with minimal storage footprint, and **Deep Focus Mode** for comprehensive passage-level indexing with 256-word token sliding chunking and 50-word overlaps.

---

## 🔬 Implemented Capabilities

The complete Meridian system provides:

- **Active Webpage Ingestion:** Capturing active browser tabs or URLs directly into the spatial workspace with automatic Wikipedia REST API CORS bypass.
- **Structured Content Extraction:** Extracting clean prose, hierarchical headings (`h1`–`h6`), data tables, and syntax-highlighted code blocks using `@mozilla/readability`.
- **Local Document Import:** Ingesting local PDF papers with 1-based page numbers and Markdown research notes.
- **Snippet Capture:** Adding standalone code snippets and quotes manually.
- **Local Vector Generation:** Computing dense 384-dimensional normalized embeddings locally using MiniLM on ONNX WASM.
- **Semantic Intent Search:** Sub-20ms retrieval ($0.8\text{--}2.5\text{ ms}$) across saved documents and passage chunks without requiring exact keyword matches.
- **Spatial 2D Knowledge Canvas:** Laying out saved items as interactive cards on an infinite HTML5 Canvas with mouse-wheel zoom, pan, and viewport culling.
- **UMAP Clustering & Physics:** Dedicated layout Web Worker calculating high-dimensional projections and spring-force collision relaxation ($r \ge 160\text{px}$) with pin locks.
- **Passage Inspector:** Slide-over drawer displaying exact passage chunks, block types, and direct source navigation.
- **Tiered On-Device Storage:** Storing searchable text and SQ8 quantized vectors in IndexedDB (74.5% storage reduction), and WebP snapshots in OPFS with automated 7-day LRU purge.
- **Workspace Portability:** Exporting and importing versioned JSON workspaces (`schemaVersion: 1.0.0`) with coordinate fidelity.
- **Standalone Offline Archive:** Generating a self-contained HTML file to review research workspaces in any browser without installing the extension.

---

## 🎓 Academic Deliverables & Verification

- **Final Capstone Report:** [`project-report-final/main.tex`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/project-report-final/main.tex) under `tietreport.cls`.
- **Verified Test Cases:** 33 test cases (`MER-FND-001` through `MER-BNK-001`) in [`Test_Case.xlsx`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/Test_Case.xlsx) and [`docs/Test_Case.pdf`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/docs/Test_Case.pdf).
- **Engineering Architecture & Handoff:** [`code/extension/HANDOFF.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/HANDOFF.md).
    The capabilities listed above represent the target system deliverables across upcoming milestones. Currently, only the foundation features specified in the status table have been implemented and verified.
