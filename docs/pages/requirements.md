# Requirements Specification

## 📋 Functional Requirements (FR)

The system requirements are categorized by functional area and tracked against project milestones:

| Requirement ID | Specification | Status |
|:---:|---|:---:|
| **FR-01** | The system shall package and execute as a Chromium Manifest V3 browser extension. | :white_check_mark: **Implemented** |
| **FR-02** | The extension action click shall open the primary Meridian workspace in a browser tab. | :white_check_mark: **Implemented** |
| **FR-03** | The system shall accept arbitrary, non-empty user text for vectorization. | :white_check_mark: **Implemented** |
| **FR-04** | Semantic embedding inference shall execute within a dedicated background Web Worker. | :white_check_mark: **Implemented** |
| **FR-05** | The system shall generate a normalized 384-dimensional dense vector using MiniLM. | :white_check_mark: **Implemented** |
| **FR-06** | The model weights, tokenizer, and WASM binaries shall load from packaged local extension assets. | :white_check_mark: **Implemented** |
| **FR-07** | The system shall strictly prevent remote model downloads during runtime execution. | :white_check_mark: **Implemented** |
| **FR-08** | The interface shall display real-time inference lifecycle states (loading, ready, error). | :white_check_mark: **Implemented** |
| **FR-09** | The diagnostic view shall report vector dimensions, execution backend, latency, and vector norm. | :white_check_mark: **Implemented** |
| **FR-10** | The user shall be able to initiate explicit capture of an active browser tab. | :white_check_mark: **Implemented & Verified** |
| **FR-11** | The system shall extract readable content from active webpages using DOM sanitization. | :white_check_mark: **Implemented & Verified** |
| **FR-12** | Extraction shall preserve structured headings, paragraphs, code blocks, and data tables. | :white_check_mark: **Implemented & Verified** |
| **FR-13** | The system shall provide a fallback extraction strategy when article extraction fails. | :white_check_mark: **Implemented & Verified** |
| **FR-14** | The system shall detect duplicate captures of existing URLs and offer updates over duplicates. | :white_check_mark: **Implemented & Verified** |
| **FR-15** | The user shall be able to choose between Lightweight Mode and Deep Focus Mode capture. | :white_check_mark: **Implemented & Verified** |
| **FR-16** | Deep Focus Mode shall segment documents using token-based overlapping windows (256w / 50o). | :white_check_mark: **Implemented & Verified** |
| **FR-17** | Chunks shall retain parent heading hierarchy, page indexes, and source URL metadata. | :white_check_mark: **Implemented & Verified** |
| **FR-18** | The system shall compute item-level centroid vectors and chunk-level passage vectors. | :white_check_mark: **Implemented & Verified** |
| **FR-19** | The system shall persist searchable records, chunks, and vectors in browser IndexedDB. | :white_check_mark: **Implemented & Verified** |
| **FR-20** | The system shall store heavy screenshots and binary snapshots in Origin Private File System (OPFS). | :white_check_mark: **Implemented & Verified** |
| **FR-21** | Saved research workspaces shall persist reliably across browser restarts and device reboots. | :white_check_mark: **Implemented & Verified** |
| **FR-22** | The user shall be able to import local PDF documents into the workspace. | :white_check_mark: **Implemented & Verified** |
| **FR-23** | Extracted PDF passages shall preserve respective page number references. | :white_check_mark: **Implemented & Verified** |
| **FR-24** | The user shall be able to import local Markdown notes and documentation. | :white_check_mark: **Implemented & Verified** |
| **FR-25** | The user shall be able to manually create and paste standalone code snippets. | :white_check_mark: **Implemented & Verified** |
| **FR-26** | The system shall vectorize natural-language search queries using the local model. | :white_check_mark: **Implemented & Verified** |
| **FR-27** | Search results shall be ranked against stored vectors using cosine similarity scoring. | :white_check_mark: **Implemented & Verified** |
| **FR-28** | The search interface shall highlight the exact passage matching the query intent. | :white_check_mark: **Implemented & Verified** |
| **FR-29** | Saved research items shall be rendered as interactive visual cards on a 2D spatial canvas. | :white_check_mark: **Implemented & Verified** |
| **FR-30** | The canvas shall support smooth panning, multi-level zooming, zoom-to-fit, and card selection. | :white_check_mark: **Implemented & Verified** |
| **FR-31** | Users shall be able to drag, pin, inspect, delete, and reopen original source tabs from cards. | :white_check_mark: **Implemented & Verified** |
| **FR-32** | Pinned and manually repositioned cards shall remain fixed during layout updates. | :white_check_mark: **Implemented & Verified** |
| **FR-33** | The user shall be able to trigger an explicit spatial map reorganization on demand. | :white_check_mark: **Implemented & Verified** |
| **FR-34** | The system shall provide an accessible tabular list view as an alternative to the 2D canvas. | :white_check_mark: **Implemented & Verified** |
| **FR-35** | The system shall display storage quota consumption and provide manual cleanup tools. | :white_check_mark: **Implemented & Verified** |
| **FR-36** | Automated storage cleanup routines shall guarantee the protection of user-pinned assets. | :white_check_mark: **Implemented & Verified** |
| **FR-37** | The system shall support versioned JSON workspace export and import. | :white_check_mark: **Implemented & Verified** |
| **FR-38** | Export and import shall preserve all vector data, metadata, and 2D canvas coordinates. | :white_check_mark: **Implemented & Verified** |
| **FR-39** | The system shall generate a self-contained, standalone HTML file to review workspaces offline. | :white_check_mark: **Implemented & Verified** |

---

## 🛡️ Non-Functional Requirements (NFR)

### 1. Privacy & Data Sovereignty
- All extracted prose, code, PDFs, vectors, and search queries must remain exclusively on the user's device.
- Zero analytics, telemetry, or external network requests during inference.
- No paid cloud AI subscriptions or API keys required.
- Sanitized HTML exports must render captured scripts completely inert.

### 2. Offline Autonomy
- Full embedding generation, local search, and canvas navigation must operate without internet connectivity.
- Bundled model and WASM binaries must be verified and self-contained within the extension archive.

### 3. Client Performance & Responsiveness
- **Search Retrieval Latency (SRL):** Target median latency $\le 20	ext{ ms}$ across 200+ indexed artifacts.
- **Canvas Rendering Smoothness:** Target $\ge 55	ext{--}60	ext{ FPS}$ during continuous pan and zoom with 100+ visible nodes.
- **Tab Ingestion Latency:** Target $\le 1.5	ext{ s}$ per tab for DOM extraction, chunking, and embedding.

### 4. Storage Optimization
- Dense Float32 vectors must support SQ8 scalar quantization, targeting $\ge 70\%$ storage space savings.
- Heavy binary previews (screenshots) must reside in OPFS separate from IndexedDB structured records.
- Automated 7-day LRU purge for unpinned previews.

### 5. Architectural Reliability & Maintainability
- Background services must be stateless and survive Chromium Manifest V3 service-worker suspensions.
- Centralized TypeScript contracts (`contracts.ts`) must prevent schema drift between modules.
- Checksum verification (`assets.lock.json`) ensures bit-for-bit reproducibility across team environments.

---

## 🚫 Explicit Scope Boundaries & Constraints

To ensure achievable milestone delivery within the academic schedule, the following features are explicitly out of initial scope:

- :x: **Optical Character Recognition (OCR):** Scanned image-only PDFs without text layers will display an informative warning.
- :x: **Full Language AST Compilation:** Code blocks are extracted as structured text with language tags; full semantic compiler AST analysis is deferred.
- :x: **Continuous Clipboard Ingestion:** Automatic background clipboard snooping is avoided for privacy and security reasons.
- :x: **Dwell-Time Auto Capture:** Automated tab saving based on viewing time is excluded to prevent workspace pollution.
- :x: **WebGPU Acceleration:** Deferred until browser WebGPU compatibility and cross-platform stability are verified.
