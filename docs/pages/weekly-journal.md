# Weekly Development Journal

This journal chronicles the weekly progress, architectural milestones, and individual contributions of the Meridian project team for **UCS503P (Software Engineering)** at Thapar Institute of Engineering and Technology.

Entries are synthesized directly from the authentic team journals maintained in the repository:
- **Rahul Dadwal** (`1024160014-Rahul`)
- **Jyotsna Sachdeva** (`1024160133- Jyotsna`)
- **Bisman Singh Rai** (`1024160130- Bisman`)

---

=== "Week 1: Team Formation & Problem Identification"
    ### 5 August – 11 August 2026

    #### 📌 Objectives
    Establish the software engineering project team, analyze real-world cognitive challenges in research workflows, and define the core problem statement for **Meridian**.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Participated in team formation and led technical project brainstorming sessions.
    - Conducted real-world problem analysis on developer and researcher workflows dealing with 50+ concurrent browser tabs.
    - Evaluated the limitations of traditional bookmarks and existing cloud-dependent AI tools.
    - Co-finalized the initial technical vision for **Meridian – Latent Cartographer**.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Researched the concept of spatial knowledge organization and high-dimensional semantic vector spaces.
    - Analyzed how cognitive overload and context loss occur during fragmented literature reviews.
    - Formulated the core functional objectives: local vector generation, natural-language search, and 2D spatial arrangement.

    ##### **Bisman Singh Rai (Member 3)**
    - Researched user pain points in modern web research: tab clutter, distraction, and privacy risks.
    - Formulated high-level project motivation and domain exploration notes.
    - Assisted in drafting the initial team charter and problem domain summary.

    #### 🎯 Outcomes & Milestones
    - Formed project team and finalized problem statement: *Transforming fragmented browser tabs into a 2D spatial knowledge map using on-device semantic vectors*.
    - Established the initial technical and architectural direction for the Meridian project.

---

=== "Week 2: Project Proposal & Requirements Analysis"
    ### 12 August – 18 August 2026

    #### 📌 Objectives
    Draft the formal academic Project Proposal, define functional and non-functional requirements, and model high-level system interactions.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Analyzed Chromium extension architecture constraints, focusing on Manifest V3 background worker limitations.
    - Defined user interaction models for active tab capture, 2D canvas navigation, and passage-level search.
    - Structured the functional requirements for WebAssembly execution and off-thread model inference.
    - Contributed technical architecture and system specification sections to the proposal.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Authored the core problem description, proposed solution, and functional objectives for the Project Proposal.
    - Conducted data flow analysis for multi-source ingestion (webpages, PDFs, Markdown notes, code snippets).
    - Designed initial input-output workflows mapping raw document text to 384-dimensional vector representations.

    ##### **Bisman Singh Rai (Member 3)**
    - Gathered academic references and background documentation for the proposal.
    - Drafted the real-world problem motivation, user personas (students, researchers, developers), and project goals.
    - Structured initial presentation material and aligned documentation with team objectives.

    #### 🎯 Outcomes & Milestones
    - Authored and compiled the formal **Project Proposal** (`meridian_proposal.pdf` and LaTeX source `main.tex`).
    - Established baseline functional requirements and confirmed the local-first, zero-cloud architecture.

---

=== "Week 3: Architectural Modeling & Initial Diagrams"
    ### 19 August – 25 August 2026

    #### 📌 Objectives
    Develop formal software engineering design models including the system Use Case Diagram, Context DFD (Level 0), Level 1 DFD, and internal process Level 2 DFD.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Designed the formal **Use Case Diagram** for Meridian, identifying actors (User, Chromium Browser Context) and primary use cases (Capture Active Tab, Generate Vector Embedding, Search Workspace, Explore 2D Canvas).
    - Modeled the **Level 2 Data Flow Diagram (DFD)** detailing internal process decomposition for the embedding pipeline and Web Worker communication.
    - Formatted and aligned diagrams with IEEE/UML modeling standards.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Designed the **Level 0 Context Data Flow Diagram (DFD)**, modeling external entities (User, Webpage DOM, File System) and top-level data boundaries.
    - Developed the **Level 1 DFD**, decomposing system processes into Ingestion, Vectorization, Persistence (IndexedDB/OPFS), and Canvas Visualization.
    - Verified data flow consistency across external entities and data stores.

    ##### **Bisman Singh Rai (Member 3)**
    - Designed the initial complete draft of the **Project Presentation Slide Deck** (`presentation.pptx`).
    - Formatted diagram slides, added process walkthrough descriptions, and ensured visual layout consistency.
    - Prepared presenter notes for problem motivation and user workflow slides.

    #### 🎯 Outcomes & Milestones
    - Finalized initial UML Use Case Diagram and Data Flow Diagrams (Level 0 Context, Level 1, and Level 2).
    - Delivered the comprehensive Project Presentation draft for evaluation.

---

=== "Week 4: Detailed Design & Refinement"
    ### 26 August – 1 September 2026

    #### 📌 Objectives
    Refine and extend system design diagrams to incorporate new project requirements, tiered client storage (IndexedDB/OPFS), and sliding-window chunking.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Extended the **Use Case Diagram** with secondary interactions: Deep Focus vs. Lightweight capture modes, card pinning, and JSON workspace export.
    - Expanded the **Level 2 DFD** to detail tensor pooling, scalar quantization (SQ8), and coordinate calculation processes.
    - Verified diagram traceability against the technical specifications in the project proposal.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Refined the **Level 0 and Level 1 DFDs**, explicitly modeling the hot/cold storage split (IndexedDB for metadata and vectors; OPFS for WebP screenshots).
    - Refined data dictionary entries for `ExtractedDocument`, `Chunk`, and `CanvasNode` data flows.
    - Resolved boundary inconsistencies between ingestion processes and visualization stores.

    ##### **Bisman Singh Rai (Member 3)**
    - Updated the project presentation slide deck to incorporate the revised architecture and tiered storage models.
    - Restructured slides for clarity, improved typography, and aligned visual themes with project identity.
    - Conducted final slide deck proofreading and prepared submission assets.

    #### 🎯 Outcomes & Milestones
    - Completed detailed, extended versions of the Use Case Diagram and Level 0, 1, and 2 DFDs.
    - Successfully validated architectural alignment across all design specifications.

---

=== "Week 5: Extension Architecture & WASM Embedding Pipeline Implementation"
    ### 2 September – 8 September 2026

    #### 📌 Objectives
    Implement the technical foundation of Meridian as a Chromium Manifest V3 extension, configure on-device WebAssembly model execution, and build the Milestone 1 diagnostic UI.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Built the technical foundation of the Meridian extension in `code/extension/` using React, TypeScript, and Vite.
    - Developed the background service worker lifecycle (`background.ts`), configuring `chrome.action.onClicked` to instantiate and manage extension tabs via the Chrome Tabs API.
    - Engineered a dedicated Web Worker (`worker.ts`) to offload machine learning inference from the UI thread, integrating `@huggingface/transformers` with ONNX Runtime Web.
    - Configured the local WebAssembly (WASM) CPU inference backend for the `Xenova/all-MiniLM-L6-v2` transformer model.
    - Implemented the end-to-end vector generation pipeline, successfully producing normalized 384-dimensional dense semantic embeddings from input text.
    - Built the Milestone 1 diagnostic UI interface displaying real-time model loading states, inference execution latencies, and vector dimension inspectors.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Formulated and defined the shared TypeScript contracts and message protocols (`contracts.ts`: `EmbeddingRequest`, `EmbeddingResponse`, `ExtractedDocument`, `WorkerStatus`).
    - Tested and debugged asynchronous IPC message passing and serialized data transfers between the main React UI thread and the dedicated embedding Web Worker.
    - Executed offline validation of the inference pipeline by disabling browser network connectivity to confirm 100% local model loading and execution.
    - Conducted semantic similarity validation on benchmark sentence pairs, verifying that related inputs produced higher cosine similarity ($pprox 0.589$) compared to unrelated inputs ($pprox -0.069$).
    - Documented vector normalization properties and float-array verification metrics for the diagnostic user interface.

    ##### **Bisman Singh Rai (Member 3)**
    - Reviewed the Milestone 1 diagnostic user interface to understand the basic demonstration flow.
    - Assisted in preparing a brief non-technical outline for the upcoming prototype demonstration.
    - Acquired basic familiarity with the prototype interface and outlined simple demonstration steps.

    #### 🎯 Outcomes & Milestones
    - **Milestone 1 Foundation Prototype successfully built and functional** on branch `origin/codex/foundation`.
    - Verified on-device 384-dimensional semantic embedding generation executing locally via WebAssembly with zero external network calls.
    - Established shared data contracts and diagnostic UI for future milestone integration.

---

=== "Week 6: Activity Diagrams, Entity-Relationship Modeling & Prototype Deliverables"
    ### 9 September – 15 September 2026

    #### 📌 Objectives
    Develop formal Activity Diagrams with Swimlanes, model the Entity-Relationship (ER) storage schema, optimize Web Worker stability, and assemble Prototype Stage deliverables.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Developed the formal **Activity Diagram** for Meridian, modeling the complete end-to-end workflow from active browser tab ingestion to semantic vector generation.
    - Designed the **Activity Diagram with Swimlanes**, formally partitioning operational responsibilities across Chromium Browser Context, Background Service Worker, WASM Inference Worker, and Local Storage.
    - Advanced the technical implementation and runtime stability of the extension:
      - Optimized the Transformers.js inference execution pipeline with memory cleanup and tensor disposal routines for continuous embedding runs.
      - Implemented typed IPC error-handling boundaries and worker crash recovery mechanisms for high-throughput browser execution.
      - Streamlined asynchronous message passing between the diagnostic UI view and the background Web Worker.
    - Authored core technical sections of the **Prototype Stage Report**, detailing the Manifest V3 multi-thread architecture, WebAssembly runtime performance benchmarks, and implementation progress.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Contributed to technical implementation and testing of the Meridian extension:
      - Validated data flow and serialization between the extension frontend and local vector processing components.
      - Developed test suites for multi-sentence semantic similarity verification and edge-case token handling.
      - Assisted with profiling embedding generation latency (cold vs. warm start) and worker memory consumption under offline conditions.
    - Designed the **Entity-Relationship (ER) Diagram** for Meridian:
      - Modeled core system entities including `TabArtifact`, `TextChunk`, `VectorEmbedding`, `MetadataRecord`, and `StoragePartition`.
      - Defined entity attributes, primary keys, foreign keys, and cardinalities supporting IndexedDB and OPFS tiered storage.
    - Contributed the **technical slides for the Prototype Presentation**:
      - Prepared architectural breakdown slides detailing the Chromium Manifest V3 multi-thread architecture.
      - Created slides covering the WASM ONNX Runtime inference pipeline, vector dimensions (384d), and local-first offline execution flow.
      - Documented technical validation results, benchmark metrics, and system limitations.
    - Contributed data modeling, testing methodology, and performance validation sections to the Prototype Stage Report.

    ##### **Bisman Singh Rai (Member 3)**
    - Prepared introductory non-technical slides for the Prototype Presentation (project title, team introduction, and problem overview).
    - Assisted with basic slide formatting, visual alignment, and proofreading of the presentation deck.
    - Initial non-technical introductory slides prepared and proofread for the prototype presentation.

    #### 🎯 Outcomes & Milestones
    - Completed formal Activity Diagram and Swimlane Activity Diagram aligned with Chromium process architecture.
    - Finalized Entity-Relationship (ER) storage schema modeling tiered storage across IndexedDB and OPFS.
    - Assembled and finalized Prototype Presentation slide deck and authored core technical sections of the Prototype Stage Report.
