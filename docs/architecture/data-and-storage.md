# Data and storage

[← Architecture overview](../../ARCHITECTURE.md) · [Quality gates →](quality-gates.md)

There is no server, API or database: exam data is bundled, answers are graded in the browser, results stay in `localStorage`.

**Contents:** [Exam data](#exam-data) · [Exam service](#exam-service) · [Module rules](#module-rules) · [Local storage](#local-storage) · [Offline and PWA](#offline-and-pwa) · [Delivery](#delivery)

---

## Exam data

- `src/data/exams/seeds/*.js` — one file per variant (`modellsatz-N.js` for Lesen, `schreiben-modellsatz-N.js`, `stubs-modules.js` for modules not yet built). Each exports `exam` and `questions`. Format: [ADDING_QUESTIONS.md](../../ADDING_QUESTIONS.md).
- `src/data/exams/seedData.js` — barrel that imports all seeds, sets `sort_order` and applies the module rules; bundled as the lazy `exam-seeds` chunk.
- `scripts/seeds/validateSeeds.js` (`npm run validate:seeds`) — build-time schema validator, not shipped to the browser.

## Exam service

`src/services/examService.js` is the hooks' only data port: `fetchTestTypes`, `fetchExams`, `fetchExamDetails`, `submitExamAnswers`, `preloadExamGrading`. It delegates to `localDataService.js` (bundled seeds) and grades with `src/services/evaluation/examEvaluator.js` (Lesen answer keys, Schreiben via `schreibenEvaluator.js` → [Schreiben grading](schreiben-grading.md)). No `fetch`, no `/api/*`. The grading engine and lexicon are imported dynamically on first submit or idle preload.

## Module rules

`shared/testTypes.js` is the single source of module-wide rules (reglament §3): time limit, number of tasks, max and pass score. `applyModuleRules()` overwrites these fields on every exam, so seeds carry content only and the browser, validator and scoring see identical values.

| Module | Tasks | Time | Max | Pass |
|---|---|---|---|---|
| Lesen | 15 | 25 min | 15 | 9 |
| Hören | 15 | 20 min | 15 | 9 |
| Schreiben | 6 (5 form fields + letter) | 20 min | 15 (5 + 10) | 9 |
| Sprechen | 3 | 15 min | 15 | 9 |

Hören and Sprechen are stubs.

## Local storage

Attempt history uses the strategy pattern: `storage/attemptStorage.interface.js` (`AttemptStorageInterface`: `getAttempts`, `saveAttempt`, `deleteAttempt`, `clearAttempts`) with `LocalStorageAttemptStorage` (default, max 150 attempts) and `MemoryAttemptStorage` (tests); factory `storage/index.js` → `createAttemptStorage`.

| Key | Owner | Content |
|---|---|---|
| `telc_exam_attempts_v1` | `LocalStorageAttemptStorage` | attempt history |
| `telc_assignments` | `receivedAssignmentsStorage` | tasks received by a student |
| `telc_issued` | `issuedAssignmentsStorage` | tasks issued by a teacher |
| `telc_assignment_lockout_<id>` | `assignmentLockoutStorage` | start/submission of one task |
| `telc_teacher_key` | `teacherSecurityService` | HMAC key |
| `telc_welcome_role`, `telc_app_language`, `telc_app_theme`, `telc_exam_font` | UI hooks | preferences |
| `telc_ai_provider_override`, `telc_enable_generative_llm`, `telc_enable_ab_testing_ui`, `telc_ab_grading_history` | AI config | developer switches |

Nothing is sent anywhere: no telemetry, no user id, no remote attempt storage.

## Offline and PWA

- `public/sw.js` precaches the app shell and caches assets on first use (including the lexicon dictionaries); registered by `services/pwaRegister.js` only in a secure context.
- EmbeddingGemma weights are downloaded at run time from Hugging Face and cached by the browser (CacheStorage/IndexedDB via Transformers.js); without them grading falls back to the limited deterministic mode.

## Delivery

The same `dist/` runs everywhere:
- **GitHub Pages** — `.github/workflows/deploy.yml` (Node 22: `npm ci`, `npm test`, `npm run build`). All asset paths are relative, so the app works under a repository subpath.
- **Docker** — `Dockerfile` + `docker/nginx/`: builds `dist/` and serves it with unprivileged nginx on 8080; HTTPS on 8443 when `certs/cert.pem` and `certs/key.pem` are mounted (a secure context for phones on the LAN).
- **Local** — `npm run preview`.
