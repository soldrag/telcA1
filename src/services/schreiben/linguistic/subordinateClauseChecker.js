/**
 * Subordinate clauses put the finite verb last: "weil ich nicht kommen kann", not "weil ich kann nicht kommen".
 * Infinitive/finite homographs ("arbeiten") are finite only when the lexicon has no infinitive reading,
 * so "weil ich arbeiten muss" is accepted.
 */
const FINITE_POS = new Set(['VERB_FIN', 'VERB_MOD']);

function isSurelyFinite(token, lexicon) {
  if (!FINITE_POS.has(token.pos)) return false;
  return !lexicon.lookup(token.lower).some((e) => e.pos === 'VERB_INF');
}

function buildError(tokens, finiteIndex) {
  const words = tokens.map((t) => t.raw);
  const original = words.join(' ');
  const correction = [...words.slice(0, finiteIndex), ...words.slice(finiteIndex + 1), words[finiteIndex]].join(' ');
  return {
    category: 'syntax',
    code: 'ERR_NEBENSATZ_VERB_FINAL',
    original,
    correction,
    explanation: `Wortstellung im Nebensatz mit „${tokens[0].raw}“: Das konjugierte Verb steht am Ende: „${correction}“ (nicht „${original}“).`,
  };
}

/**
 * @param {Array} tokens - tagged tokens of the subordinate clause, conjunction first
 * @param {{ lookup: Function }} lexicon - vocabulary port
 */
export function checkSubordinateVerbFinal(tokens = [], lexicon) {
  const last = tokens.length - 1;
  if (FINITE_POS.has(tokens[last]?.pos)) return [];
  const finiteIndex = tokens.findIndex((t, i) => i > 0 && i < last && isSurelyFinite(t, lexicon));
  return finiteIndex === -1 ? [] : [buildError(tokens, finiteIndex)];
}
