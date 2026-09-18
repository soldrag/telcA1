# telc Deutsch A1 (Start Deutsch 1) — Exam Simulator

A modern, browser-first web application for **telc Deutsch A1 / Start Deutsch 1** exam preparation. It features realistic simulation of the official exam environment, authentic tasks, an interactive answer sheet, and an intelligent in-browser grading engine.

Runs entirely as a static web app on **GitHub Pages** — no server or account required.

---

## ✨ Key Features

- **Authentic Exam Simulation**:
  - **Lesen (Reading)**: 15 questions across 3 authentic parts (personal emails, classified ads, public signs) with official scoring (9/15 to pass) and realistic trap questions (*Fallen*).
  - **Schreiben (Writing)**: Authentic registration form (Teil 1) and short email correspondence (Teil 2).
  - **Interactive Antwortbogen (S10)**: Faithful digital bubble sheet with auto-scoring and mistake review mode.
  - **Official Exam Timer**: 25-minute countdown with visual alerts and auto-submission.
- **In-Browser Hybrid AI Grader (Schreiben Teil 2)**:
  - Evaluates German essays directly in the client browser using WebGPU / ONNX models and deterministic linguistic analysis (Topological Field Parser, valency, and case checks).
  - 100% private: no essays or student data are ever sent to external cloud APIs.
- **Teacher Workspace & Assignment Mode**:
  - Create customized, tamper-proof assignment links signed with client-side HMAC-SHA256 tokens.
  - Distributed via URL hash fragments (`#assignment=...`) with zero server logging and duplicate submission lockout.
- **Offline-First PWA**:
  - Fully functional offline once loaded. Attempts and progress are kept locally in `localStorage`.
- **Multilingual UI**: German, English, and Russian interface with detailed German clue highlights and core vocabulary notes.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Frontend + Mock API)
npm run dev

# Or run client-only (Vite):
npm run dev:client
```
The client will be available at `http://localhost:5173` (or `http://localhost:3001` when running the optional full-stack Express server).

### Production Build (Static Site)

```bash
npm run build
```
Outputs static assets to `dist/`, ready for deployment to GitHub Pages or any static CDN.

### Docker (Optional Server)

```bash
docker compose up --build
```
Runs the optional Express + SQLite backend at `http://localhost:3001`.

---

## 📝 Exam Structure

| Module | Part | Tasks / Questions | Format | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Lesen** | Teil 1 | 5 questions (Texts 1–2) | Richtig (+) / Falsch (-) | ~25 min |
| | Teil 2 | 5 questions (Websites a/b) | Option [a] / [b] | |
| | Teil 3 | 5 questions (Notices 11–15) | Richtig (+) / Falsch (-) | |
| **Schreiben** | Teil 1 | 5 form fields | Text / Data input | ~20 min |
| | Teil 2 | Short email (3 Leitpunkte) | Free text (In-browser AI evaluation) | |

---

## 🧪 Testing & Verification

```bash
# Run unit tests (routing, rules, scoring, token security)
npm test

# Validate seed datasets and exam schemas
npm run validate:seeds

# Benchmark Schreiben AI & linguistic grading pipeline
npm run eval:schreiben
```

---

## 📖 Architecture & Guides

- [ARCHITECTURE.md](ARCHITECTURE.md) — Comprehensive technical architecture, hybrid AI grading pipeline, linguistic parsing engine, and component diagrams.
- [ADDING_QUESTIONS.md](ADDING_QUESTIONS.md) — Guide to creating, formatting, and verifying new exam variants.
