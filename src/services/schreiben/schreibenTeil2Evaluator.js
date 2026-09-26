import {
  resolveLeitpunktCriteria,
  runDeterministicBaseline
} from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';

export function evaluateTeil2Essay(userAnswer = '', question = {}) {
  const text = (userAnswer || '').trim();
  const criteria = resolveLeitpunktCriteria(question);
  const baseline = runDeterministicBaseline(text, criteria);
  const {
    salutation,
    closing,
    segments,
    leitpunkte,
    grammarErrors,
    wordCount,
    isGibberish,
    quality
  } = baseline;

  const leitpunkteItems = leitpunkte?.items || [];

  const { finalPoints, score, regulation } = computeTelcFinalScore({
    leitpunktLevels: leitpunkteItems.map(it => it.score),
    salutationScore: salutation.score,
    closingScore: closing.score,
    wordCount,
    isGibberish,
    grammarErrors,
    level: question.level
  });

  const feedbackList = [
    salutation.feedback,
    closing.feedback,
    closing.grammarNote,
    ...quality.feedback,
    ...grammarErrors.map(e => `❌ „${e.original}“ ➔ ✅ „${e.correction}“: ${e.explanation}`)
  ].filter(Boolean);

  return {
    word_count: wordCount,
    points_earned: finalPoints,
    max_points: score.maxPoints,
    is_correct: finalPoints >= regulation.trainingPassMark,
    breakdown: {
      anrede: salutation.score,
      leitpunkte: score.leitpunkte.reduce((sum, lp) => sum + lp.points, 0),
      gruss: closing.score,
      kommunikative_gestaltung: score.kg,
      items: leitpunkteItems.map((it, i) => ({ ...it, points: score.leitpunkte[i].points, maxPoints: score.leitpunkte[i].maxPoints }))
    },
    grammar_errors: grammarErrors,
    user_segments: segments,
    feedback: feedbackList,
    detected: {
      salutation: salutation.text,
      closing: closing.text,
      hasName: closing.hasName
    }
  };
}
