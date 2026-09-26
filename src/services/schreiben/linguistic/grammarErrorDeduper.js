/**
 * Collapses grammar findings that describe the same defect.
 * Several analyzers can flag one construction ("möchten kommen von 15" and "kommen von 15. Juli bis 25. Juli"
 * are one broken Satzklammer), and a learner must not pay twice for it.
 */

const MIN_SHARED_TOKENS = 2;

function toTokens(text = '') {
  return String(text).toLowerCase().split(/[^a-zäöüß0-9]+/).filter(Boolean);
}

function describeSameDefect(a, b) {
  if ((a.code || a.category) !== (b.code || b.category)) return false;
  const tokensA = toTokens(a.original);
  const tokensB = new Set(toTokens(b.original));
  return tokensA.filter((t) => tokensB.has(t)).length >= MIN_SHARED_TOKENS;
}

/**
 * @param {Array<{ code?: string, category?: string, original?: string }>} errors
 * @returns {Array} first finding of every distinct defect, in input order
 */
export function dedupeGrammarErrors(errors = []) {
  return errors.reduce((kept, err) => (
    kept.some((k) => describeSameDefect(k, err)) ? kept : [...kept, err]
  ), []);
}
