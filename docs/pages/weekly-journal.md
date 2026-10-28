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

---

=== "Week 7: Mid-Semester Evaluation & Review"
    ### 16 September – 22 September 2026

    #### 📌 Objectives
    Deliver the formal Mid-Semester Prototype Demonstration, defend system modeling and technical architecture, and prepare for academic mid-semester examinations.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Prepared and delivered the technical prototype demonstration for the official Mid-Semester Evaluation session.
    - Demonstrated the functioning Chromium Manifest V3 extension, off-main-thread Web Worker execution, and on-device WASM tensor generation to course evaluators.
    - Defended architectural choices regarding local-first execution, ONNX Runtime Web CPU threading, memory lifecycle controls, and sub-10ms warm inference latencies.
    - Documented evaluator feedback regarding modular boundaries for upcoming active tab capture and vector retrieval pipelines.
    - Commenced academic revision for mid-semester theory and laboratory examinations.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Prepared and defended the system modeling artifacts (Level 0, 1, 2 DFDs and Entity-Relationship Diagram) during the Mid-Semester Evaluation session.
    - Presented the data dictionary, data boundaries, and verification metrics for the 384-dimensional vector embedding pipeline.
    - Co-demonstrated the offline execution benchmarks, showing zero network overhead, unit vector normalization, and verified cosine similarity separation.
    - Commenced academic preparation for mid-semester theory and laboratory examinations.

    ##### **Bisman Singh Rai (Member 3)**
    - Handled visual slide management and presentation logistics during the official Mid-Semester Evaluation session.
    - Delivered the introductory presentation segments: project background, user problem statement, and team overview.
    - Recorded evaluator questions, discussion remarks, and feedback for team documentation.
    - Commenced academic preparation for mid-semester theory and laboratory examinations.

    #### 🎯 Outcomes & Milestones
    - Successfully presented and defended the Milestone 1 technical prototype before course evaluators.
    - Gathered structured evaluator feedback and established the baseline for post-examination sprint goals.

---

=== "Week 8: Mid-Semester Examination Period"
    ### 23 September – 7 October 2026

    #### 📌 Objectives
    Complete institutional mid-semester theory and laboratory examinations, conduct an evaluation retrospective, and plan post-exam development resumption.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Appeared for mid-semester academic examinations across theory and laboratory subjects.
    - Conducted a mid-semester retrospective on prototype engineering milestones and evaluator suggestions.
    - Outlined priority technical modules and implementation targets to resume immediately following the examination break.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Appeared for mid-semester academic examinations across theory and practical courses.
    - Reviewed evaluator feedback regarding IndexedDB schema scalability and binary asset storage in OPFS.
    - Maintained academic course deliverables and prepared for post-examination sprint sessions.

    ##### **Bisman Singh Rai (Member 3)**
    - Appeared for mid-semester academic examinations across theory and laboratory subjects.
    - Reviewed presentation assets and slide deck organization post-evaluation.
    - Prepared initial notes on usability aspects to discuss with team members following examinations.

    #### 🎯 Outcomes & Milestones
    - Concluded the mid-semester examination period across all enrolled subjects.
    - Formulated an initial agenda and schedule for post-examination project planning.

---

=== "Week 9: Architecture & Future Implementation Planning"
    ### 7 October – 13 October 2026

    #### 📌 Objectives
    Resume active engineering sprints, establish detailed technical specifications for Milestone 2 (Capture & Storage) and Milestone 3 (Cosine Vector Search), and conduct user workflow research.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Resumed active development and led technical architecture planning for upcoming milestones (Milestones 2 & 3).
    - Researched and benchmarked content script DOM parsing pipelines using `@mozilla/readability` inside isolated extension execution contexts.
    - Designed the background service worker IPC state machine for orchestrating tab capture events, Web Worker job queues, and serialization protocols.
    - Architected the class hierarchy, interfaces, and design patterns for the vector storage engine and in-memory cosine similarity ranking service.
    - Formulated token-level sliding-window chunking algorithms (256-word chunk size, 50-word overlap) with boundary-aware paragraph splitting.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Formulated the database architecture and indexing strategy for client-side storage: IndexedDB (`meridian-db`) for structured document chunks and vectors, and Origin Private File System (OPFS) for WebP visual snapshots.
    - Designed database object stores (`artifacts`, `chunks`, `embeddings`, `layout_positions`) with composite key indexes for fast multi-attribute filtering.
    - Planned database schema versioning, transaction boundaries, and rollback policies for atomic document saves.
    - Drafted data sanitization and schema validation rules for incoming DOM text chunks, code blocks, and metadata fields.

    ##### **Bisman Singh Rai (Member 3)**
    - Coordinated team meeting schedules, documented discussion minutes, and updated the project sprint roadmap.
    - Researched user journey patterns and cognitive workflows for web research, literature surveys, and student note-taking.
    - Collected visual UI design references, color palettes, and layout styles from spatial knowledge and canvas-based productivity applications.
    - Planned the outline and chapter structure for the future User Guide and project manual.

    #### 🎯 Outcomes & Milestones
    - Finalized technical design blueprints for content script DOM extraction and tiered IndexedDB/OPFS persistence.
    - Established detailed state machine specifications, data contracts, and user research catalogs.

---

=== "Week 10: Scalability, Retrieval & Usability Planning"
    ### 14 October – 20 October 2026

    #### 📌 Objectives
    Design non-blocking 2D spatial layout workers, formulate mathematical cosine retrieval models, establish test harness suites, and conduct usability reviews.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Researched mathematical models and algorithms for dynamic 2D spatial clustering: evaluated UMAP (Uniform Manifold Approximation and Projection) and t-SNE performance in JavaScript environments.
    - Architected a dedicated Web Worker pipeline for non-blocking UMAP projection ($384\text{d} \to 2\text{D}$) and spring-force collision-resolution physics.
    - Planned the rendering architecture for the 2D spatial canvas utilizing HTML5 Canvas / Konva.js to guarantee smooth frame rates ($\ge 60\text{ FPS}$) during viewport pan/zoom.
    - Defined technical acceptance criteria, branch workflow policies, and test suites for upcoming development sprints.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Planned the technical algorithm for local in-memory cosine similarity search across multi-item vector collections.
    - Designed vector normalization checks ($L_2\text{ norm} = 1.0$) and scalar quantization (SQ8) to optimize in-memory cosine dot-product computations.
    - Outlined data lifecycle and retention policies, including automatic 7-day cache pruning for unpinned visual snapshots.
    - Formulated comprehensive test harness specifications: mock DOM fixtures, chunk segmentation edge cases, and vector distance verification suites.

    ##### **Bisman Singh Rai (Member 3)**
    - Analyzed usability workflows for non-technical users, identifying potential friction points in active tab capture and canvas navigation.
    - Conducted comparative usability reviews on card layout density, search bar placement, and floating toolbar accessibility.
    - Updated project task checklists, milestone progress trackers, and academic journal logs.
    - Assisted in reviewing non-technical sections of project documentation for clarity and consistency.

    #### 🎯 Outcomes & Milestones
    - Finalized spatial projection pipeline specifications and sub-20ms cosine scoring models.
    - Established end-to-end testing fixtures and usability recommendations for canvas development.

---

=== "Week 11: Class & Sequence Design & Implementation Sprint"
    ### 21 October – 27 October 2026

    #### 📌 Objectives
    Model formal UML Class and Sequence Diagrams, implement object-oriented class hierarchies and asynchronous message orchestration in code, and redesign frontend UI/UX mockups.

    #### 🛠️ Individual Contributions

    ##### **Rahul Dadwal (Member 1)**
    - Designed the comprehensive **System Class Diagram** for the Meridian extension:
      - Modeled core structural classes: `WorkerManager`, `ModelRunner`, `EmbeddingService`, `VectorIndex`, and `CanvasController`.
      - Defined member variables, typed method signatures, inheritance relationships, and interface abstractions (`IEmbeddingClient`, `IVectorStore`).
    - Designed the system **Sequence Diagram** capturing the end-to-end capture, embedding generation, and vector retrieval pipeline.
    - **Implemented the Class Architecture in Code**:
      - Implemented typed TypeScript classes and interfaces in `code/extension/src/`:
        - Structured the core client class `EmbeddingClientManager` with singleton lifecycle controls and worker initialization guards.
        - Implemented `WorkerMessageController` encapsulating typed message dispatch, worker error recovery, and payload serialization.
        - Implemented clean OOP abstractions separating UI state management from background inference routines.

    ##### **Jyotsna Sachdeva (Member 2)**
    - Collaborated on designing the **Class Diagram**, focusing on storage entities, data access objects (DAOs), and chunking service classes:
      - Modeled `DocumentRepository`, `ChunkingService`, `StorageAdapter`, and `CosineSearchEngine` classes with their attributes and associations.
    - Designed the formal **Sequence Diagram** modeling detailed runtime interactions:
      - Mapped sequential message flows: User Capture $\to$ Content Script $\to$ Background Worker $\to$ Inference Worker $\to$ IndexedDB Storage $\to$ Canvas UI Dispatch.
      - Specified asynchronous message payloads, UUID tracking tokens, and error-handling fallback branches.
    - **Implemented the Sequence Flow in Code**:
      - Implemented the end-to-end asynchronous sequence execution and event orchestration:
        - Structured promise-based request-response correlation using unique job IDs (`requestId: crypto.randomUUID()`).
        - Implemented sequential promise chaining and event listener management to guarantee message delivery without race conditions.
        - Integrated structured error-propagation flows handling worker busy states and timeout fallbacks.

    ##### **Bisman Singh Rai (Member 3)**
    - Led the **Ideation Redesign** for the next generation of the Meridian user interface:
      - Redesigned visual wireframes and concept mockups for the interactive 2D research canvas, exploring card grouping aesthetics and node clustering layouts.
      - Re-conceptualized the spatial navigation experience: designed floating control docks for zooming, minimap overlays, and card clustering toggles.
      - Redesigned the contextual Search Modal layout, creating visual concepts for real-time passage highlighting and source URL navigation drawers.
      - Proposed refined dark and light mode UI theme accents (amber and slate palettes) aligned with project branding.
    - Documented user interaction scenarios, edge-case usability flows, and presented the redesigned interface concepts to the team for review.

    #### 🎯 Outcomes & Milestones
    - Completed formal UML Class Diagram and Sequence Diagram adhering to object-oriented software engineering standards.
    - Successfully implemented core class hierarchies and asynchronous sequence correlation in TypeScript.
    - Delivered the comprehensive UI/UX redesign wireframes and interaction specifications for the research canvas.

