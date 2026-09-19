/**
 * Semantic Polarity & Negation Validator for German A1 Schreiben.
 * Delegates to Proposition Structure & Semantic Intent Matcher.
 * Adheres strictly to Clean Architecture and McConnell limits (<= 30 lines).
 */

import { evaluateSentenceAgainstCriterion, inferCriterionIntent } from './semanticIntentMatcher.js';

export { inferCriterionIntent };

/**
 * Evaluates whether a sentence inverts, negates, or refuses the target Leitpunkt.
 */
export function detectSemanticInversion(sentence = '', criterion = {}) {
  if (!sentence || typeof sentence !== 'string') {
    return { isInverted: false, isMatch: false };
  }

  const result = evaluateSentenceAgainstCriterion(sentence, criterion);
  return {
    isInverted: result.isInverted,
    reason: result.reason,
    isMatch: result.isMatch,
    intentType: result.intentType
  };
}
