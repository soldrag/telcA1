# TODO

## Schreiben grading

- [x] Open and hidden evaluation sets of persona-written letters (`npm run eval:open`, `npm run eval:hidden`; see [quality gates](architecture/quality-gates.md#open-and-hidden-evaluation-sets)).
- [x] Hidden set sealed with a public key and graded only in CI (`TELC_HIDDEN_PRIVATE_KEY` secret).
- [ ] Grow the hidden set with letters by real teachers or official telc samples with their ratings; model-written letters share the model's blind spots.
- [ ] Ranker: take EmbeddingGemma's `sentence_embedding` output and the model-card document prefix (`title: none | text:`), then recalibrate the thresholds on the open set and confirm on the hidden one.
- [ ] Ranker: positive and negative example phrases per Leitpunkt in the rubric instead of label + keywords.
- [ ] Neural evidence may anchor the topic, so a paraphrase without rubric words is not voided as `OFF_TOPIC`.
- [ ] Negation: perfect tense and split separable verbs (`PART_PAST` vs `VERB_PART`), negated reason and state points.
- [ ] Drop generic rubric keywords (`zeit`, `machen`, `kommen`, `wann`, `können`, `geht`, `gibt`).

## Grading transparency (design + architecture)

- [ ] Show how the letter was judged, step by step, in the results screen: the letter's sentences, which Leitpunkt each one serves or contradicts and how strongly (the evidence heads' probabilities), the closest example phrases it was compared with, the off-task decision, and how levels became points under the regulation. Dynamic and explained in plain words (what is done, how, why), informative and pleasant to look at; it must stay readable on a phone and in both themes. Needs a designer for the visual language and an architect for the data the grader exposes (a stable, language-neutral "judgement trace" in the grading result, rendered at display time like the examiner feedback).

## Later

- [ ] Optional local LLM as a "deep check" (e.g. Gemma 3 1B / Qwen3 0.6B via WebGPU, downloaded only on request): first compare it with the evidence heads on the calibration, held-out, adversarial and purpose sets; adopt only if it is clearly better on traps and off-task letters.
