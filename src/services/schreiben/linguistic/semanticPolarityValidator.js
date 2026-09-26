/**
 * Semantic Polarity & Negation Validator for German Schreiben.
 * Delegates to Proposition Structure & Semantic Intent Matcher.
 * Adheres strictly to Clean Architecture and McConnell limits (<= 30 lines).
 */

import { classifySentenceClauses, evaluateSentenceAgainstCriterion } from './semanticIntentMatcher.js';

/**
 * Evaluates whether a sentence inverts, negates, or refuses the target Leitpunkt.
 * @param {{ lexicon: object }} context - the level's lexicon port (ranker policy `lexicon`)
 */
export function detectSemanticInversion(sentence = '', criterion = {}, { lexicon } = {}) {
  if (!sentence || typeof sentence !== 'string') {
    return { isInverted: false, isMatch: false };
  }

  const result = evaluateSentenceAgainstCriterion(sentence, { criterion, lexicon });
  return {
    isInverted: result.isInverted,
    reason: result.reason,
    isMatch: result.isMatch,
    intentType: result.intentType
  };
}

/**
 * Affirmative part of a sentence for one Leitpunkt: the sentence itself when nothing in it
 * refuses the target, otherwise only its non-refusing clauses. A refusal joined by a comma
 * is then weighed exactly like a refusal in a separate sentence.
 */
export function extractAffirmativeText(sentence = '', criterion = {}, { lexicon } = {}) {
  if (!sentence || typeof sentence !== 'string') return '';
  const { clauses } = classifySentenceClauses(sentence, { criterion, lexicon });
  if (!clauses.some((c) => c.isInverted)) return sentence;
  return clauses.filter((c) => !c.isInverted).map((c) => c.text).join(' ');
}
