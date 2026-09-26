/**
 * telc A1 scoring matrix calculator.
 * Form: Salutation (0-2) + Closing (0-2)
 * Content: 3 Leitpunkte (0-2 each = 0-6)
 * Delegates penalty logic to A1RankerPolicy adhering to Clean Architecture.
 * Strictly complies with McConnell limits (<= 45 lines).
 */

import { defaultA1RankerPolicy } from '../grading/policies/a1RankerPolicy.js';

export function calculateGrammarPenalty(errorsCount = 0) {
  return defaultA1RankerPolicy.calculateGrammarPenalty(errorsCount);
}

export function computeTelcFinalScore({
  salutationScore = 0,
  leitpunkteScore = 0,
  closingScore = 0,
  wordCount = 0,
  isGibberish = false,
  grammarErrorsCount = 0
}) {
  if (isGibberish || wordCount === 0) {
    return { finalPoints: 0, grammarPenalty: 0, rawScore: 0 };
  }

  let rawScore = salutationScore + leitpunkteScore + closingScore;
  if (wordCount < 15 && rawScore > 4) {
    rawScore = Math.min(rawScore, 4);
  }

  const grammarPenalty = calculateGrammarPenalty(grammarErrorsCount);
  const finalPoints = Math.max(0, Math.min(10, rawScore - grammarPenalty));

  return { finalPoints, grammarPenalty, rawScore };
}
