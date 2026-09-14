# telc Deutsch A1 (Start Deutsch 1) — Reading Exam Simulator

A web application designed for **telc Deutsch A1 / Start Deutsch 1** exam preparation (specifically the **Lesen — Reading** section).

The application accurately simulates the real exam environment: authentic part structure, authentic texts, a 25-minute countdown timer, score calculation, and a detailed review of mistakes with clue quotes and vocabulary notes.

---

## 🎯 Conformity to the Real telc A1 / Start Deutsch 1 Exam

The **Lesen** section consists of **15 tasks (15 points)**:
- **Teil 1 (Tasks 1–5)**: Reading 2 short authentic texts (emails, personal letters, informational notices). Format: **Richtig (+)** / **Falsch (-)**.
- **Teil 2 (Tasks 6–10)**: 5 real-life situations. For each situation, 2 websites/advertisements (**a** and **b**) are provided. Objective: select the website that matches the user's request.
- **Teil 3 (Tasks 11–15)**: 5 authentic notices, signs, and announcements (Schilder, Aushänge). Format: **Richtig (+)** / **Falsch (-)**.

- **Exam Duration**: 25 minutes (in the official exam, the combined "Lesen + Schreiben" module lasts 45 minutes, with ~25 minutes allocated to reading).
- **Passing Score**: **9 out of 15 (60%)** — the official telc benchmark.

---

## ✨ Key Features

1. **10 Full Practice Exams (Modellsatz 1–10)**:
   - 150 authentic A1 reading tasks featuring typical exam traps (*Fallen*).
   - Stub modules for Hören, Schreiben, and Sprechen.
2. **Official Exam Timer (25:00)**:
   - Real-time countdown display with a color-coded warning during the final 5 minutes.
   - Pause option for untimed practice sessions.
   - Automatic test submission when time expires.
3. **Authentic Interface & Answer Sheet (Antwortbogen S10)**:
   - Realistic email presentation formatting.
   - Teil 2 formatted as modern web snippets and classified ads.
   - Teil 3 formatted as door signs, store notices, and public announcements.
   - Interactive digital telc S10 answer sheet with clickable bubble options `[+] [-]` and `[a] [b]`.
4. **Smart Navigation**:
   - Seamless jumping between exam parts and questions 1–15.
   - Status indicators for answered and unanswered questions.
5. **Detailed Review & Error Analysis**:
   - Final score, percentage, and pass/fail status (**BESTANDEN** / **NICHT BESTANDEN**).
   - Breakdown by section (Teil 1, 2, 3).
   - Filter by incorrect vs. correct answers.
   - Detailed explanation for each question with relevant clue quotes highlighted from the German text.
   - A1 core vocabulary glossary for each task.
   - **"Review Mistakes" Mode** (re-attempt only incorrect questions).
6. **SQLite Database**:
   - Automatic persistence of all exam attempts, completion times, and scores.
   - Attempt history review to track performance and progress over time.
7. **Multilingual UI**: Interface available in German, English, and Russian.
8. **Responsive Design**: Mobile-friendly layout with dark/light theme support.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18 (tested on Node.js v25)
- npm

### Running the Application

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Build the frontend
npm run build

# 3. Start the server (available at http://localhost:3001)
npm start
```

### Running with Docker

```bash
# Build and run container using Docker Compose
docker compose up --build

# Or using standard Docker commands:
docker build -t telc-a1 .
docker run -d -p 3001:3001 -v telc_data:/app/data --name telc-a1-app telc-a1
```

The application will be accessible at `http://localhost:3001`.
The SQLite database is persisted in the `telc_data` volume.

---

## 📁 Project Structure

```
telcA1/
├── server/
│   ├── index.js              # Express REST API server
│   ├── db.js                 # Database facade: singleton, lazy proxy, init orchestration
│   ├── seed-data.js          # Barrel aggregator: imports all seeds, exports combined seedData
│   ├── database/
│   │   ├── connection.js     # Low-level SQLite connection factory
│   │   ├── migrations.js     # Schema DDL and idempotent migrations
│   │   ├── seeder.js         # Database seeder (INSERT OR REPLACE)
│   │   ├── validate-seeds.js # CLI seed and schema validation tool
│   │   └── validators/       # Modular seed validators (exam, question)
│   ├── seeds/
│   │   ├── modellsatz-1.js   # Exam data: Modellsatz 1 (15 questions)
│   │   ├── ...               # modellsatz-2.js through modellsatz-10.js
│   │   ├── schreiben-modellsatz-1.js # Schreiben 1 (Formular + Brief)
│   │   ├── schreiben-modellsatz-2.js # Schreiben 2 (Formular + Brief)
│   │   └── stubs-modules.js  # Stub exams for Hören, Sprechen
│   ├── routes/               # API route handlers (attempts, exams, test-types, debug)
│   ├── repositories/         # SQLite data access layer (exam, attempt)
│   └── services/             # Backend services (balancer, evaluator, user context)
├── src/
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point
│   ├── index.css             # Tailwind CSS styles
│   ├── config/               # Exam modules and legal configuration
│   │   ├── teilStructureConfig.js # Modular question groups & icons
│   │   └── legalConfig.js    # Operator & legal disclaimer metadata
│   ├── components/
│   │   ├── ExamView.jsx      # Active exam screen (timer, nav, renderer, footer)
│   │   ├── Header.jsx        # App header (logo, title, actions)
│   │   ├── WelcomeScreen.jsx # Welcome dashboard (module selector, exam picker)
│   │   ├── ResultsView.jsx   # Results screen (score, review, explanations)
│   │   ├── HistoryView.jsx   # Full-page history (stats, attempt cards)
│   │   ├── Teil1.jsx         # Reading Part 1 (emails, Richtig/Falsch)
│   │   ├── Teil2.jsx         # Reading Part 2 (situations, website a/b)
│   │   ├── Teil3.jsx         # Reading Part 3 (signs, Richtig/Falsch)
│   │   ├── Antwortbogen.jsx  # Interactive telc S10 answer sheet
│   │   ├── ExamTimer.jsx     # Countdown / stopwatch timer
│   │   ├── QuestionNav.jsx   # Question navigation matrix (1–15)
│   │   ├── teil1/            # Teil 1 subcomponents (text cards, questions)
│   │   ├── teil2/            # Teil 2 subcomponents (webpage options)
│   │   ├── teil3/            # Teil 3 subcomponents (notice cards)
│   │   ├── schreiben/        # Schreiben subcomponents (form, essay, checklist)
│   │   ├── exam/             # Exam subcomponents (bottom nav, skeleton)
│   │   ├── header/           # Header subcomponents (actions, theme, lang)
│   │   ├── results/          # Results subcomponents (hero, filters, review)
│   │   ├── welcome/          # Welcome subcomponents (selectors, cards)
│   │   ├── history/          # History subcomponents (stats, list, cards)
│   │   ├── modals/           # App-level modals (submit, leave, time-up, legal)
│   │   │   └── legal/        # Impressum and Datenschutz subcomponents
│   │   ├── parts/            # Generic module task views (Hören, etc.)
│   │   └── ui/               # Primitive UI components (Button, Card, Dialog)
│   ├── hooks/                # Controller hooks (useAppController, useExamSession)
│   ├── services/             # Domain and infrastructure services
│   │   ├── ai/               # AIProvider interface and registry (WebGPU, WindowAI, None)
│   │   ├── embeddings/       # Local embedding service (EmbeddingGemma)
│   │   ├── storage/          # Storage interface and providers (LocalStorage, Remote, Memory)
│   │   └── schreiben/        # Schreiben evaluation pipeline & linguistic engine
│   │       ├── grading/      # Stages 0-4 micro-graders, model manager, arbitration
│   │       ├── linguistic/   # Topological field parser, valency, chunkers, tokenizers
│   │       ├── rules/        # A1 grammar, rektion, orthography, agreement checkers
│   │       └── scoring/      # telc official scoring calculations
│   ├── utils/                # Utilities (cn, formatting, balancing, webGpuSupport)
│   ├── i18n/                 # i18n context, contracts and validator
│   └── i18n/locales/         # Locale translations (ru.js, en.js)
├── data/
│   └── telc_a1.db            # SQLite database (auto-created)
├── tests/                    # Node.js native test suite
├── package.json
├── vite.config.js
└── Dockerfile
```

### Architecture Notes

- **Modularity & Clean Architecture**: Strictly conforms to McConnell and Martin limits (files <= 180 lines, functions <= 25 lines, Single Responsibility Principle, and Single Level of Abstraction).
- **Linguistic Engine**: Relies on systematic linguistic models (Topological Field Parser, Vorfeld chunking, Case & Valency tables) rather than fragile ad-hoc regex patches.
- **Components**: Each top-level `.jsx` in `components/` is a **screen orchestrator** — it composes subcomponents from the matching subdirectory.
- **Database**: `server/db.js` is a **facade** that orchestrates `database/connection.js` (factory), `database/migrations.js` (DDL), and `database/seeder.js` (data population).
- **Seed Data**: `server/seed-data.js` is a **barrel aggregator** that imports modular exam files from `server/seeds/` and exports a combined `seedData` object.
- **Platform WebGPU Detection**: Utilizes runtime feature detection (`navigator.gpu` + `requestAdapter()`) instead of user-agent sniffing or static assumptions.

---

## 🔧 Modes of Operation

### Installed PWA / offline use
After the app has been opened online, its public exam data is cached by the service worker and remains available offline. Final grading always uses the server; correct answers are never sent to or bundled with the browser.

### Full-stack (with Server)
Data is stored in SQLite. API is served by Express.js on port 3001.

---

## 📝 Exam Format: telc A1 Leseverstehen

| Part | Task Type | Questions | Answer Format |
|------|-----------|-----------|---------------|
| Teil 1 | Reading short texts (emails, letters) | 5 | Richtig / Falsch |
| Teil 2 | Matching situations to websites | 5 | a / b |
| Teil 3 | Understanding signs and notices | 5 | Richtig / Falsch |

Total duration: **25 minutes** for 15 questions.

---

## 📚 Adding New Exam Sets

See [ADDING_QUESTIONS.md](ADDING_QUESTIONS.md) for a detailed guide on creating and validating new exam variants.
Run `npm run validate:seeds` to verify all questions and exam schemas automatically.

## 📦 Current Exam Variants

| ID | Title | Module | Questions | Status |
|----|-------|--------|-----------|--------|
| modellsatz-1 | Modellsatz 1 | Lesen | 15 | ✅ Ready |
| modellsatz-2 | Modellsatz 2 | Lesen | 15 | ✅ Ready |
| modellsatz-3 | Modellsatz 3 | Lesen | 15 | ✅ Ready |
| modellsatz-4 | Modellsatz 4 | Lesen | 15 | ✅ Ready |
| modellsatz-5 | Modellsatz 5 | Lesen | 15 | ✅ Ready |
| modellsatz-6 | Modellsatz 6 | Lesen | 15 | ✅ Ready |
| modellsatz-7 | Modellsatz 7 | Lesen | 15 | ✅ Ready |
| modellsatz-8 | Modellsatz 8 | Lesen | 15 | ✅ Ready |
| modellsatz-9 | Modellsatz 9 | Lesen | 15 | ✅ Ready |
| modellsatz-10 | Modellsatz 10 | Lesen | 15 | ✅ Ready |
| schreiben-modellsatz-1 | telc Deutsch A1 — Schreiben 1 | Schreiben | 6 | ✅ Ready |
| schreiben-modellsatz-2 | telc Deutsch A1 — Schreiben 2 | Schreiben | 6 | ✅ Ready |
| hoeren-modellsatz-1 | Hören (stub) | Hören | 3 | 🚧 Stub |
| sprechen-modellsatz-1 | Sprechen (stub) | Sprechen | 1 | 🚧 Stub |

---

## 🤖 Hybrid In-Browser Grader (Schreiben Teil 2)

The "Schreiben Teil 2" essay evaluation runs completely in the user's browser (static hosting, zero external APIs) powered by a privacy-first, two-model hybrid architecture:

1. **EmbeddingGemma-300M-ONNX** (`@huggingface/transformers`):
   - Computes Matryoshka 256-dimensional normalized embeddings for Leitpunkt semantic search.
   - Size: ~185 MB (`q4`), cached in browser IndexedDB.
   - Prefixes: `"task: search result | query: "` (LP query) and `"task: search result | text: "` (student sentences).
2. **Qwen3-0.6B-q4f16_1-MLC** (`@mlc-ai/web-llm`):
   - Generative micro-tasks: binary Leitpunkt gray zone arbitration (`full` / `partial` / `no`) and single-sentence grammar proposals.
   - Temperature = 0, reasoning tokens disabled via `/no_think`, strict JSON schemas.
   - Size: ~380 MB, cached in CacheStorage / IndexedDB.
   - Total model download: ~565 MB (within <= 700 MB budget).

### Pipeline Stages & Fallbacks
- **Stage 0**: Normalization & sentence segmentation (Zero LLM).
- **Stage 1**: Anrede & Gruß formula scoring (Zero LLM, 0/1/2 pts).
- **Stage 2**: Leitpunkte cosine similarity + keywords. Qwen3 arbiter is invoked **only** in gray zones ($T_1 \pm D$, $T_2 \pm D$) with relevant sentences. Score mapping is strictly done in code.
- **Stage 3**: Single-sentence grammar checking. Mandatory filters: exact substring, `correction !== original`, edit-distance cap (1-3 words), and deduplication.
- **Stage 4**: Deterministic examiner feedback from pre-written, verified A1 German phrases (+ optional LLM polish feature flag).
- **Fallback Matrix**: If WebGPU is unsupported or model download fails, grader smoothly falls back to **Limited Mode** (deterministic rule scoring).

### 📋 Manual Smoke Checklist
When verifying updates locally or on staging:
- [ ] **Cold load (empty cache)**: Open DevTools > Application > Storage > Clear Site Data. Trigger AI check: verify progress indicators for EmbeddingGemma download then Qwen3 download.
- [ ] **Repeat load (from cache)**: Refresh page and re-run check: verify models load instantly from IndexedDB cache without re-downloading weights.
- [ ] **Browser without WebGPU**: Disable WebGPU in browser flags or test in unsupported environment: verify check runs in **Limited Mode** with rule-based scoring and appropriate badge.
- [ ] **60+ word letter**: Submit a long essay with multiple complex sentences: verify segmentation and score calculation complete cleanly without crashes.
- [ ] **Empty input**: Submit empty text or whitespace: verify 0 points, clean feedback, no exceptions.
- [ ] **Non-German input**: Submit English or random gibberish: verify quality analyzer flags spam/gibberish, awarding 0 points with no false grammar corrections.
