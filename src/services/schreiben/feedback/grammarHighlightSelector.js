/**
 * Picks the most instructive grammar errors for the examiner feedback.
 * Topics come from checker error codes/categories (no parsing of explanation text).
 */

import { EXAMINER_CODES } from './feedbackContracts.js';

const TOPIC_BY_ERROR_CODE = Object.freeze({
  ERR_V2_OVERCROWDED_VORFELD: EXAMINER_CODES.GRAMMAR_V2,
  ERR_MISSING_SUBJECT_INVERSION: EXAMINER_CODES.GRAMMAR_V2,
  ERR_V2_AFTER_CONJUNCTION: EXAMINER_CODES.GRAMMAR_V2,
  ERR_V2_W_QUESTION: EXAMINER_CODES.GRAMMAR_V2,
  ERR_V2_ADVERBIAL_VORFELD: EXAMINER_CODES.GRAMMAR_V2,
  ERR_NEBENSATZ_VERB_FINAL: EXAMINER_CODES.GRAMMAR_VERB_FINAL,
  ERR_BROKEN_SATZKLAMMER_MODAL: EXAMINER_CODES.GRAMMAR_VERB_FINAL,
  ERR_BROKEN_SATZKLAMMER_PREFIX: EXAMINER_CODES.GRAMMAR_VERB_FINAL,
});

const TOPIC_PRIORITY = Object.freeze([
  EXAMINER_CODES.GRAMMAR_V2,
  EXAMINER_CODES.GRAMMAR_VERB_FINAL,
  EXAMINER_CODES.GRAMMAR_REKTION,
  EXAMINER_CODES.GRAMMAR_GENERAL,
]);

function resolveGrammarTopic(error) {
  if (TOPIC_BY_ERROR_CODE[error.code]) return TOPIC_BY_ERROR_CODE[error.code];
  return error.category === 'rektion' ? EXAMINER_CODES.GRAMMAR_REKTION : EXAMINER_CODES.GRAMMAR_GENERAL;
}

function isCitable(error) {
  const original = String(error?.original || '').trim();
  const correction = String(error?.correction || '').trim();
  return Boolean(original && correction) && original.toLowerCase() !== correction.toLowerCase();
}

/**
 * @param {Array<{original: string, correction: string, category?: string, code?: string}>} errors
 * @param {number} limit
 * @returns {Array<{code: string, params: {quote: string, correction: string}}>}
 */
export function selectGrammarHighlights(errors = [], limit = 2) {
  const ranked = errors
    .filter(isCitable)
    .map((error) => ({ error, topic: resolveGrammarTopic(error) }))
    .sort((a, b) => TOPIC_PRIORITY.indexOf(a.topic) - TOPIC_PRIORITY.indexOf(b.topic));

  const distinctFirst = [
    ...ranked.filter((r, i) => ranked.findIndex((o) => o.topic === r.topic) === i),
    ...ranked.filter((r, i) => ranked.findIndex((o) => o.topic === r.topic) !== i),
  ];
  return distinctFirst.slice(0, Math.max(0, limit)).map(({ error, topic }) => ({
    code: topic,
    params: { quote: error.original.trim(), correction: error.correction.trim() },
  }));
}
