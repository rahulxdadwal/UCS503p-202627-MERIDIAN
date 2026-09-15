# MERIDIAN: Latent Cartographer

**A local-first spatial knowledge engine and vector workspace**

MERIDIAN is a Chromium browser-extension project for collecting research material, generating semantic representations locally, and eventually arranging related material on a spatial canvas. The project is being developed for **UCS503P: Software Engineering Project** at Thapar Institute of Engineering and Technology under the supervision of **Dr. Jeelani Asif**.

## Current status

The project has completed **Milestone 1: Foundation**. The working implementation is maintained on the `codex/foundation` branch until it is reviewed and merged into `master`.

Milestone 1 provides:

- A Chromium **Manifest V3** extension scaffold.
- A **React 19**, **TypeScript**, and **Vite 8** diagnostic interface.
- A dedicated Web Worker for local semantic inference.
- `@huggingface/transformers` 3.8.1 with the pinned `Xenova/all-MiniLM-L6-v2` model.
- ONNX Runtime WebAssembly execution on the CPU.
- Real normalized embeddings containing **384 dimensions**.
- Runtime controls that prevent external model loading and network access.
- An automated Playwright integration test that launches the built extension in a fresh offline Chromium profile.

The current interface is an engineering diagnostic for the embedding foundation. Web-page capture, document extraction, persistent storage, semantic search, clustering, and the spatial canvas are planned milestones and are not presented as completed features.

## Verified foundation result

The offline integration test produced the following result:

| Check | Verified result |
| --- | ---: |
| Embedding dimensions | 384 |
| Backend | ONNX Runtime WASM |
| Vector norm | 1.000000 |
| First call, including model initialization | 360.2 ms |
| Later calls | 7.7 ms and 7.6 ms |
| Related-text cosine similarity | 0.588948 |
| Unrelated-text cosine similarity | -0.069150 |
| External HTTP(S) or WebSocket requests during inference | 0 observed |

The test uses browser-level controls: offline mode, an unreachable proxy, disabled DNS resolution, a fresh browser profile, a strict extension Content Security Policy, and an external-navigation probe. It verifies application behaviour inside Chromium; it is not a claim of a machine-wide firewall test.

## Implemented architecture

```text
Toolbar action
    -> Manifest V3 background service worker
    -> React diagnostic page
    -> typed EmbeddingClient
    -> dedicated embedding Web Worker
    -> Transformers.js
    -> packaged MiniLM ONNX model
    -> ONNX Runtime WASM
    -> normalized Float32Array with 384 values
```

All model, tokenizer, and WASM requests resolve from the installed `chrome-extension://` origin. The extension does not require a backend, account, API key, or runtime CDN connection.

## Repository structure

The instructor-provided repository structure remains in place. The extension implementation is isolated inside `code/extension/`.

```text
UCS503p-202627-MERIDIAN/
├── assets/                         Project and documentation assets
├── code/
│   └── extension/                  MERIDIAN Manifest V3 implementation
│       ├── public/manifest.json
│       ├── scripts/prepare-assets.mjs
│       ├── src/background/
│       ├── src/shared/
│       ├── src/ui/
│       ├── src/workers/
│       └── tests/offline.spec.ts
├── docs/                           MkDocs content and diagrams
├── journals/                       Individual weekly work journals
├── project-proposal/               Instructor proposal template and report
├── project-report-prototype-stage/ Prototype-stage report location
├── project-report-final/           Final-report location
├── mkdocs.yml
└── README.md
```

The earlier C++ material belongs to the instructor's example structure. MERIDIAN's working foundation uses TypeScript and browser technologies.

## Build the extension

### Prerequisites

- Node.js 22.12 or newer
- npm
- Chrome or another compatible Chromium browser

### Prepare and build

```bash
cd code/extension
npm ci
npm run assets:prepare
npm run build
```

`npm run assets:prepare` downloads the pinned public model revision, verifies it against `assets.lock.json`, and copies the matching ONNX Runtime WASM files. This setup step needs internet access once. The production build itself does not download assets.

### Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose `code/extension/dist/`.
5. Open MERIDIAN from the extension toolbar.
6. Enter a short sentence and select **Generate embedding**.

The result displays the vector dimension, backend, elapsed time, vector norm, and the generated values.

## Run the offline integration test

```bash
cd code/extension
npm run browser:install
npm test
```

The test writes its evidence to:

- `code/extension/test-results/offline-verification.json`
- `code/extension/test-results/foundation.png`

## Planned milestones

### Capture and extraction

- Capture an explicitly selected browser page.
- Extract readable text while preserving useful headings, code, and tables.
- Add PDF and Markdown import after the web-page flow is stable.

### Persistence and retrieval

- Store artifact metadata and searchable chunks in IndexedDB.
- Use OPFS for larger binary assets when required.
- Generate a query embedding locally and rank saved content with cosine similarity.

### Spatial workspace

- Present saved artifacts on an interactive canvas.
- Add semantic neighbourhoods, search focus, inspection, and workspace export.
- Measure search latency and rendering performance only after the integrated workflow exists.

## Parallel development

The project uses module ownership so team members can work from separate systems without editing the same files.

| Area | Suggested branch | Primary files |
| --- | --- | --- |
| Foundation and integration | `codex/foundation` | Manifest, package files, build configuration, workers, and shared contracts |
| Extraction | `codex/extraction` | `code/extension/src/extraction/` and its tests |
| Canvas interface | `codex/canvas-ui` | `code/extension/src/ui/` and UI tests |

Each teammate should branch from the same reviewed base, commit only the files owned by that module, push the feature branch, and open a pull request. Shared-contract or dependency changes require coordination before implementation. Pull requests should be merged one at a time, followed by a build and the relevant tests.

## Team contribution areas

The journals contain the detailed weekly record. The current allocation reflects the relative contribution requested by the team.

| Member | Roll number | Main contribution areas |
| --- | --- | --- |
| **Rahul Dadwal** | `1024160014` | Project direction; foundation architecture; extension scaffold; local embedding worker; asset reproducibility; offline integration testing; technical integration; implementation documentation and reporting |
| **Jyotsna Sachdeva** | `1024160133` | Requirements and proposal documentation; Level 0 and Level 1 data-flow modelling; consistency review; extraction and data-flow planning; documentation review |
| **Bisman Singh Rai** | `1024160130` | Project presentation; communication of the proposed workflow; presentation revisions; demo narrative; supporting documentation review |

## Documentation

- Extension setup and verification: `code/extension/README.md`
- Parallel-development handoff: `code/extension/HANDOFF.md`
- Project website source: `docs/`
- Individual work records: `journals/`
- Proposal and report templates: `project-proposal/`, `project-report-prototype-stage/`, and `project-report-final/`

## License

This repository uses the [MIT License](LICENSE). The packaged third-party model and runtime retain their own licences and attribution files inside the extension package.
