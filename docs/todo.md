# TODO

## Schreiben grading

- [x] Open and hidden evaluation sets of persona-written letters (`npm run eval:open`, `npm run eval:hidden`; see [quality gates](architecture/quality-gates.md#open-and-hidden-evaluation-sets)).
- [x] Hidden set sealed with a public key and graded only in CI (`TELC_HIDDEN_PRIVATE_KEY` secret).
- [ ] Grow the hidden set with letters by real teachers or official telc samples with their ratings; model-written letters share the model's blind spots.
- [x] Another-purpose review over the keyword stage (`grading/purposeReview.js`): hidden set 6 Leitpunkt decisions fixed, 0 broken, no false void. Raising or lowering keyword levels by evidence was measured and dropped (no gain on letters on task).
- [x] Other-purpose phrases by typology and the other tasks' fulfilling phrases as negatives, 112 more purpose letters: no false void on 189 letters on task (the previous design voided one), recall unchanged (~37% of off-topic letters caught, leave one task out).
- [x] Whole-letter purpose margin (the letter embedded once against prototype letters written from the task only): leave one task out 19/35 graded off-topic letters caught (15/35 without it), 73/133 all, no false void on 189. Part of the gain is similarity between prototypes and calibration letters written along the same typology (letters least like a prototype: +6/66 vs +15/67); the hidden set decides.
- [ ] Calibration letters miss what the hidden set caught: removing the example-phrase competitive gate changed nothing on open and calibration letters but over-credited letters with a missing point on the hidden set. Add missing-point letters where another Leitpunkt's sentence resembles the missing one.
- [x] Legacy ablation (open + calibration letters): `letterPurposeFit.js` and the example-phrase competitive gate removed; v1 example phrases, the keyword stage's rival gate and the confidence floor kept (each broke verdicts when removed).
- [x] `heavy_errors` diagnosis: the lost points are mostly KG (a misspelt salutation or closing was not recognised: "Sehr geerte", "Mit freundliche Gruse", "Grus") and Leitpunkte whose keywords are misspelt ("krang", "fiber"). Formulas now tolerate a misspelt word (closed vocabulary, guards in `letterFormulaMatcher.js`); measure on open + calibration letters with `eval-schreiben --baseline`.
- [ ] Misspelt keywords: sound-key match only for tokens unknown to the A1 lexicon after lemma lookup, both ≥ 4 letters, against the task's own keywords, outside salutation and closing; replace the token before detection so negation and contradiction treat it as correctly spelt; keep the kurz→Kurs / Mund→Hund tests and narrow the Known limits entry; no regression on off-topic and no-predication letters.
- [ ] Keyword stage on `sentence_embedding` and the model-card prompts: a recalibration of its own, measured on calibration letters, then open, then hidden.
- [ ] Negation: perfect tense and split separable verbs (`PART_PAST` vs `VERB_PART`), negated reason and state points.
- [ ] Drop generic rubric keywords (`zeit`, `machen`, `kommen`, `wann`, `können`, `geht`, `gibt`).

## Grading transparency (design + architecture)

- [ ] Show how the letter was judged, step by step, in the results screen: the letter's sentences, which Leitpunkt each one serves or contradicts and how strongly (the evidence heads' probabilities), the closest example phrases it was compared with, the off-task decision, and how levels became points under the regulation. Dynamic and explained in plain words (what is done, how, why), informative and pleasant to look at; it must stay readable on a phone and in both themes. Needs a designer for the visual language and an architect for the data the grader exposes (a stable, language-neutral "judgement trace" in the grading result, rendered at display time like the examiner feedback).

## Later

- [ ] Optional local LLM as a "deep check" (e.g. Gemma 3 1B / Qwen3 0.6B via WebGPU, downloaded only on request): first compare it with the evidence heads on the calibration, held-out, adversarial and purpose sets; adopt only if it is clearly better on traps and off-task letters.
