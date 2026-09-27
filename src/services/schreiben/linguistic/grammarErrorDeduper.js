/**
 * Collapses grammar findings that describe the same defect.
 * Several analyzers can flag one construction ("möchten kommen von 15" and "kommen von 15. Juli bis 25. Juli"
 * are one broken Satzklammer), and a learner must not pay twice for it.
 */

const MIN_OVERLAP_TOKENS = 2;

function toTokens(text = '') {
  return String(text).toLowerCase().split(/[^a-zäöüß0-9]+/).filter(Boolean);
}

const sameTokens = (a, b) => a.length === b.length && a.every((t, i) => t === b[i]);

function containsSequence(outer, inner) {
  return inner.length > 0 && outer.some((_, i) => sameTokens(outer.slice(i, i + inner.length), inner));
}

// The end of one span is the start of the other: "möchten kommen von 15" / "kommen von 15. Juli".
function overlapsAtEdge(a, b) {
  for (let n = Math.min(a.length, b.length) - 1; n >= MIN_OVERLAP_TOKENS; n -= 1) {
    if (sameTokens(a.slice(-n), b.slice(0, n)) || sameTokens(b.slice(-n), a.slice(0, n))) return true;
  }
  return false;
}

// One defect = the same kind of finding over overlapping text. Sharing words is not enough:
// "mit meine Mutter" and "mit meine Schwester" are two defects.
function describeSameDefect(a, b) {
  if ((a.code || a.category) !== (b.code || b.category)) return false;
  const tokensA = toTokens(a.original);
  const tokensB = toTokens(b.original);
  return containsSequence(tokensA, tokensB) || containsSequence(tokensB, tokensA) || overlapsAtEdge(tokensA, tokensB);
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

/** Adds the findings of another analyzer to the baseline list, one entry per original phrase and defect. */
export function mergeCandidateGrammarErrors(baselineErrors = [], candidateErrors = []) {
  const base = Array.isArray(baselineErrors) ? baselineErrors : [];
  const candidates = Array.isArray(candidateErrors) ? candidateErrors : [];
  const seen = new Set(base.map(e => (e?.original || '').toLowerCase().trim()).filter(Boolean));
  const merged = [...base];

  for (const err of candidates) {
    if (!err || !err.original) continue;
    const key = String(err.original).toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({
        ...err,
        original: String(err.original || '').trim(),
        correction: String(err.correction || '').trim(),
        explanation: String(err.explanation || 'Grammatikfehler').trim(),
        category: err.category || 'syntax'
      });
    }
  }

  return dedupeGrammarErrors(merged);
}
