import { runDeterministicBaseline, toCriteriaBreakdown } from '../deterministicBaseline.js';
import { computeTelcFinalScore } from '../scoring/telcScoreCalculator.js';
import { assembleDeterministicFeedback } from './stage4Feedback.js';

function buildFeedbackFacts(salutation, leitpunkte, closing, grammarErrors) {
  return {
    anredeScore: salutation.score,
    lpScore: leitpunkte.score,
    grussScore: closing.score,
    grammarErrorCount: grammarErrors.length
  };
}

export function gradeWithDeterministicBaseline({ rawText = '', question = {}, criteria = [] }) {
  const baseline = runDeterministicBaseline(rawText, criteria);
  const { salutation, closing, leitpunkte, grammarErrors, wordCount, isGibberish, segments } = baseline;
  const { finalPoints, grammarPenalty } = computeTelcFinalScore({
    salutationScore: salutation.score,
    leitpunkteScore: leitpunkte.score,
    closingScore: closing.score,
    wordCount,
    isGibberish,
    grammarErrorsCount: grammarErrors.length
  });
  const facts = buildFeedbackFacts(salutation, leitpunkte, closing, grammarErrors);

  return {
    word_count: wordCount,
    points_earned: finalPoints,
    max_points: question.max_points || 10,
    is_correct: finalPoints >= 6,
    is_limited_mode: true,
    breakdown: {
      anrede: salutation.score,
      leitpunkte: leitpunkte.score,
      gruss: closing.score,
      grammar_penalty: grammarPenalty,
      items: leitpunkte.items
    },
    criteria_breakdown: {
      ...toCriteriaBreakdown({
        salutationScore: salutation.score,
        leitpunkteItems: leitpunkte.items,
        closingScore: closing.score
      }),
      items: leitpunkte.items
    },
    grammar_errors: grammarErrors,
    grammar_penalty: grammarPenalty,
    feedback_summary: assembleDeterministicFeedback(facts),
    diff_summary: [],
    user_segments: segments
  };
}
