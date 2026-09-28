# Linguistic engine

[← Architecture overview](../../ARCHITECTURE.md) · [← Schreiben grading](schreiben-grading.md)

The level-independent German analysis behind grammar hints and Leitpunkt evidence. Code: `src/services/schreiben/linguistic/`. No ad-hoc regex patching (CLAUDE.md §8): tokenisation, morphology, topological fields and data tables.

**Contents:** [Layers](#layers) · [Data](#data) · [Lexicon port and dictionaries](#lexicon-port-and-dictionaries) · [Sentence analysis](#sentence-analysis) · [Grammar rules](#grammar-rules) · [Letter zones and letter rules](#letter-zones-and-letter-rules) · [Word order](#word-order) · [Semantic side](#semantic-side) · [Level profile](#level-profile) · [Precision and regression net](#precision-and-regression-net) · [Known limits](#known-limits)

---

## Layers

```
grammarCheckOrchestrator.createGrammarChecker(profile)
  └─ { checkLetter(text), findSalutationDeclensionError(line) }
       ├─ macroSegmenter            → salutation / body sentences / closing
       ├─ topologicalFieldParser    → word order (body sentences)
       ├─ grammarEngine + grammarRules/   → sentence rules
       ├─ letterRules/              → rules on letter zones
       └─ grammarErrorDeduper       → one defect, one error
```

`germanGrammarChecker.js` only binds the orchestrator to the A1 profile for tests and tools. The grading pipeline gets its checker from `levelContext` ([Schreiben grading](schreiben-grading.md#level-context-and-ports)).

## Data

Three kinds of data, three places (CLAUDE.md §5.1):

| Kind | Where | Examples |
|---|---|---|
| General German | `linguistic/data/` | `declensionParadigms.json`, `prepositionContractions.json` (incl. `calendarPrepositionByCategory`), `letterFormulas.json`, `umlautSpelling.json`, `germanSpellingSounds.json` (sound keys, `germanSoundKey.js`), `germanNouns.tsv`, `germanVerbs.tsv` |
| Level | lexicon, profile, policy, regulation | A1 lexicon (`a1Lexicon.json`), `profiles/a1GrammarProfile.js`, `grading/policies/a1ConceptDomains.js` |
| Task | seed rubrics | `keywords`, `intent`, `evidence`, `aspects` |

`scripts/contracts/grammarDataContract.js` checks data shapes (e.g. adjective lemmas are base forms, plural noun lemmas point to the singular).

## Lexicon port and dictionaries

Port: `{ lookup(word), findForms(predicate), tag(tokens), load() }` — `linguistic/a1LexiconService.js` is the A1 implementation.

- **A1 lexicon** — the level vocabulary: gender, number, `plural`, weak masculine `obliqueForm`, verb `objCase` / `ditransitive` / `reflexive` / `prepObject` / `valency: 'SEP'` + `baseVerb`, `verbClass: 'DESIRE'`, `countable`, calendar/duration categories.
- **General dictionaries** (recognition only, `source: 'dictionary'`):
  - `germanNounDictionary.js` + `data/germanNouns.tsv` — ~93k nouns (gender, plural, case forms, weak oblique, adjectival declension) from german-nouns / de.wiktionary;
  - `germanVerbDictionary.js` + `data/germanVerbs.tsv` — ~8k verbs (present, past, participle; regular endings derived; separable verbs keep their base verb) from german-verbs-database. No valency, so no object case is required of them.
  - Built by `npm run build:lexicon` (`scripts/lexicon/`), pinned to source commits, CC BY-SA 4.0 (see `CREDITS.md`).
  - A separate static asset (~680 kB brotli), loaded once asynchronously; `load()` is awaited by every grading entry, lookups stay synchronous and throw if not loaded. Cached by the service worker, so grading works offline afterwards. Tests preload via `node --import ./tests/support/loadLexiconData.js`.
- **Lookup order**: A1 entries first; a capitalised unknown word gets dictionary noun readings; a word with none gets verb readings. `findForms` falls back to dictionary verbs, so corrections exist for them ("Ich spricht" → "spreche"). Nouns without determiner/numeral/adjective drop dictionary readings (names: "Maria kommt").
- **Why no CEFR word list**: there is no openly licensed A1 list (Goethe lists are copyrighted, CEFRLex is NC), so the A1 lexicon stays the level vocabulary and dictionaries only recognise words.
- **Stemming**: `germanStemmer.js` = Snowball German (`@orama/stemmers`); `lemmaStem.stemByLemma(word, lexicon)` stems the lexicon lemma ("kostet" → kosten → `kost`). No task roots in engine code.

## Sentence analysis

| Module | Role |
|---|---|
| `sentenceTokenizer.js`, `a1LexiconService.tagTokens` | tokens + readings; a capitalised verb after a preposition/article is a nominalised noun ("beim Essen") |
| `analysis/nounPhraseChunker.js` | [prep] [det] [cardinal] adj* noun, pronouns, dates; narrows the head to readings its determiner agrees with |
| `morphology/*` | which case/gender/number a form expresses and the form a case requires (from paradigms) |
| `analysis/clauseContext.js` | clause spans, the verb whose frame governs objects |
| `analysis/caseGovernor.js` | required case from the preposition (`prepCase`) or the verb frame; subjects and time adverbials are not governed |
| `grammarEngine.js` | `createGrammarEngine(profile)`: tag and analyse a sentence once, run the profile's rules |

## Grammar rules

`linguistic/grammarRules/`, contract `{ id, check(analysis, { lexicon, policy }) }`:

| Rule | Example |
|---|---|
| `nounPhraseCase` | "ein kleiner Hund" (Akk) → "einen kleinen Hund"; "mit zwei Kinder" → "Kindern" |
| `calendarArticle` | "von 15. Juli" → "vom"; "in Juli" → "im" |
| `numeralPlural`, `countability` | plural after numerals; mass vs count nouns |
| `determinerlessCountNoun` | "einen Deutschkurs machen" |
| `subjectVerbAgreement` | "Die Lehrer kommt" → "kommen"; keeps the tense of the written form |
| `measurePhraseOrder` | "Zeit vier Wochen" → "vier Wochen Zeit" |
| `verbFrame` | reflexive / prepositional object / separable prefix ("mich anmelden", "rufen Sie mich zurück") — only for verbs with lexicon valency |

Also: `verblessClauseChecker.js` (a clause without a verb; an unknown word in a verb slot is not "verbless"), `grammarErrorDeduper.js` (one entry per defect across analyzers, `mergeCandidateGrammarErrors`).

## Letter zones and letter rules

- `data/letterFormulas.json` — salutation and closing formulas as word sequences with register (`*` = inflection ending); the single source for `macroSegmenter.js` and `letter/letterFormulaMatcher.js`. A one-word closing ("Grüße") counts only at a sentence start.
- `letterRules/`, contract `{ id, check(letter, { lexicon, policy, checkSentence }) }`, `letter = { salutation, closing, bodySentences }`:
  - `salutationAgreement` ("Sehr geehrter Herr", "Liebes Praxis-Team");
  - `salutationCommaCase` (lower case after "Hallo Anna,"; nouns and *Sie* keep the capital);
  - `closingFormula` (no comma after the formula; "Mit freundlichen Gruß" → "freundlichem");
  - `nounCapitalization` (a lower-case word whose every reading is a noun);
  - `umlautSpelling` ("fur" → "für"; *ue/ss* spellings are correct).

## Word order

Only the topological parser checks word order (`topologicalFieldParser.js`, `vorfeldChunker.js`, `vorfeldOrderChecker.js`, `subordinateClauseChecker.js`):
- one Vorfeld constituent (a PP after a noun phrase is its attribute; a W-determiner + noun, a date, a number + noun are one constituent); a sentence-initial coordinator is position 0;
- V2 in main clauses, verb-final in subordinate clauses (a W-word or relative pronoun after a comma opens one); a resumptive subject pronoun is `ERR_DOUBLED_SUBJECT`; bracket errors quote the whole bracket;
- Ausklammerung of a PP after the infinitive is allowed on A1 (`strictSatzklammer: false`: "ein Zimmer reservieren für zwei Nächte"); an object there is still flagged.

## Semantic side

Used by Leitpunkt evidence, lexicon injected from `IRankerPolicy.lexicon`:
- `clauseStructureParser.parseSentencePropositions(sentence, { lexicon })` — predicate cores, arguments, direct objects, temporal markers, coordinated clauses;
- `semanticIntentMatcher.js` (`INTENT_POLARITY`), `semanticPolarityValidator.js` (`detectSemanticInversion`), `semanticFrameValidator.js`;
- `criterionRefusalDetector.js`, `criterionRequestTargets.js` (`buildRequestTargets(criterion, lexicon)` → `{ has(word) }`);
- `sentenceMood.js` — question form from clause type (`?`, V1, interrogative in the Vorfeld); only speech acts addressed to the reader get the question bonus.

## Level profile

`profiles/a1GrammarProfile.js`, registry `profiles/index.js` (`getGrammarProfile(level)`): lexicon port, enabled sentence and letter rules, tolerances (A1 accepts the dative after genitive prepositions — "wegen dem"), `strictSatzklammer`, `accuracyWeights`. A2/B1 add a profile, not engine code; `verify:contracts` checks that profiles name existing rules.

## Precision and regression net

Grammar never changes the telc score, so a hint is shown only where the rule is reliable.
- `npm run measure:grammar` — per-rule precision and per-category recall on an independent corpus (`tests/fixtures/grammar/precision/`: correct sentences, single-error learner sentences, debatable cases, annotated without the checker).
- `tests/grammar-precision-corpus.test.js` — no hint at all on the correct sentences.
- `tests/grammar-snapshot.test.js` — pins checker output on every fixture letter (each diff is reviewed); `tests/grammar-targets.test.js` — target cases; `tests/noun-dictionary-regressions.test.js` — dictionary counterexamples.

## Known limits

- A separable prefix placed as a preposition ("Holst du ab mich?") gets a case hint instead of a word-order hint.
- Misspelt verbs get no hint; wrong article gender and wrong prepositions are hardly detected.
- Verbs and adjectives outside the A1 lexicon have no valency; lower-case learner nouns outside the lexicon stay unknown.
