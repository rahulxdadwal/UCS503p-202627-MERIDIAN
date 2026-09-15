# Documentation Index & Artifacts

This page catalogs all official engineering artifacts, design specifications, code repositories, academic proposals, and presentations associated with the **Meridian** project.

---

## 📑 Core Project Ideation & Technical Specifications

| Document Title | File / Location | Scope & Primary Purpose |
|---|---|---|
| **Technical Stack, Architecture & Pipeline Specification** | `detailed_summary.md` *(Internal Archive)* | Technical specification detailing Transformers.js, MiniLM embeddings, Web Workers, Manifest V3, IndexedDB/OPFS, SQ8 quantization, UMAP projection, and Konva.js canvas rendering. |
| **Product Architecture & Technical Specification** | `final_ideation.md` *(Internal Archive)* | Product definition document defining hierarchical chunking, Lightweight vs. Deep Focus modes, age-based storage lifecycle, and multi-source ingestion. |
| **Meridian Implementation Plan** | `Meridian_Implementation_Plan.docx` *(Internal Archive)* | Comprehensive implementation roadmap detailing technical decisions, storage design, offline delivery, seven milestone breakdowns, and approval boundaries. |

---

## 🎓 Academic Proposal Material

The formal academic proposal submitted for **UCS503P: Software Engineering** at Thapar Institute of Engineering and Technology:

- **Compiled Proposal Document:** [`project-proposal/meridian_proposal.pdf`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/project-proposal/meridian_proposal.pdf)
- **LaTeX Source Archive:** [`project-proposal/main.tex`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/project-proposal/main.tex)

**Key Proposal Sections Covered:**
- Problem statement, user pain points, and literature survey.
- Proposed local-first architecture and operational constraints.
- Content extraction, token chunking, and spatial clustering algorithms.
- Functional specifications and delivery milestones.
- Verification, evaluation benchmarks, and risk mitigation strategies.

---

## 💻 Source Code & Extension Architecture

The complete source codebase for the Meridian browser extension is located under `code/extension/`:

```text
code/extension/
├── README.md                  # Extension setup, build instructions & verification guide
├── HANDOFF.md                 # Parallel development protocol & module ownership
├── assets.lock.json           # Model checksums & SHA-256 asset integrity record
├── manifest.json              # Chromium Manifest V3 extension configuration
├── package.json               # Node.js dependencies & build scripts
├── vite.config.ts             # Vite bundler configuration
├── src/
│   ├── background/background.ts    # Manifest V3 service worker
│   ├── embedding/client.ts         # Main-thread embedding client manager
│   ├── embedding/worker.ts         # Dedicated WASM inference Web Worker
│   ├── shared/contracts.ts         # Central TypeScript data contracts
│   └── ui/App.tsx                  # React diagnostic UI view
└── dist/                           # Unpacked extension production build output
```

### Key Technical Documentation Links
- **Extension Architecture & Setup:** [`code/extension/README.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/README.md)
- **Developer Handoff Protocol:** [`code/extension/HANDOFF.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/HANDOFF.md)
- **Shared Data Contracts:** [`code/extension/src/shared/contracts.ts`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/src/shared/contracts.ts)
- **Model Integrity Lockfile:** [`code/extension/assets.lock.json`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/assets.lock.json)

---

## 📓 Weekly Development Journals

Weekly progress logs recording individual and team contributions across all six development weeks:

- **Rahul Dadwal:** [`journals/1024160014-Rahul/Journal.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/1024160014-Rahul/Journal.md)
- **Jyotsna Sachdeva:** [`journals/1024160133- Jyotsna/Journal.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/1024160133-%20Jyotsna/Journal.md)
- **Bisman Singh Rai:** [`journals/1024160130- Bisman/Journal.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/1024160130-%20Bisman/Journal.md)

---

## 📊 Presentations & Project Reports

| Deliverable | Repository Location | Current Status |
|---|---|:---:|
| **Project Presentation Slide Deck** | `docs/ppt/presentation.pptx` | :white_check_mark: **Available** |
| **Gantt Project Schedule** | `simple-gantt-chart_ms.xlsx` | :white_check_mark: **Maintained (Weeks 1–6)** |
| **Prototype Stage Report** | `project-report-prototype-stage/` | :hourglass_flowing_sand: *Under Active Compilation* |
| **Final Stage Report** | `project-report-final/` | :hourglass_flowing_sand: *Scheduled for Semester End* |

---

## ⚖️ Documentation Integrity & Accuracy Rule

In accordance with strict software engineering standards, all project publications, website pages, reports, and slide decks maintain explicit technical distinctions:

1. **Implemented:** Features written, built, and merged into executable code.
2. **Verified:** Features tested under real execution conditions (e.g. offline vector generation).
3. **Approved Design:** Specifications reviewed and accepted in design documents or diagrams.
4. **Planned:** Scheduled roadmap deliverables for upcoming milestones.
5. **Performance Targets:** Evaluation goals (e.g. $\le 20	ext{ ms}$ search, $60	ext{ FPS}$ canvas) to be empirically benchmarked upon component completion.

Planned capabilities are never represented as completed features, and targets are never presented as verified metrics until measured under full workload conditions.
