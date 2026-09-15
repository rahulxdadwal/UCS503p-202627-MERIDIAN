# Parallel development handoff

Wait until this foundation is shared through a reviewed commit or pull request, then branch from that same base. Nothing has been committed or pushed automatically.

## Extraction owner

Suggested branch: `codex/extraction`.

Own `src/extraction/` and its tests. Implement pure extraction helpers that return the `ExtractedDocument` shape in `src/shared/contracts.ts`. Accept document content explicitly so tests can use fixtures without Chrome APIs. Preserve headings, code and tables. Use caller-provided IDs; put block order in array order. PDF `page` references are one-based. Start with the agreed public webpage examples.

Coordinate Readability/PDF/Markdown dependency additions with the foundation owner. Capture permissions, content-script injection and background orchestration are separate integration work. Do not automatically watch browsing or clipboard contents.

## UI owner

Suggested branch: `codex/canvas-ui`.

Own `src/ui/` and UI tests. Build the canvas, search controls, inspector and empty/indexing/error states against `CanvasItem` sample records. Keep sample data explicitly marked. Do not present sample search as real semantic retrieval. Layout coordinates are canvas-space pixels; `position` describes a card's anchor.

Use an injected list of items and action callbacks. Import shared types rather than duplicating them. The worker client already provides `embed(text, onProgress?)`; full retrieval and storage will be integrated later. Coordinate Konva or other dependency additions before editing the package manifests.

## Foundation owner

Own manifest, build/test configuration, asset preparation, worker implementation, package.json, package-lock.json and shared contracts. Coordinate contract changes with both teammates. Do not add storage or extraction code to the worker's message handler; keep each domain behind its own module.

## Merge workflow

Each teammate clones separately, updates main, creates their feature branch and changes only owned files. Push the feature branch and open a pull request. Merge one PR at a time and update remaining branches from main. Resolve shared-interface changes together. Avoid direct main pushes and shared working branches.

Run `npm ci`, `npm run assets:prepare`, `npm run build` and the relevant tests after integrating changes. Run the real offline verification before merging changes to workers, model assets, manifest, bundling or shared embedding contracts.

No repository hosting changes, permissions or pushes are part of this foundation implementation. Each teammate needs repository access or a fork for contribution.
