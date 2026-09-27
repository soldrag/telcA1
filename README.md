# telc Deutsch A1 (Start Deutsch 1) — Exam Simulator

A browser-first web app for **telc Deutsch A1 / Start Deutsch 1** preparation: realistic exam screens, authentic tasks, an answer sheet, and a grading engine that runs entirely in the browser. It is a static site on **GitHub Pages** — no server, no account.

**Contents:** [Features](#features) · [Exam structure](#exam-structure) · [Quick start](#quick-start) · [Testing](#testing) · [Documentation](#documentation)

---

## Features

- **Lesen** — 10 variants, 15 tasks in 3 parts (e-mails, web ads, notices), 25-minute timer, official pass mark 9/15, review with clue quotes and vocabulary.
- **Schreiben** — 4 variants: registration form (Teil 1) and a short letter with 3 Leitpunkte (Teil 2), graded by the telc A1 criteria.
- **In-browser grading of the letter** — a German linguistic engine (topological fields, case and agreement, letter formulas) plus a small embedding ranker (EmbeddingGemma via WebGPU/Wasm). Grammar hints never lower the telc score; a separate accuracy scale shows them.
- **Teacher mode** — signed assignment links (`#task=`), result links (`#review=`), list of issued tasks with submissions; all in URL fragments and `localStorage`.
- **Offline and private** — works offline after the first load; attempts and progress stay in the browser, nothing is sent anywhere.
- **Interface** in German, English and Russian; phone, tablet and desktop layouts.

Hören and Sprechen are not built yet (placeholders).

## Exam structure

| Module | Part | Tasks | Format |
|---|---|---|---|
| **Lesen** (25 min, 15 points) | Teil 1 | 5 (two e-mails) | richtig / falsch |
| | Teil 2 | 5 (two web pages each) | a / b |
| | Teil 3 | 5 (notices) | richtig / falsch |
| **Schreiben** (20 min, 15 points) | Teil 1 | 5 form fields | short answers |
| | Teil 2 | letter with 3 Leitpunkte | free text, 10 points |

## Quick start

Requires Node.js 22 (as in CI) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # contracts + tests, then dist/
npm run preview    # serve dist/ locally
```

**Docker** (the same static `dist/`, served by nginx):

```bash
docker compose up --build   # http://localhost:8080
```

For phones on the LAN (service worker and Web Crypto need a secure context) put `cert.pem` and `key.pem` into `certs/` (e.g. with `mkcert`); HTTPS is then served on `https://<your-ip>:8443`.

## Testing

```bash
npm run verify:contracts   # architecture and data contracts
npm test                   # unit tests
npm run test:ui            # Playwright: every screen and control, desktop + mobile
npm run validate:seeds     # exam data schema
npm run bench:schreiben    # Schreiben grading diagnostics
```

All commands: [quality gates](docs/architecture/quality-gates.md#command-reference).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — overview and map of [`docs/architecture/`](docs/architecture/): frontend, data and storage, Schreiben grading, linguistic engine, teacher assignments, quality gates.
- [ADDING_QUESTIONS.md](ADDING_QUESTIONS.md) — how to write and validate a new exam variant.
- [CREDITS.md](CREDITS.md) — libraries, models, fonts and language data with their authors and licenses.

License: MIT (see `LICENSE`); bundled language data is CC BY-SA 4.0 (see `CREDITS.md`).
