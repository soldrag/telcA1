# TODO

## Schreiben grading

- [x] Open and hidden evaluation sets of persona-written letters (`npm run eval:open`, `npm run eval:hidden`; see [quality gates](architecture/quality-gates.md#open-and-hidden-evaluation-sets)).
- [ ] Grow the hidden set with letters by real teachers or official telc samples with their ratings; model-written letters share the model's blind spots.
- [ ] Ranker: take EmbeddingGemma's `sentence_embedding` output and the model-card document prefix (`title: none | text:`), then recalibrate the thresholds on the open set and confirm on the hidden one.
- [ ] Ranker: positive and negative example phrases per Leitpunkt in the rubric instead of label + keywords.
- [ ] Neural evidence may anchor the topic, so a paraphrase without rubric words is not voided as `OFF_TOPIC`.
- [ ] Negation: perfect tense and split separable verbs (`PART_PAST` vs `VERB_PART`), negated reason and state points.
- [ ] Drop generic rubric keywords (`zeit`, `machen`, `kommen`, `wann`, `können`, `geht`, `gibt`).
