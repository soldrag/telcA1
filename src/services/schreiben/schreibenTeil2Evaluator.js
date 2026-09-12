import {
  resolveLeitpunktCriteria,
  runDeterministicBaseline
} from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';

function fallbackLeitpunkte(wordCount = 0) {
  const fallbackScore = wordCount >= 20 ? 6 : (wordCount >= 10 ? 4 : (wordCount >= 5 ? 1 : 0));
  return { score: fallbackScore, maxScore: 6, items: [] };
}

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

  const leitpunkteResult = criteria.length > 0 ? leitpunkte : fallbackLeitpunkte(quality.wordCount);

  const { finalPoints, grammarPenalty } = computeTelcFinalScore({
    salutationScore: salutation.score,
    leitpunkteScore: leitpunkteResult.score,
    closingScore: closing.score,
    wordCount,
    isGibberish,
    grammarErrorsCount: grammarErrors.length
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
    max_points: question.max_points || 10,
    is_correct: finalPoints >= 6,
    breakdown: {
      anrede: salutation.score,
      leitpunkte: leitpunkteResult.score,
      gruss: closing.score,
      grammar_penalty: grammarPenalty,
      items: leitpunkteResult.items
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
