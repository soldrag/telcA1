/**
 * Algorithmic validator and filter for LLM-proposed grammar candidates.
 * Enforces strict anti-hallucination guardrails:
 * 1. Exact substring check within sentence
 * 2. Reasonable edit distance (discard rewrites)
 * 3. Max errors cap per sentence and deduplication
 */
import { calculateLevenshtein, normalizeGermanText } from '../schreibenFuzzyMatcher.js';

const MAX_WORD_COUNT = 4;
const MAX_ABS_LENGTH_DIFF = 18;

export function isExactSubstring(sentence = '', candidateSubstring = '') {
  if (!sentence || !candidateSubstring) return false;
  const trimmedCandidate = candidateSubstring.trim();
  if (!trimmedCandidate) return false;
  return sentence.includes(trimmedCandidate);
}

export function isReasonableA1Correction(original = '', correction = '') {
  const origTrimmed = (original || '').trim();
  const corrTrimmed = (correction || '').trim();

  if (!origTrimmed || !corrTrimmed || origTrimmed === corrTrimmed) {
    return false;
  }

  const origWords = origTrimmed.split(/\s+/).filter(Boolean);
  const corrWords = corrTrimmed.split(/\s+/).filter(Boolean);
  if (origWords.length > MAX_WORD_COUNT || corrWords.length > MAX_WORD_COUNT + 1) {
    return false;
  }

  if (Math.abs(corrTrimmed.length - origTrimmed.length) > MAX_ABS_LENGTH_DIFF) {
    return false;
  }

  const dist = calculateLevenshtein(
    normalizeGermanText(origTrimmed),
    normalizeGermanText(corrTrimmed)
  );
  const maxAllowedDist = Math.max(8, Math.ceil(origTrimmed.length * 0.75));
  return dist <= maxAllowedDist;
}

export function filterSentenceGrammarCandidates(sentence = '', rawCandidates = [], maxErrors = 3) {
  if (!sentence || !Array.isArray(rawCandidates) || rawCandidates.length === 0) {
    return [];
  }

  const validErrors = [];
  const seenOriginals = new Set();

  for (const item of rawCandidates) {
    if (validErrors.length >= maxErrors) break;
    const orig = (item?.original || '').trim();
    const corr = (item?.correction || '').trim();

    if (!orig || !corr || seenOriginals.has(orig.toLowerCase())) continue;
    if (!isExactSubstring(sentence, orig)) continue;
    if (!isReasonableA1Correction(orig, corr)) continue;

    seenOriginals.add(orig.toLowerCase());
    validErrors.push({
      original: orig,
      correction: corr,
      explanation: (item.explanation || 'Grammatikfehler').trim(),
      category: item.category || 'syntax'
    });
  }

  return validErrors;
}

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

  return merged;
}
