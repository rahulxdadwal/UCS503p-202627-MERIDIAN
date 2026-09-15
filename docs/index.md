# Meridian: Latent Cartographer

<div class="hero-tagline" style="font-size: 1.25em; font-weight: 500; color: var(--md-primary-fg-color); margin-bottom: 1.5em;">
  Translating high-dimensional thought into a navigable 2D spatial canvas.
</div>

[![Chromium Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://vitejs.dev/)
[![WASM + ONNX](https://img.shields.io/badge/AI%20Engine-ONNX%20%2F%20Transformers.js-FF6F00?style=flat-square&logo=webassembly&logoColor=white)](https://huggingface.co/docs/transformers.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/LICENSE)
[![Institution](https://img.shields.io/badge/TIET-UCS503P%20Software%20Engineering-crimson?style=flat-square)](https://www.thapar.edu/)

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

Meridian is being developed incrementally across structured software engineering milestones.

The completed **Milestone 1 Foundation Prototype** demonstrates that the selected browser-extension and local machine-learning architecture works.

| Architecture Area | Component / Subsystem | Current Status |
|---|---|:---:|
| **Extension Framework** | Chromium Manifest V3 extension | :white_check_mark: **Implemented** |
| **Frontend Shell** | React, TypeScript, and Vite foundation | :white_check_mark: **Implemented** |
| **Inference Isolation** | Dedicated embedding Web Worker | :white_check_mark: **Implemented** |
| **Local Model Runtime** | Local MiniLM model loading | :white_check_mark: **Implemented** |
| **Execution Engine** | WebAssembly (WASM)-based inference | :white_check_mark: **Implemented** |
| **Vector Geometry** | Real 384-dimensional dense embeddings | :white_check_mark: **Implemented** |
| **Network Autonomy** | Offline embedding operation | :white_check_mark: **Verified** |
| **Ingestion Pipeline** | Active webpage capture | :hourglass_flowing_sand: *Planned* |
| **Persistence Layer** | Persistent research storage (IndexedDB / OPFS) | :hourglass_flowing_sand: *Planned* |
| **Search Engine** | Semantic search across saved content | :hourglass_flowing_sand: *Planned* |
| **Visualization** | Spatial knowledge canvas | :hourglass_flowing_sand: *Planned* |
| **Multi-Source Parsing** | PDF and Markdown ingestion | :hourglass_flowing_sand: *Planned* |

!!! note "Architectural Boundary Note"
    The current prototype should be understood as the **technical foundation of Meridian**, rather than the complete research application. It establishes that browser-based local model loading, WebAssembly execution, and typed off-thread worker communication operate reliably without remote dependencies.

---

## 💎 Core Values

Meridian is architected around four foundational principles:

### 1. Local First
Research content, browsing history, and search queries remain entirely on the user's physical machine. No private research documents or queries are transmitted to external servers.

### 2. Meaning Over Folders
Items are indexed and organized according to high-dimensional semantic similarity rather than relying solely on filenames, URLs, or brittle manual folder hierarchies.

### 3. Responsive Interaction
Machine learning model inference, heavy vector math, and spatial layout projections execute entirely outside the main interface thread inside dedicated Web Workers, ensuring the UI remains smooth and responsive.

### 4. Progressive Research Depth
Users can select between **Lightweight Mode** for rapid item-level bookmarking with minimal storage footprint, and **Deep Focus Mode** for comprehensive passage-level indexing with sliding-window chunking.

---

## 🔭 Intended Capabilities

The complete Meridian system is planned to support:

- **Active Webpage Ingestion:** Saving active browser tabs directly to a local research workspace.
- **Structured Content Extraction:** Extracting clean, readable prose, hierarchical headings, data tables, and syntax-highlighted code blocks.
- **Local Document Import:** Ingesting local PDF papers and Markdown research notes.
- **Snippet Capture:** Adding standalone code snippets and notes manually.
- **Local Vector Generation:** Computing dense 384-dimensional embeddings locally using MiniLM.
- **Semantic Intent Search:** Finding research assets using natural-language queries without requiring exact keyword matches.
- **Spatial 2D Knowledge Canvas:** Laying out saved items as navigable cards on an interactive spatial canvas.
- **Cluster Highlighting:** Visually highlighting conceptual clusters and guiding navigation toward relevant neighbourhoods.
- **Card Manipulation:** Pinning, dragging, inspecting, reopening original URLs, and deleting workspace items.
- **Tiered On-Device Storage:** Storing searchable structured text and vectors in IndexedDB, and large binary screenshots/DOM snapshots in OPFS.
- **Workspace Portability:** Exporting and importing versioned JSON workspaces with coordinate fidelity.
- **Standalone Viewer:** Generating a self-contained HTML file to review workspaces without extension dependencies.

!!! warning "Project Scope Notice"
    The capabilities listed above represent the target system deliverables across upcoming milestones. Currently, only the foundation features specified in the status table have been implemented and verified.
