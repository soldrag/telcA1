# Quality gates

[← Architecture overview](../../ARCHITECTURE.md)

What protects the build, and which command to run for what.

**Contents:** [Build gate](#build-gate) · [Contracts](#contracts) · [Unit tests](#unit-tests) · [UI tests](#ui-tests) · [Schreiben benchmarks](#schreiben-benchmarks) · [Command reference](#command-reference)

---

## Build gate

`npm run build` runs `prebuild` first: `npm run verify:contracts && npm test`. Any failure aborts the build. `mainChunkBudgetPlugin` (`vite.config.js`) fails the build when the entry chunk exceeds 300 kB; lazy chunks (AI runtime, seeds, lexicon) have no budget. Watch the build output for `(!) Large chunk`.

## Contracts

`scripts/verify-contracts.js`:
- **Port contracts** in `src/contracts/index.js` (timer, session, loader, assignment, screen DTOs) — method calls and screen props are checked statically.
- `scripts/contracts/rubricContract.js` — every Schreiben rubric has a `level` with registered policy/profile/regulation and valid `intent` / `evidence`.
- `scripts/contracts/levelFreeEngineContract.js` — no level references in engine modules.
- `scripts/contracts/grammarDataContract.js` — shape of the linguistic data; profiles name existing rules.

## Unit tests

`npm test` — Node's built-in test runner over `tests/*.test.js`, with the lexicon preloaded (`tests/support/loadLexiconData.js`). Covers scoring, regulation, linguistic rules, tokens and assignment security, button/flow contracts, i18n keys (`tests/i18n-used-keys.test.js`), lexicon loading in a fresh process (`tests/lexicon-load-entry-points.test.js`).

Schreiben regression suites: `tests/fixtures/schreiben-regression/*.json` — letters with expected official points (`lp`, `kg`, `total`, `accept` ranges for judgment calls), checked by `tests/telc-a1-regulation.test.js` and graded in limited mode by `tests/schreiben-telc-a1-regression.test.js`; known detector gaps are `todo` tests with the diagnosed cause.

## UI tests

- **Playwright** (`npm run test:ui`, `tests/ui/*.spec.js`, `playwright.config.js`): builds the site and serves it like GitHub Pages (`vite preview`; `UI_SKIP_BUILD=1` reuses `dist/`), desktop 1440 px and mobile (Pixel 7) projects. Every control of every screen is clicked; Lesen and Schreiben variants are answered, submitted and reviewed end to end; a teacher assignment goes the whole way `#task=` → submit → `#review=` → «Issued»; settings, legal texts, every interface language and both themes are switched; the layout has no sideways scroll and the page-grid bands (`data-band`) keep their edges at 390 / 800 / 1440 / 1920 px; after the first visit the app opens and grades a Lesen exam offline (service worker). A test fails on page exceptions, console errors, failed requests, any `/api` call and raw i18n keys. `npm run test:ui:headed` for debugging.
- **CI** (`.github/workflows/deploy.yml`): on every push to `main` the suite runs against the freshly built `dist/` (about 2 minutes, one retry); a failure stops the GitHub Pages deploy and uploads the Playwright report and traces as the `playwright-report` artifact.

## Schreiben benchmarks

Diagnostics, not targets: every score change is explained, never tuned towards the expectations (the expectations are agent annotations, not teacher ratings).
- `npm run bench:schreiben` (`scripts/bench-schreiben-leitpunkte.mjs`) — benchmark and gold letters (`tests/fixtures/schreiben-bench/`) and the regression suites in two modes (none / primary Micro-Ranker with local EmbeddingGemma); diff against `baseline.txt`, `--save` stores a new baseline.
- `npm run eval:schreiben` — scorecard over `tests/eval/` (reports in `tests/eval/reports/`, not committed); `npm run test:eval` runs the eval suites.
- `npm run measure:grammar` — grammar hint precision/recall ([linguistic engine](linguistic-engine.md#precision-and-regression-net)).

## Command reference

| Command | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` / `npm run preview` | contracts + tests + build / serve `dist/` |
| `npm run verify:contracts` | contract checks |
| `npm test` | unit tests |
| `npm run test:ui` | Playwright UI suite |
| `npm run validate:seeds` · `node scripts/seeds/validateSeeds.js <file>` | seed schema: all registered seeds / one file |
| `npm run bench:schreiben` · `eval:schreiben` · `measure:grammar` | grading diagnostics |
| `npm run build:lexicon` | regenerate noun/verb dictionaries |
