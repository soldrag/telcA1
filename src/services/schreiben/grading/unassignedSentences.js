/**
 * Body sentences that no credited Leitpunkt used as evidence.
 * Diagnostic only: shown to the learner and the developer to spot false misses, never scored.
 * One sentence may serve several Leitpunkte (an examiner credits it the same way).
 */

function collectItemEvidence(item) {
  if (!item?.score) return [];
  const aspects = item.rankerDetails?.aspects || [];
  return [
    item.matchedSentence,
    ...(item.keywordSentences || []),
    ...aspects.filter((a) => a.coverage !== 'no').map((a) => a.matchedSentence),
  ].filter(Boolean);
}

export function collectUnassignedSentences(bodySentences = [], items = []) {
  const used = new Set(items.flatMap(collectItemEvidence).map((s) => s.trim()));
  return bodySentences.filter((s) => s && !used.has(s.trim()));
}
