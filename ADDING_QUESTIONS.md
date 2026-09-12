# Guide to Adding New telc Deutsch A1 (Lesen) Exam Sets

This document provides comprehensive guidelines, data structures, linguistic requirements, and examples for generating new practice test sets for the **telc Deutsch A1 / Start Deutsch 1 (Leseverstehen)** exam.

Use this guide as a prompt and specification for an AI agent or educator when creating new exam sets (Modellsatz 11, 12, ...).

---

## 1. Official telc A1 — Lesen Exam Structure

Each new set **MUST** contain exactly **15 tasks (Aufgaben 1–15)**, divided into 3 parts:

| Part | Task Numbers | Material Type | Answer Format | Format Specifics |
|---|---|---|---|---|
| **Teil 1** | Tasks 1–5 | 2 short texts (emails, personal letters, school/hotel memos) | **Richtig (+)** / **Falsch (-)** | Text 1 contains 2 questions (1–2), Text 2 contains 3 questions (3–5). |
| **Teil 2** | Tasks 6–10 | 5 real-life situations + 2 websites/ads per situation | **a** or **b** | Select the website that 100% matches the situation's criteria. The second option is a distractor with a subtle mismatch. |
| **Teil 3** | Tasks 11–15 | 5 short notices, door signs, public signage (Schilder, Aushänge) | **Richtig (+)** / **Falsch (-)** | Exactly 1 statement per notice: determine whether it is True or False. |

- **Time Limit**: exactly **25 minutes** (`time_limit_minutes: 25`).
- **Maximum Score**: **15 points** (1 task = 1 point).
- **Passing Score**: **9 out of 15** (60%).

---

## 2. Linguistic Standards & Level A1 Requirements (GER / CEFR)

When generating texts, strictly adhere to the A1 vocabulary and grammar standards:

1. **A1 Grammar**:
   - Tenses: primarily Präsens, basic Perfekt with auxiliary verbs *haben* and *sein* (*hat angerufen*, *ist gefahren*).
   - Modal verbs: *können*, *müssen*, *wollen*, *dürfen*, *möchten*.
   - Imperative: polite form (*Bringen Sie bitte mit*, *Rufen Sie an*).
   - Prepositions of time and place: *am Montag*, *um 14 Uhr*, *von... bis...*, *ab 18 Uhr*, *vor dem Eingang*, *neben der Post*.
   - **PROHIBITED**: complex Konjunktiv II (except polite forms like *hätte / wäre / möchte / könnte*), past passive voice, complex subordinate clauses with advanced conjunctions, Genitive case (use *von + Dativ* instead).

2. **Authenticity & Realism**:
   - Authentic German names (*Stefan, Sabine, Markus, Elena, Herr/Frau Weber, Becker, Müller*).
   - Authentic German cities and locations (*Berlin, München, Köln, Hamburg, Frankfurt, Ostsee, Marienplatz, Hauptbahnhof*).
   - Realistic German formats for time (24-hour: *09:30 Uhr*, *18:00 Uhr*), dates (*14. Oktober*), phone numbers, and web domains (*.de*).
   - German typography: umlauts (ä, ö, ü, Ä, Ö, Ü) and the letter **ß** (*Straße, schließen, Gruß*).

3. **Answer Balance**:
   - In Teil 1 and Teil 3, answers should be evenly balanced (~50% `richtig`, 50% `falsch`).
   - In Teil 2, answers should alternate between `a` and `b` (e.g., 2–3 `a` and 2–3 `b`).

---

## 3. Methodological Rules for Designing Tasks and Traps (Fallen)

### 📌 Teil 1 (Letters & Emails)
- Texts should be 50–90 words long.
- **Typical Topics**:
  - Invitation to a birthday party, housewarming, barbecue, or picnic.
  - Booking confirmation for a hotel, language course, or tickets.
  - Information from a language school (start time, textbook purchase, placement test).
- **Exam Traps**:
  - *Who buys/brings what*: The author writes "I have already bought the food, please only bring music", statement claims "The recipient must bring food" (**Falsch**).
  - *Days of the week*: "Classes run Monday through Thursday, no lessons on Friday", statement claims "Classes run Monday through Friday" (**Falsch**).
  - *Times*: Meeting at 8:45, lessons start at 9:00, statement: "They meet before 9:00" (**Richtig**).

### 📌 Teil 2 (Situations & Website Choice a / b)
- The situation description follows standard phrasing: "Sie möchten... / Sie suchen...".
- Must contain **2–3 key criteria** (e.g., 1. bicycle; 2. used/inexpensive; 3. purchase rather than rent).
- **Distractor Traps**:
  - Looking to buy a used bike — Website "a" offers only short-term rentals (Verleih).
  - Looking for weekend swimming lessons for adults — Website "b" offers lessons only for children under 6 on weekdays.
  - Wanting vegetarian food on Sunday — Website "a" serves pork knuckles, while Website "b" is a 100% vegetarian organic cafe open on Sundays.
  - Traveling by train with a bicycle — Website "b" offers an intercity bus where bicycles are not permitted.

### 📌 Teil 3 (Signs, Door Plaques & Notices)
- Short texts of 20–40 words simulating real notices posted on walls, doors, or bulletin boards.
- **Typical Contexts**:
  - Doctor's office door notice (vacation, substitute doctor with contact details).
  - Department store elevator notice (maintenance, elevator out of service: "außer Betrieb", please use the stairs).
  - Bakery or cafe sign (cash only: "keine Kartenzahlung", or special Sunday hours).
  - Dormitory or swimming pool rules (quiet hours: "Ruhezeiten", no jumping from the edge).
  - Public transit announcement (tram replacement bus service due to track repairs).
- **Key A1 Vocabulary for Testing**:
  - *außer Betrieb / defekt / kaputt* (out of order / broken)
  - *geschlossen* (closed) vs. *geöffnet* (open)
  - *nicht erlaubt / verboten* (forbidden / not allowed) vs. *erlaubt / gestattet* (permitted)
  - *nur bar zahlen / keine Kartenzahlung* (cash only / no card payment)
  - *kostenlos / gratis* (free of charge)

---

## 4. Data Architecture & Schema Specification

Exam data is organized in a modular structure:

- **`server/seeds/modellsatz-N.js`** — one file per exam variant, exports `exam` object and `questions` array.
- **`server/seed-data.js`** — barrel aggregator that imports all seed modules and exports a combined `seedData` object.
- **`server/database/seeder.js`** — reads `seedData` and writes to SQLite via `INSERT OR REPLACE`.

When adding a new test variant, create a new file in `server/seeds/` and register it in `server/seed-data.js`.

### Exam Object Schema (`exams`):
```javascript
{
  id: 'modellsatz-3', // unique ID: modellsatz-N
  title: 'telc Deutsch A1 — Modellsatz 3',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Brief description for the user.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9
}
```

### Question Schema for Teil 1 (E-Mails & Briefe):
```javascript
{
  id: 'm3-q1', // ID format: m{N}-q{number}
  exam_id: 'modellsatz-3',
  teil: 1,
  question_number: 1, // 1 to 5
  title: 'E-Mail von Laura an Thomas',
  context_header: 'Von: Laura <laura.k@webmail.de>\nAn: Thomas <thomas.b@gmx.de>\nDatum: 10. Mai\nBetreff: Umzug am Samstag',
  context_body: `Hallo Thomas,\n\nam Samstag ziehe ich um...`,
  statement: 'Thomas soll Laura beim Umzug helfen.', // statement in German
  correct_answer: 'richtig', // strictly 'richtig' or 'falsch'
  clue_quote: 'Kannst du mir bitte ab 10 Uhr beim Tragen helfen?', // exact quote from text
  explanation_en: 'Laura asks for help with carrying items ("beim Tragen helfen") at 10:00. The statement is True.',
  explanation_ru: 'Лаура просит помочь носить вещи («beim Tragen helfen») с 10:00. Утверждение верно (Richtig).',
  explanation_de: 'Laura bittet ab 10 Uhr um Hilfe beim Tragen.',
  vocabulary_notes: [
    { word: 'beim Umzug helfen', translation: 'помогать при переезде', translation_en: 'help with moving' },
    { word: 'tragen', translation: 'носить / таскать', translation_en: 'to carry / haul' }
  ]
}
```

### Question Schema for Teil 2 (Webseiten & Anzeigen):
```javascript
{
  id: 'm3-q6',
  exam_id: 'modellsatz-3',
  teil: 2,
  question_number: 6, // 6 to 10
  title: 'Aufgabe 6',
  situation: 'Sie möchten am Samstagabend in Berlin mit Freunden tanzen gehen.', // situation description
  options_json: [
    {
      id: 'a',
      badge: 'www.club-disco-berlin.de', // realistic URL
      title: 'Club Nightlife Berlin',
      text: 'Jeden Samstag ab 22:00 Uhr große Tanzparty mit DJs auf 3 Floors. Cocktails und beste Musik.',
      details: 'Musik: Dance & Pop • Geöffnet: Sa ab 22 Uhr'
    },
    {
      id: 'b',
      badge: 'www.kammermusik-saal-berlin.de',
      title: 'Klassische Konzerte im Kammermusiksaal',
      text: 'Erleben Sie ruhige klassische Konzerte am Samstagnachmittag um 15:00 Uhr. Keine Tanzveranstaltung.',
      details: 'Musik: Klassik • Nur Sitzplätze'
    }
  ],
  correct_answer: 'a', // strictly 'a' or 'b'
  clue_quote: 'Jeden Samstag ab 22:00 Uhr große Tanzparty ... Cocktails und beste Musik.',
  explanation_en: 'Option (a) offers a dance party on Saturday night, matching the request. Option (b) is an afternoon classical concert without dancing.',
  explanation_ru: 'Вариант (a) предлагает танцевальную вечеринку в субботу вечером. Вариант (b) — дневной концерт классической музыки без танцев.',
  explanation_de: 'Gesucht wird eine Tanzgelegenheit am Samstagabend. Anzeige a bietet eine Party an.',
  vocabulary_notes: [
    { word: 'tanzen gehen', translation: 'to go dancing' },
    { word: 'die Veranstaltung', translation: 'event' }
  ]
}
```

### Question Schema for Teil 3 (Schilder & Aushänge):
```javascript
{
  id: 'm3-q11',
  exam_id: 'modellsatz-3',
  teil: 3,
  question_number: 11, // 11 to 15
  title: 'Hinweisschild an der Eingangstür einer Zahnarztpraxis',
  context_header: 'Zahnarztpraxis Dr. Meier',
  context_body: `Liebe Patientinnen und Patienten,\n\nunsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.\nVertretung: Dr. Frank, Marktstraße 8, Tel. 089/123456.`,
  statement: 'Man kann am 18. Juli von Dr. Meier behandelt werden.',
  correct_answer: 'falsch', // strictly 'richtig' or 'falsch'
  clue_quote: 'unsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.',
  explanation_en: 'The practice is closed for renovations from July 15 to 22 ("geschlossen"). Treatment on July 18 is not possible. The statement is False.',
  explanation_ru: 'Практика закрыта на ремонт с 15 по 22 июля («geschlossen»). Приём 18 июля невозможен. Утверждение неверно (Falsch).',
  explanation_de: 'Die Praxis ist bis 22. Juli geschlossen.',
  vocabulary_notes: [
    { word: 'geschlossen', translation: 'closed' },
    { word: 'die Vertretung', translation: 'substitution / duty doctor' }
  ]
}
```

---

## 5. Step-by-Step Guide to Adding a New Test to the Application

Once a new exam set is prepared:

### Step 1: Create a new seed file in `server/seeds/`

Create `server/seeds/modellsatz-N.js` with the exam metadata and 15 questions:

```javascript
export const exam = {
  id: 'modellsatz-N',
  title: 'telc Deutsch A1 — Modellsatz N',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Practice test N for telc Deutsch A1.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9
};

export const questions = [
  // mN-q1 through mN-q15
];
```

### Step 2: Register in the aggregator

Add the import and entries in `server/seed-data.js`:

```javascript
import { exam as examN, questions as questionsN } from './seeds/modellsatz-N.js';

export const seedData = {
  exams: [
    // ... existing exams
    { ...examN, sort_order: N },
  ],
  questions: [
    // ... existing questions
    ...questionsN,
  ]
};
```

### Step 3: Update the SQLite Database
When the server starts, `initDatabase()` is called. To force a refresh of the database with the new records:
- Either remove the database file `data/telc_a1.db` (it will be automatically re-created and seeded):
   ```bash
   rm data/telc_a1.db
   ```
- Or run `initDatabase()` via Node:
   ```bash
   node -e "import('./server/db.js').then(m => m.initDatabase())"
   ```

### Step 4: Verification
Check via the terminal that all 15 questions of the new test are correctly loaded:
```bash
node -e "import('./server/db.js').then(m => {
  const count = m.db.prepare('SELECT COUNT(*) as c FROM questions WHERE exam_id = ?').get('modellsatz-N');
  console.log('Modellsatz N questions:', count.c);
})"
```
The expected output is: `Modellsatz N questions: 15`.

Then start the application:
```bash
npm start
```
The new test variant will automatically appear in the exam selector dropdown in the header!

### Multilingual Explanations Standards
Explanations must be provided in all supported UI languages:
- **`explanation_en`**: Clear, factual explanation in English.
- **`explanation_ru`**: Clear, factual explanation in Russian.
- **`explanation_de`**: Concise German confirmation referencing the key clue.

**Tone and Content Guidelines**:
- **Factual and clue-driven**: Focus on the concrete evidence from `clue_quote`. Avoid conversational fluff ("Забавно, но автор имеет в виду...").
- **Clear contrast**: State clearly what the source text specifies vs. what the statement claims (e.g. "Classes run Monday to Thursday, not Friday. The statement is False.").
- **For Teil 2**: Explain why option `a` or `b` fulfills the requirements and highlight the subtle mismatch in the rejected distractor.

---

## 6. Quality Checklist Before Adding

Before saving a new set, verify:
- [ ] Exactly 15 questions: Teil 1 (5 items), Teil 2 (5 items), Teil 3 (5 items).
- [ ] Accurate clue quote `clue_quote` provided for every question.
- [ ] Multilingual explanations provided in all supported languages: `explanation_en`, `explanation_ru`, and `explanation_de`.
- [ ] Explanations are factual, concise, and highlight key clues without excessive filler.
- [ ] Core A1 vocabulary cards `vocabulary_notes` included.
- [ ] Balanced `richtig` / `falsch` answers in Teil 1 and Teil 3.
- [ ] In Teil 2, both options (`a` and `b`) are plausible, but exactly one is correct.
- [ ] No grammatical errors or typos in the German text.

---

## 7. Current Exam Variants

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
