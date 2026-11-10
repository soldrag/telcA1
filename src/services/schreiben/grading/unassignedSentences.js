/**
 * Body sentences that no credited Leitpunkt was read from.
 * Diagnostic only: shown to the learner and the developer to spot false misses, never scored.
 * One sentence may serve several Leitpunkte (an examiner credits it the same way); a span may be a clause of a
 * sentence or two adjacent sentences, so a sentence counts as used when it and a credited span overlap.
 */

function collectItemSpans(item) {
  if (!item?.score) return [];
  const units = item.rankerDetails?.units || [];
  return [item.matchedSentence, ...units.filter((u) => (u.level ?? 1) > 0).map((u) => u.span)]
    .filter(Boolean)
    .map((s) => s.trim());
}

const overlaps = (sentence, span) => span.includes(sentence) || sentence.includes(span);

export function collectUnassignedSentences(bodySentences = [], items = []) {
  const spans = items.flatMap(collectItemSpans);
  return bodySentences.filter((s) => s && !spans.some((span) => overlaps(s.trim(), span)));
}
