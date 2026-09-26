/**
 * Stage 4 wiring for gradingPipeline: legacy German summary string + structured examiner feedback.
 * The examiner descriptor is provider-independent (works in limited mode and offline).
 */

import { assembleDeterministicFeedback } from './stage4Feedback.js';
import { PROVIDER_IDS } from '../../ai/types.js';

function buildLegacyFacts({ stage1, stage2, errors }) {
  return {
    anredeScore: stage1.anredeScore,
    lpScore: stage2.totalScore,
    grussScore: stage1.grussScore,
    grammarErrorCount: errors.length,
  };
}

async function resolveLegacyFeedbackText(facts, activeProvider, enableLlmPolish) {
  let feedbackText = assembleDeterministicFeedback(facts);
  if (enableLlmPolish && activeProvider.id !== PROVIDER_IDS.NONE) {
    try {
      feedbackText = await activeProvider.polishFeedback(facts);
    } catch (err) {
      console.warn('[GradingPipeline] Feedback polish skipped:', err?.message || err);
    }
  }
  return feedbackText;
}

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
export function buildExaminerFeedbackFacts({ stage0, stage1, stage2, errors, userSegments, finalPoints, maxPoints, isGibberish }) {
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
  };
}

/**
 * @returns {Promise<{ feedbackText: string, examinerFeedback: object|null }>}
 */
export async function composePipelineFeedback({ context, policy, activeProvider, enableLlmPolish }) {
  const feedbackText = await resolveLegacyFeedbackText(buildLegacyFacts(context), activeProvider, enableLlmPolish);
  try {
    return { feedbackText, examinerFeedback: policy.buildExaminerFeedback(buildExaminerFeedbackFacts(context)) };
  } catch (err) {
    console.warn('[GradingPipeline] Examiner feedback skipped:', err?.message || err);
    return { feedbackText, examinerFeedback: null };
  }
}
