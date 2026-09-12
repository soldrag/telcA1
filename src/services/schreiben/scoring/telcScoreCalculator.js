/**
 * telc A1 scoring matrix calculator.
 * Form: Salutation (0-2) + Closing (0-2)
 * Content: 3 Leitpunkte (0-2 each = 0-6)
 *
 * telc A1 official linguistic penalty guidelines:
 * Orthography (Groß-/Kleinschreibung) is penalized more mildly than severe syntax/comprehension breakdown.
 * Grammar penalty:
 * 1-2 errors: -1
 * 3-5 errors: -2
 * 6-7 errors: -3
 * 8+ errors: -4
 */

export function calculateGrammarPenalty(errorsCount = 0) {
  if (errorsCount >= 8) return 4;
  if (errorsCount >= 6) return 3;
  if (errorsCount >= 3) return 2;
  if (errorsCount >= 1) return 1;
  return 0;
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
