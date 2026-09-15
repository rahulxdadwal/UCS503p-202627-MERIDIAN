# Meridian extension foundation

Milestone 1 implements a Manifest V3 extension, a React diagnostic screen, and a dedicated local WASM embedding worker. Capture, storage, chunking, search and the research canvas are not implemented yet.

All extension files live here. The instructor's root template and C++ example are unchanged.

## Setup

Use Node.js 22.12+ (validated with Node 24.11.1) and npm. From this directory:

```sh
npm ci
npm run assets:prepare
npm run build
```

Setup needs internet access to install dependencies and download the pinned public model. Runtime inference needs no internet, backend, API key or account.

The preparation script downloads `Xenova/all-MiniLM-L6-v2` at revision `751bff37182d3f1213fa05d7196b954e230abad9`, verifies every model file against `assets.lock.json`, and copies the matching WASM glue and binary from the installed ONNX Runtime. Downloads are written atomically; rerunning skips verified model files. The build checks integrity before bundling. Build never downloads assets.

Model files, runtime copies, dependencies, build output, caches and test output are excluded by this directory's `.gitignore`. Commit the source, manifests and lockfiles, not those generated files. Your teammates run the same preparation command after cloning.

## Load and use

1. Open `chrome://extensions` in Chrome or another compatible Chromium browser.
2. Enable Developer mode and choose **Load unpacked**.
3. Select this directory's `dist/` folder.
4. Click Meridian in the extension toolbar to open the diagnostic screen.
5. Enter a short sentence and select **Generate embedding**.

The result shows 384 dimensions, the WASM backend, elapsed time, vector norm and all values. The first call includes model initialization; later calls reuse the in-memory model. Closing the page terminates its worker. This milestone does not run persistent background inference.

After editing, run `npm run build` and reload the extension. `npm run dev` rebuilds on file changes; it is not a remote Vite dev server or HMR connection. Run a full build at least once before using watch mode.

## Automated offline verification

```sh
npm run browser:install
npm test
```

Browser installation requires networking once. The test uses Playwright's Chromium, not your personal Chrome profile. The test creates a fresh temporary profile, loads the built MV3 extension, enables browser offline mode before opening the app, and blackholes browser network traffic with an unreachable proxy and disabled DNS resolution. The worker has no browser cache and disallows remote model loading. The manifest permits same-extension connections only.

The test checks three real model outputs for 384 finite values, unit norm, nonconstant components and semantic separation. It also checks that an external navigation fails and no HTTP(S)/WebSocket requests occur during embedding. All observed model and WASM requests must come from the installed extension. These are application/browser-level network controls, not a machine-wide firewall or physical network disconnection.

Results are written to `test-results/offline-verification.json` and `test-results/foundation.png`. Tests delete their own temporary browser profile after completion. Some managed environments need approval to launch Chromium outside their filesystem sandbox.

## Architecture

- `public/manifest.json`: MV3 declaration, minimal permissions and strict CSP.
- `src/background/index.ts`: toolbar action opens the application page.
- `src/ui/`: diagnostic React view. Replace or extend this in the UI milestone.
- `src/workers/embedding-client.ts`: typed request/response boundary for UI consumers.
- `src/workers/embedding.worker.ts`: local model initialization and serialized inference.
- `src/shared/contracts.ts`: source, canvas and embedding interfaces for parallel work.
- `scripts/prepare-assets.mjs`: repeatable model/runtime preparation and integrity checks.
- `tests/offline.spec.ts`: real extension integration test.

`EmbeddingClient.embed(text, onProgress?)` returns a promise with a normalized `Float32Array`, model ID, dimension count, backend and elapsed milliseconds. Create one client per application session and dispose it on teardown. Calls are correlated by ID and serialized in the worker. No Chrome API dependency exists in the shared interfaces.

WASM uses one thread for compatibility without cross-origin isolation, and proxy mode is disabled because inference already runs in a dedicated worker. WebGPU, offscreen processing, persistent job recovery and capture permissions are deferred.

## Limits and dependency notes

This is a short-text diagnostic. The tokenizer can truncate long inputs; semantic chunking is later work. The 12,000-character UI limit is a guard, not a guarantee that every character fits the model context. No sentence-level or document-level latency guarantee follows from this smoke test.

Transformers.js 3.8.1 is pinned to the planned v3 architecture. Its Node-only `sharp` dependency is overridden to patched version 0.35.0 to address the inherited libvips audit advisory. The extension uses the browser WASM bundle; it does not invoke Sharp or ONNX Runtime Node. Keep the override under review when upgrading Transformers.js.

The build currently contains ONNX Runtime's automatically emitted fallback WASM asset as well as the explicitly packaged runtime; removing that duplication is a later packaging optimization. No files are downloaded from a CDN at runtime.

Attribution: MiniLM model from https://huggingface.co/Xenova/all-MiniLM-L6-v2 (Apache-2.0), based on sentence-transformers/all-MiniLM-L6-v2; Transformers.js is Apache-2.0; ONNX Runtime is MIT. The asset preparation step includes the relevant license text alongside model/runtime files. The retained ONNX license comes from https://github.com/microsoft/onnxruntime/blob/v1.22.0/LICENSE.
