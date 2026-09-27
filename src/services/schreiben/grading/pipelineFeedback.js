/**
 * Stage 4 wiring for gradingPipeline: the structured examiner feedback.
 * The examiner descriptor is provider-independent (works in limited mode and offline).
 */

function toClosingQuote(gruss = {}) {
  const text = gruss.text || '';
  const name = gruss.senderName || '';
  return name && !text.includes(name) ? [text, name].filter(Boolean).join(' ') : text;
}

function toLeitpunktFact(item = {}) {
  return {
    label: item.label || item.id || '',
    score: Number(item.score) || 0,
    diagnosticCode: item.diagnosticCode || '',
    matchedSentence: item.matchedSentence || '',
    missingAspects: item.rankerDetails?.missingAspects || [],
  };
}

/**
 * Facts contract consumed by IRankerPolicy.buildExaminerFeedback.
 */
export function buildExaminerFeedbackFacts({ stage0, stage1, stage2, errors, userSegments, finalPoints, maxPoints, isGibberish, leitpunkteVoidReason = null }) {
  return {
    anrede: {
      score: stage1.anredeScore,
      code: stage1.anrede?.diagnosticCode,
      text: stage1.anrede?.text || userSegments?.anrede || '',
      correction: stage1.anrede?.correction || '',
    },
    gruss: { score: stage1.grussScore, code: stage1.gruss?.diagnosticCode, text: toClosingQuote(stage1.gruss) },
    items: (stage2.items || []).map(toLeitpunktFact),
    grammarErrors: errors.map(({ original, correction, category, code }) => ({ original, correction, category, code })),
    finalPoints,
    maxPoints,
    wordCount: stage0.wordCount,
    isGibberish: Boolean(isGibberish),
    leitpunkteVoidReason,
  };
}

/** @returns {object|null} the examiner feedback descriptor; null when the policy could not build it */
export function composeExaminerFeedback({ context, policy }) {
  try {
    return policy.buildExaminerFeedback(buildExaminerFeedbackFacts(context));
  } catch (err) {
    console.warn('[GradingPipeline] Examiner feedback skipped:', err?.message || err);
    return null;
  }
}
