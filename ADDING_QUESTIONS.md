# Specification & Guide: telc Deutsch A1 Exam Sets (Lesen & Schreiben)

This document is a **self-contained specification** for generating new practice test sets for **telc Deutsch A1 / Start Deutsch 1**.
An AI agent or educator should be able to generate completely valid, schema-compliant exam variants by following this document alone, without inspecting other files in the codebase.

---

## 1. Exam Modules Overview

The application supports two primary official exam modules:

| Module | Parts | Tasks | Format | Duration | Max Points | Pass Benchmark |
|---|---|---|---|---|---|---|
| **Lesen** (`test_type: 'lesen'`) | Teil 1, 2, 3 | 15 items | Binary (+ / -) & Matching (a / b) | 25 min | 15 pts | 9 pts (60%) |
| **Schreiben** (`test_type: 'schreiben'`) | Teil 1, 2 | 6 items | 5 Form fields + 1 Email essay | 15 min | 15 pts | 9 pts (60%) |

---

## 2. Linguistic Standards (CEFR Level A1)

Strictly adhere to the A1 vocabulary and grammar standards:
1. **Grammar**:
   - Tenses: primarily Präsens; basic Perfekt with *haben* and *sein* (*hat angerufen*, *ist gefahren*).
   - Modal verbs: *können*, *müssen*, *wollen*, *dürfen*, *möchten*.
   - Imperative: polite form (*Bringen Sie bitte mit*, *Rufen Sie an*).
   - Prepositions: *am Montag*, *um 14 Uhr*, *von... bis...*, *ab 18 Uhr*, *vor dem Eingang*.
   - **PROHIBITED**: Konjunktiv II (except polite *möchte / hätte / wäre*), passive voice, complex subclauses, genitive (use *von + Dativ*).
2. **Authenticity**:
   - Authentic German names (*Sabine, Markus, Elena, Herr/Frau Müller*).
   - German time (*09:30 Uhr*, *18:00 Uhr*), dates (*14. Oktober*), phone numbers, web domains (*.de*).
   - German typography: umlauts (ä, ö, ü, Ä, Ö, Ü) and **ß** (*Straße, schließen*).
3. **Answer Balance**:
   - In Lesen Teil 1 and 3, balance `richtig` and `falsch` (~50/50).
   - In Lesen Teil 2, balance `a` and `b` (2 to 3 of each).

---

## 3. Data Architecture & Schemas

### 3.1 Exam Metadata Schema (`exam`)

Every seed file must export an `exam` object:

```javascript
export const exam = {
  id: 'modellsatz-11',                    // Unique ID: 'modellsatz-N' or 'schreiben-modellsatz-N'
  title: 'telc Deutsch A1 — Modellsatz 11',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Practice test 11 for telc Deutsch A1.',
  test_type: 'lesen',                     // 'lesen' | 'schreiben' | 'hoeren' | 'sprechen'
  time_limit_minutes: 25,                 // 25 for Lesen, 15 for Schreiben
  total_questions: 15,                    // 15 for Lesen, 6 for Schreiben
  pass_score: 9,                          // 9 points required to pass
  sort_order: 11                          // Positive integer for ordering
};
```

---

### 3.2 Question Schema: Lesen (Aufgaben 1–15)

#### Teil 1 (Aufgaben 1–5): 2 short emails/letters, Richtig/Falsch
Text 1 has 2 questions (1–2), Text 2 has 3 questions (3–5).
```javascript
{
  id: 'm11-q1',
  exam_id: 'modellsatz-11',
  teil: 1,
  question_number: 1,
  title: 'E-Mail von Laura an Thomas',
  context_header: 'Von: Laura <laura.k@webmail.de>\nAn: Thomas <thomas.b@gmx.de>\nDatum: 10. Mai\nBetreff: Umzug am Samstag',
  context_body: `Hallo Thomas,\n\nam Samstag ziehe ich um. Kannst du mir bitte ab 10 Uhr beim Tragen helfen?`,
  statement: 'Thomas soll Laura beim Umzug helfen.',
  correct_answer: 'richtig',              // strictly 'richtig' or 'falsch'
  clue_quote: 'Kannst du mir bitte ab 10 Uhr beim Tragen helfen?',
  explanation_ru: 'Лаура просит помочь носить вещи с 10:00. Утверждение верно (Richtig).',
  explanation_en: 'Laura asks for help carrying items at 10:00. The statement is True.',
  explanation_de: 'Laura bittet ab 10 Uhr um Hilfe beim Tragen.',
  vocabulary_notes: [
    { word: 'beim Umzug helfen', translation: 'помогать при переезде', translation_en: 'help with moving' }
  ]
}
```

#### Teil 2 (Aufgaben 6–10): Situation + 2 Website Ads (a / b)
```javascript
{
  id: 'm11-q6',
  exam_id: 'modellsatz-11',
  teil: 2,
  question_number: 6,
  title: 'Aufgabe 6',
  situation: 'Sie möchten am Samstagabend in Berlin mit Freunden tanzen gehen.',
  options_json: [
    {
      id: 'a',
      badge: 'www.club-disco-berlin.de',
      title: 'Club Nightlife Berlin',
      text: 'Jeden Samstag ab 22:00 Uhr große Tanzparty mit DJs auf 3 Floors.',
      details: 'Musik: Dance & Pop • Geöffnet: Sa ab 22 Uhr'
    },
    {
      id: 'b',
      badge: 'www.kammermusik-berlin.de',
      title: 'Klassische Konzerte',
      text: 'Ruhige klassische Konzerte am Samstagnachmittag um 15:00 Uhr.',
      details: 'Musik: Klassik • Nur Sitzplätze'
    }
  ],
  correct_answer: 'a',                    // strictly 'a' or 'b'
  clue_quote: 'Jeden Samstag ab 22:00 Uhr große Tanzparty mit DJs auf 3 Floors.',
  explanation_ru: 'Вариант (a) предлагает танцевальную вечеринку в субботу вечером.',
  explanation_en: 'Option (a) offers a Saturday dance party, matching the criteria.',
  explanation_de: 'Anzeige a bietet eine Tanzparty am Samstagabend.',
  vocabulary_notes: [
    { word: 'tanzen gehen', translation: 'идти танцевать', translation_en: 'to go dancing' }
  ]
}
```

#### Teil 3 (Aufgaben 11–15): Public Notices & Signs, Richtig/Falsch
```javascript
{
  id: 'm11-q11',
  exam_id: 'modellsatz-11',
  teil: 3,
  question_number: 11,
  title: 'Hinweisschild an der Eingangstür einer Zahnarztpraxis',
  context_header: 'Zahnarztpraxis Dr. Meier',
  context_body: `Liebe Patientinnen und Patienten,\n\nunsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.\nVertretung: Dr. Frank, Marktstraße 8.`,
  statement: 'Man kann am 18. Juli von Dr. Meier behandelt werden.',
  correct_answer: 'falsch',               // strictly 'richtig' or 'falsch'
  clue_quote: 'unsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.',
  explanation_ru: 'Практика закрыта на ремонт с 15 по 22 июля. Приём 18 июля невозможен.',
  explanation_en: 'The practice is closed July 15-22. Treatment on July 18 is impossible.',
  explanation_de: 'Die Praxis ist bis 22. Juli geschlossen.',
  vocabulary_notes: [
    { word: 'geschlossen', translation: 'закрыто', translation_en: 'closed' }
  ]
}
```

---

### 3.3 Question Schema: Schreiben (Aufgaben 1–6)

#### Teil 1 (Aufgaben 1–5): Hotel / Course Registration Form (5 pts)
```javascript
{
  id: 's3-q1',
  exam_id: 'schreiben-modellsatz-3',
  teil: 1,
  question_number: 1,
  title: 'Anmeldung Hotel • Familienname',
  situation: 'Ihre Freundin Eva Bauer macht Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Formulars.',
  context_header: 'Ausgangssituation',
  context_body: 'Ihre Freundin Eva Bauer wohnt in Köln... Sie möchte für 4 Nächte im Hotel übernachten.',
  statement: 'Feld (1) — Familienname der Gäste:',
  options_json: {
    form_label: 'Familienname',
    accepted_answers: ['bauer', 'familie bauer', 'frau bauer']  // normalized lowercase variants
  },
  correct_answer: 'bauer',
  clue_quote: 'Ihre Freundin Eva Bauer wohnt in Köln',
  explanation_ru: 'Фамилия гостьи — Bauer.',
  explanation_en: 'The guest family name is Bauer.',
  explanation_de: 'Der Familienname lautet Bauer.',
  vocabulary_notes: [
    { word: 'der Familienname', translation: 'фамилия', translation_en: 'family name' }
  ]
}
```

#### Teil 2 (Aufgabe 6): Email with 3 Leitpunkte (10 pts)
```javascript
{
  id: 's3-q6',
  exam_id: 'schreiben-modellsatz-3',
  teil: 2,
  question_number: 6,
  title: 'Teil 2 • E-Mail an eine Sprachschule',
  situation: 'Sie möchten im August einen Deutschkurs an der Sprachschule „Aktiv“ besuchen.',
  context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
  context_body: '1. Grund für Ihr Schreiben\n2. Wann und wie lange\n3. Frage nach Kursgebühren und Anmeldung',
  statement: 'Verfassen Sie eine E-Mail (ca. 30 Wörter). Beachten Sie Anrede, 3 Leitpunkte und Grußformel.',
  options_json: {
    type: 'essay',
    min_words: 30,
    leitpunkte: [
      'Grund für Ihr Schreiben',
      'Wann und wie lange',
      'Frage nach den Kurskosten und Anmeldung'
    ],
    rubric: {
      leitpunkte_criteria: [
        { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'august'], requiredMatches: 2 },
        { id: 'lp2', label: 'Dauer', keywords: ['wochen', 'vormittags', 'zeit'], requiredMatches: 2 },
        { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'anmelden'], requiredMatches: 2 }
      ]
    },
    sample_solution: 'Sehr geehrte Damen und Herren,\n\nich möchte im August einen Deutschkurs A1 machen...',
    breakdown: [
      { label: 'Anrede', text: 'Sehr geehrte Damen und Herren,' },
      { label: 'Punkt 1 (Grund)', text: 'ich möchte im August einen Deutschkurs A1 machen.' },
      { label: 'Punkt 2 (Zeit)', text: 'Ich habe vier Wochen Zeit und möchte vormittags lernen.' },
      { label: 'Punkt 3 (Kosten)', text: 'Wie viel kostet der Kurs?' },
      { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Name]' }
    ]
  },
  correct_answer: 'musterloesung',
  clue_quote: 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs A1 machen...',
  explanation_ru: 'Образцовое письмо уровня A1: обращение, 3 пункта плана и формула вежливости.',
  explanation_en: 'Sample A1 email: formal salutation, 3 guide points covered, polite sign-off.',
  explanation_de: 'Musterlösung mit Anrede, 3 Leitpunkten und Grußformel.',
  vocabulary_notes: [
    { word: 'sich anmelden', translation: 'зарегистрироваться', translation_en: 'to register' }
  ]
}
```

---

## 4. Automated Validation & Verification Pipeline

After generating or modifying exam seeds, follow this strict verification workflow:

### Step 1: Create Seed File
Place the new file in `server/seeds/` (e.g. `modellsatz-11.js`).

### Step 2: Register in Barrel Aggregator
Add imports to [`server/seed-data.js`](file:///Users/artemsmirnov/Projects/telcA1/server/seed-data.js):
```javascript
import { exam as exam11, questions as questions11 } from './seeds/modellsatz-11.js';

export const seedData = {
  exams: [
    // ...
    { ...exam11, sort_order: 11 },
  ],
  questions: [
    // ...
    ...questions11,
  ]
};
```

### Step 3: Run Seed Schema Validator
Run the automated seed validator. You can validate a single file or all seeds:
```bash
# Validate your specific seed file in isolation
node server/database/validate-seeds.js server/seeds/modellsatz-11.js

# Validate all registered seeds
npm run validate:seeds
```
The validator checks:
- Required string and integer fields.
- Question count matches `exam.total_questions`.
- Correct enum answers (`richtig`/`falsch` or `a`/`b`).
- Full trilingual explanations (`ru`, `en`, `de`) and vocabulary notes.
- Verbatim appearance of `clue_quote` in source texts (with whitespace normalization). A mismatch is currently reported as a non-fatal warning; review and resolve it before publishing a variant.
- Absence of duplicate IDs.

### Step 4: Run Test Suite
```bash
npm test
```

### Step 5: Build for Frontend / Production
If changes are to be deployed or tested in the browser:
```bash
npm run build
```
*(Vite bundles `seed-data.js` into `dist/assets/exam-seeds-*.js` for client-side execution).*
