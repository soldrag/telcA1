/**
 * Schreiben Teil 2 final score: collects detector evidence and delegates the
 * points scale to the exam regulation of the task level (see regulations/).
 */

import { getSchreibenRegulation } from '../regulations/index.js';

export function computeTelcFinalScore({
  leitpunktLevels = [],
  salutationScore = 0,
  closingScore = 0,
  wordCount = 0,
  isGibberish = false,
  grammarErrors = [],
  level = 'A1',
}) {
  const regulation = getSchreibenRegulation(level);
  const score = regulation.scoreTeil2({
    leitpunktLevels,
    anrede: salutationScore,
    gruss: closingScore,
    grammarErrors,
    wordCount,
    isUnratable: isGibberish || wordCount === 0,
  });
  return {
    finalPoints: score.total,
    score,
    regulation: { id: regulation.id, trainingPassMark: regulation.trainingPassMark },
  };
}
