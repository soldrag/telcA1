# TODO

## Schreiben grading

- [x] Open and hidden evaluation sets of persona-written letters (`npm run eval:open`, `npm run eval:hidden`; see [quality gates](architecture/quality-gates.md#open-and-hidden-evaluation-sets)).
- [x] Hidden set sealed with a public key and graded only in CI (`TELC_HIDDEN_PRIVATE_KEY` secret).
- [ ] Grow the hidden set with letters by real teachers or official telc samples with their ratings; model-written letters share the model's blind spots.
- [x] Another-purpose review over the keyword stage (`grading/purposeReview.js`): hidden set 6 Leitpunkt decisions fixed, 0 broken, no false void. Raising or lowering keyword levels by evidence was measured and dropped (no gain on letters on task).
- [ ] Off-topic recall: half the off-topic letters still pass (near misses to the same addressee: another speech act, a misread role, another service, a personal letter). Write other-purpose phrases per task by that typology as minimal pairs of the task's own phrases, use the other tasks' fulfilling phrases as negatives, add about 10 off-topic calibration letters per task; the no-false-void guard stays.
- [ ] Legacy ablation on the open set and calibration only: `letterPurposeFit.js` / `isOffTaskLetter`, v1 example phrases (`schreiben-leitpunkt-examples.json`), rival gates, confidence-floor branches; keep only what changes a result.
- [ ] `heavy_errors` letters are under-credited (hidden set: a third within ±0.5): diagnose with `scripts/eval/learnerNoise.mjs` on calibration letters before changing anything.
- [ ] Keyword stage on `sentence_embedding` and the model-card prompts: a recalibration of its own, measured on calibration letters, then open, then hidden.
- [ ] Negation: perfect tense and split separable verbs (`PART_PAST` vs `VERB_PART`), negated reason and state points.
- [ ] Drop generic rubric keywords (`zeit`, `machen`, `kommen`, `wann`, `können`, `geht`, `gibt`).

## Grading transparency (design + architecture)

- [ ] Show how the letter was judged, step by step, in the results screen: the letter's sentences, which Leitpunkt each one serves or contradicts and how strongly (the evidence heads' probabilities), the closest example phrases it was compared with, the off-task decision, and how levels became points under the regulation. Dynamic and explained in plain words (what is done, how, why), informative and pleasant to look at; it must stay readable on a phone and in both themes. Needs a designer for the visual language and an architect for the data the grader exposes (a stable, language-neutral "judgement trace" in the grading result, rendered at display time like the examiner feedback).

## Later

- [ ] Optional local LLM as a "deep check" (e.g. Gemma 3 1B / Qwen3 0.6B via WebGPU, downloaded only on request): first compare it with the evidence heads on the calibration, held-out, adversarial and purpose sets; adopt only if it is clearly better on traps and off-task letters.
