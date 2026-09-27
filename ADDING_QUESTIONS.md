# Adding an exam variant (Lesen & Schreiben)

A self-contained guide for writing a new **telc Deutsch A1 / Start Deutsch 1** practice variant — for a person or an AI agent. Scoring rules come from `shared/testTypes.js`; content rules from the official format.

**Contents:** [Modules](#1-modules) · [A1 language rules](#2-a1-language-rules) · [Exam object](#3-exam-object) · [Lesen questions](#4-lesen-questions) · [Schreiben questions](#5-schreiben-questions) · [Register and validate](#6-register-and-validate)

---

## 1. Modules

| Module (`test_type`) | Parts | Tasks | Format | Time | Max | Pass |
|---|---|---|---|---|---|---|
| Lesen (`lesen`) | Teil 1–3 | 15 | richtig/falsch, a/b | 25 min | 15 | 9 |
| Schreiben (`schreiben`) | Teil 1–2 | 6 | 5 form fields + 1 letter | 20 min | 15 (5 + 10) | 9 |

Time, task count, max and pass score are **module rules**: `applyModuleRules()` sets them on every exam. Do not put them into the seed.

## 2. A1 language rules

- **Grammar**: Präsens; basic Perfekt with *haben*/*sein*; modal verbs (*können, müssen, wollen, dürfen, möchten*); polite imperative (*Rufen Sie an*); simple prepositional phrases (*am Montag, um 14 Uhr, von … bis …*). No Konjunktiv II except *möchte/hätte/wäre*, no passive, no genitive (use *von* + Dativ), no complex subordinate clauses.
- **Authenticity**: German names, times (*09:30 Uhr*), dates (*14. Oktober*), phone numbers, `.de` domains; umlauts and **ß**.
- **Answer balance**: Teil 1 and 3 roughly 50/50 `richtig`/`falsch`; Teil 2 two or three of each `a`/`b`.

## 3. Exam object

Every seed file exports `exam` and `questions`:

```javascript
export const exam = {
  id: 'modellsatz-11',                 // 'modellsatz-N' (Lesen) or 'schreiben-modellsatz-N'
  title: 'telc Deutsch A1 — Modellsatz 11',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Practice test 11 for telc Deutsch A1.',
  test_type: 'lesen',                  // 'lesen' | 'schreiben'
  sort_order: 11
};
```

**Fields common to every question**: `id` (unique across all seeds, e.g. `m11-q1`, `s5-q1`), `exam_id`, `teil`, `question_number`, `title`, `correct_answer`, `clue_quote` (verbatim from the source text), `explanation_ru`, `explanation_en`, `explanation_de`, `vocabulary_notes: [{ word, translation, translation_en }]` (non-empty).

## 4. Lesen questions

**Teil 1 (1–5)** — two short e-mails; text 1 has questions 1–2, text 2 has 3–5:

```javascript
{
  id: 'm11-q1', exam_id: 'modellsatz-11', teil: 1, question_number: 1,
  title: 'E-Mail von Laura an Thomas',
  context_header: 'Von: Laura <laura.k@webmail.de>\nAn: Thomas <thomas.b@gmx.de>\nBetreff: Umzug am Samstag',
  context_body: 'Hallo Thomas,\n\nam Samstag ziehe ich um. Kannst du mir bitte ab 10 Uhr beim Tragen helfen?',
  statement: 'Thomas soll Laura beim Umzug helfen.',
  correct_answer: 'richtig',           // 'richtig' | 'falsch'
  clue_quote: 'Kannst du mir bitte ab 10 Uhr beim Tragen helfen?',
  explanation_ru: '…', explanation_en: '…', explanation_de: '…',
  vocabulary_notes: [{ word: 'beim Umzug helfen', translation: 'помогать при переезде', translation_en: 'help with moving' }]
}
```

**Teil 2 (6–10)** — a situation and two web pages:

```javascript
{
  id: 'm11-q6', exam_id: 'modellsatz-11', teil: 2, question_number: 6,
  title: 'Aufgabe 6',
  situation: 'Sie möchten am Samstagabend in Berlin mit Freunden tanzen gehen.',
  options_json: [                      // exactly two, ids 'a' and 'b'
    { id: 'a', badge: 'www.club-disco-berlin.de', title: 'Club Nightlife Berlin',
      text: 'Jeden Samstag ab 22:00 Uhr große Tanzparty.', details: 'Sa ab 22 Uhr' },
    { id: 'b', badge: 'www.kammermusik-berlin.de', title: 'Klassische Konzerte',
      text: 'Konzerte am Samstagnachmittag um 15:00 Uhr.', details: 'Nur Sitzplätze' }
  ],
  correct_answer: 'a',                 // 'a' | 'b'
  clue_quote: 'Jeden Samstag ab 22:00 Uhr große Tanzparty.',
  /* explanations, vocabulary_notes */
}
```

**Teil 3 (11–15)** — public notices; same fields as Teil 1 (`context_header` = where the sign hangs, `context_body` = its text, `statement`, `richtig`/`falsch`).

## 5. Schreiben questions

**Teil 1 (1–5)** — one form field per question:

```javascript
{
  id: 's5-q1', exam_id: 'schreiben-modellsatz-5', teil: 1, question_number: 1,
  title: 'Anmeldung Hotel • Familienname',
  situation: 'Ihre Freundin Eva Bauer macht Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Formulars.',
  context_header: 'Ausgangssituation',
  context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. …',
  statement: 'Feld (1) — Familienname der Gäste:',
  options_json: { form_label: 'Familienname', accepted_answers: ['bauer', 'familie bauer', 'frau bauer'] }, // lower case
  correct_answer: 'bauer',
  clue_quote: 'Ihre Freundin Eva Bauer wohnt in Köln',
  /* explanations, vocabulary_notes */
}
```

**Teil 2 (6)** — the letter. The rubric is **grading data**: the engine reads only these fields, never the label wording.

```javascript
{
  id: 's5-q6', exam_id: 'schreiben-modellsatz-5', teil: 2, question_number: 6,
  level: 'A1',                         // required: selects regulation, ranker policy, grammar profile
  title: 'Teil 2 • E-Mail an eine Sprachschule',
  situation: 'Sie möchten im August einen Deutschkurs an der Sprachschule „Aktiv“ besuchen.',
  context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
  context_body: '1. Grund für Ihr Schreiben\n2. Wann und wie lange\n3. Frage nach Kurskosten und Anmeldung',
  statement: 'Schreiben Sie eine E-Mail (ca. 30 Wörter). Schreiben Sie zu jedem Punkt ein bis zwei Sätze.',
  options_json: {
    type: 'essay',
    min_words: 30,
    leitpunkte: ['Grund für Ihr Schreiben', 'Wann und wie lange', 'Frage nach den Kurskosten und Anmeldung'],
    rubric: {
      leitpunkte_criteria: [
        { id: 'lp1', label: 'Grund für Ihr Schreiben', intent: 'REASON_EXPLANATION',
          keywords: ['deutschkurs', 'kurs', 'sprachschule', 'august', 'besuchen'], requiredMatches: 2 },
        { id: 'lp2', label: 'Wann und wie lange', intent: 'GENERAL', evidence: 'temporal',
          keywords: ['wochen', 'zeit', 'vormittags', 'termin'], requiredMatches: 2 },
        { id: 'lp3', label: 'Frage nach den Kurskosten und Anmeldung', intent: 'INFORMATION_REQUEST',
          keywords: ['kosten', 'kostet', 'gebühr', 'preis', 'anmelden', 'anmeldung', 'wie viel'], requiredMatches: 2,
          aspects: [{ label: 'Kosten', keywords: ['kosten', 'kostet', 'gebühr', 'preis', 'wie viel'] },
                    { label: 'Anmeldung', keywords: ['anmelden', 'anmeldung'] }] }
      ]
    },
    sample_solution: 'Sehr geehrte Damen und Herren,\n\nich möchte im August …\n\nMit freundlichen Grüßen\nMaria Ivanova',
    breakdown: [{ label: 'Anrede', text: 'Sehr geehrte Damen und Herren,' } /* …one entry per part */]
  },
  correct_answer: 'musterloesung',
  clue_quote: 'Sehr geehrte Damen und Herren, ich möchte im August …',
  /* explanations, vocabulary_notes */
}
```

Rubric fields:

| Field | Meaning |
|---|---|
| `keywords` | task words, lower case; one lemma in several spellings counts as one concept; multi-word keywords allowed |
| `requiredMatches` | distinct concepts needed for full coverage |
| `intent` | speech act: `DEFECT_REPORT`, `ACTION_REQUEST`, `APPOINTMENT_CANCEL`, `APPOINTMENT_PROPOSAL`, `INFORMATION_REQUEST`, `REASON_EXPLANATION`, `GENERAL` |
| `evidence` (optional) | what a detector must prove: `temporal`, `personCount`, `occupation` — on the criterion or an aspect |
| `aspects` (optional) | parts of a compound point; full points only when every aspect is covered. `keywords` optional (label and concept domains are used otherwise) |

How these fields are used: [Schreiben grading](docs/architecture/schreiben-grading.md#leitpunkt-coverage).

## 6. Register and validate

1. Put the file into `src/data/exams/seeds/`.
2. Register it in `src/data/exams/seedData.js`:
   ```javascript
   import { exam as exam11, questions as questions11 } from './seeds/modellsatz-11.js';
   // exams:     { ...exam11, sort_order: 11 },
   // questions: ...questions11,
   ```
3. Check:
   ```bash
   npm run validate:seeds     # schema: fields, answer enums, explanations, duplicate ids, clue_quote in text (warning)
   npm run verify:contracts   # Schreiben rubric: level, intent, evidence
   npm test
   ```
4. For a Schreiben variant, add a few letters to `tests/fixtures/schreiben-regression/` and look at `npm run bench:schreiben` ([quality gates](docs/architecture/quality-gates.md#schreiben-benchmarks)).
