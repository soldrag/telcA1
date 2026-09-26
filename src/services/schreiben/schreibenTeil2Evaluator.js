import {
  resolveLeitpunktCriteria,
  runDeterministicBaseline
} from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';
import { resolveLevelContext } from './levelContext.js';
import { assembleDeterministicFeedback } from './grading/stage4Feedback.js';

function buildBaselineExaminerFacts({ salutation, closing, segments, leitpunkteItems, grammarErrors, finalPoints, maxPoints, wordCount, isGibberish }) {
  const grussText = closing.senderName && !closing.text?.includes(closing.senderName)
    ? [closing.text, closing.senderName].filter(Boolean).join(' ')
    : (closing.text || '');

  return {
    anrede: {
      score: salutation.score,
      code: salutation.diagnosticCode,
      text: salutation.text || segments?.anrede || '',
    },
    gruss: {
      score: closing.score,
      code: closing.diagnosticCode,
      text: grussText,
    },
    items: leitpunkteItems.map((it) => ({
      label: it.label || it.id || '',
      score: Number(it.score) || 0,
      diagnosticCode: it.diagnosticCode || '',
      matchedSentence: it.matchedSentence || '',
      missingAspects: it.rankerDetails?.missingAspects || [],
    })),
    grammarErrors: grammarErrors.map((g) => ({
      original: g.original,
      correction: g.correction,
      category: g.category || 'grammar',
      code: g.code || '',
    })),
    finalPoints,
    maxPoints,
    wordCount,
    isGibberish: Boolean(isGibberish),
  };
}

export function evaluateTeil2Essay(userAnswer = '', question = {}) {
  const text = (userAnswer || '').trim();
  const criteria = resolveLeitpunktCriteria(question);
  const levelContext = resolveLevelContext(question.level);
  const baseline = runDeterministicBaseline(text, criteria, levelContext);
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
    ...quality.feedback,
    ...grammarErrors.map(e => `❌ „${e.original}“ ➔ ✅ „${e.correction}“: ${e.explanation}`)
  ].filter(Boolean);

  const examinerFacts = buildBaselineExaminerFacts({
    salutation,
    closing,
    segments,
    leitpunkteItems,
    grammarErrors,
    finalPoints,
    maxPoints: score.maxPoints,
    wordCount,
    isGibberish,
  });

  const examinerFeedback = levelContext.policy.buildExaminerFeedback(examinerFacts);
  const feedbackSummary = assembleDeterministicFeedback({
    anredeScore: salutation.score,
    lpScore: leitpunkte.score,
    grussScore: closing.score,
    grammarErrorCount: grammarErrors.length,
  });

  const enrichedItems = leitpunkteItems.map((it, i) => ({
    ...it,
    points: score.leitpunkte[i].points,
    maxPoints: score.leitpunkte[i].maxPoints,
    rankerDetails: it.rankerDetails || null,
  }));

  return {
    word_count: wordCount,
    points_earned: finalPoints,
    max_points: score.maxPoints,
    is_correct: finalPoints >= regulation.trainingPassMark,
    breakdown: {
      anrede: salutation.score,
      lp1: leitpunkteItems[0]?.score ?? 0,
      lp2: leitpunkteItems[1]?.score ?? 0,
      lp3: leitpunkteItems[2]?.score ?? 0,
      leitpunkte: score.leitpunkte.reduce((sum, lp) => sum + lp.points, 0),
      gruss: closing.score,
      kommunikative_gestaltung: score.kg,
      items: enrichedItems,
      diagnostic: {
        anrede: salutation,
        gruss: closing,
        items: enrichedItems,
      },
    },
    examiner_feedback: examinerFeedback,
    feedback_summary: feedbackSummary,
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
