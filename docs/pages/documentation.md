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
├── HANDOFF.md                 # Complete engineering architecture log & milestone verification
├── assets.lock.json           # Model checksums & SHA-256 asset integrity record
├── public/manifest.json       # Chromium Manifest V3 extension configuration
├── package.json               # Node.js dependencies & build scripts
├── vite.config.ts             # Vite bundler configuration
├── src/
│   ├── background/index.ts         # Manifest V3 service worker & active tab capture
│   ├── export/workspace.ts         # JSON workspace bundle & standalone HTML archive
│   ├── extraction/                 # Readability DOM, Markdown, PDF, snippet & sliding chunker
│   ├── layout/umap.ts              # UMAP dimensionality reduction & collision physics
│   ├── search/engine.ts            # In-memory SQ8 cosine similarity search engine
│   ├── shared/contracts.ts         # Central TypeScript data contracts
│   ├── storage/                    # IndexedDB v1, SQ8 quantization & OPFS WebP store
│   ├── ui/                         # Spatial Canvas, Passage Inspector, Ingestion Station
│   └── workers/                    # Dedicated Embedding and Layout Web Workers
├── tests/                          # 10/10 automated Playwright integration & unit tests
└── dist/                           # Production extension build bundle
```

### Key Technical Documentation Links
- **Engineering Architecture & Handoff Log:** [`code/extension/HANDOFF.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/HANDOFF.md)
- **Central TypeScript Data Contracts:** [`code/extension/src/shared/contracts.ts`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/src/shared/contracts.ts)
- **Model Integrity Lockfile:** [`code/extension/assets.lock.json`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/code/extension/assets.lock.json)
- **Test Case Matrix (XLSX):** [`Test_Case.xlsx`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/Test_Case.xlsx)
- **Final Capstone LaTeX Report:** [`project-report-final/main.tex`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/project-report-final/main.tex)

---

## 📓 Weekly Development Journals

Weekly progress logs recording individual and team contributions across all development weeks:

- **Rahul Dadwal:** [`journals/Rahul_1024160014.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/Rahul_1024160014.md)
- **Jyotsna Sachdeva:** [`journals/Jyotsna_1024160133.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/Jyotsna_1024160133.md)
- **Bisman Singh Rai:** [`journals/Bisman_1024160130.md`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/journals/Bisman_1024160130.md)

---

## 📊 Presentations & Project Reports

| Deliverable | Repository Location | Current Status |
|---|---|:---:|
| **Final Capstone Academic Report** | [`project-report-final/main.tex`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/project-report-final/main.tex) | :white_check_mark: **Completed (`tietreport.cls`)** |
| **Test Case Verification Matrix** | [`Test_Case.xlsx`](https://github.com/rahulxdadwal/UCS503p-202627-MERIDIAN/blob/master/Test_Case.xlsx) & [`docs/Test_Case.pdf`](../Test_Case.pdf) | :white_check_mark: **33 Verified Test Cases** |
| **Gantt Project Schedule** | [`docs/GANTT-Chart/`](../GANTT-Chart/GANTT-Chart.html) (`.pdf`, `.xlsx`, `.html`, `.csv`) | :white_check_mark: **Maintained (Weeks 1–11)** |
| **Prototype Stage Report** | `project-report-prototype-stage/` | :white_check_mark: **Completed** |
| **Project Presentation Slide Deck** | `docs/ppt/presentation.pptx` | :white_check_mark: **Available** |

---

## ⚖️ Documentation Integrity & Accuracy Rule

In accordance with strict software engineering standards, all project publications, website pages, reports, and slide decks maintain explicit technical distinctions:

1. **Implemented:** Features written, built, and merged into executable code.
2. **Verified:** Features tested under real execution conditions (e.g. offline vector generation).
3. **Approved Design:** Specifications reviewed and accepted in design documents or diagrams.
4. **Planned:** Scheduled roadmap deliverables for upcoming milestones.
5. **Performance Targets:** Evaluation goals (e.g. $\le 20	ext{ ms}$ search, $60	ext{ FPS}$ canvas) to be empirically benchmarked upon component completion.

Planned capabilities are never represented as completed features, and targets are never presented as verified metrics until measured under full workload conditions.
