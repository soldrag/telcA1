/**
 * Single source of truth for Schreiben Teil 2 grading.
 * Orchestrates Stages 0-4 deterministically; providers execute only micro-tasks.
 */

import { runStage0Preprocessing } from './grading/stage0Preprocessing.js';
import { runStage1Scoring } from './grading/stage1SalutationClosing.js';
import { computeGrammarPenalty } from './grading/stage3Grammar.js';
import { assembleDeterministicFeedback } from './grading/stage4Feedback.js';
import { resolveLeitpunktCriteria } from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';
import { analyzeGermanQuality } from './germanQualityAnalyzer.js';
import { segmentUserEssay } from './schreibenTextSegmenter.js';
import { aiProviderRegistry } from '../ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../ai/types.js';
import { scorePipelineLeitpunkte, collectPipelineGrammarErrors } from './grading/pipelineStageScorers.js';

function buildFeedbackFacts(stage1, stage2, errors) {
  return {
    anredeScore: stage1.anredeScore,
    lpScore: stage2.totalScore,
    grussScore: stage1.grussScore,
    grammarErrorCount: errors.length,
  };
}

async function resolveFeedbackText(facts, activeProvider, enableLlmPolish) {
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

function buildDiffSummary(items = []) {
  return items
    .filter((it) => it.arbitrated)
    .map((it) => ({
      id: it.id,
      change: it.score > it.baselineScore ? 'rescued' : (it.score < it.baselineScore ? 'adjusted' : 'protected'),
      from: it.baselineScore,
      to: it.score,
    }));
}

function assembleGradingResult({
  stage0,
  stage1,
  stage2,
  errors,
  grammarPenalty,
  finalPoints,
  question,
  activeProvider,
  feedbackText,
  diffSummary,
  userSegments,
}) {
  return {
    word_count: stage0.wordCount,
    points_earned: finalPoints,
    max_points: question.max_points || 10,
    is_correct: finalPoints >= 6,
    is_limited_mode: activeProvider.id === PROVIDER_IDS.NONE,
    provider_id: activeProvider.id,
    provider_name: activeProvider.name,
    breakdown: {
      anrede: stage1.anredeScore,
      leitpunkte: stage2.totalScore,
      gruss: stage1.grussScore,
      grammar_penalty: grammarPenalty,
      items: stage2.items,
    },
    criteria_breakdown: {
      anrede: stage1.anredeScore,
      lp1: stage2.items[0]?.score ?? 0,
      lp2: stage2.items[1]?.score ?? 0,
      lp3: stage2.items[2]?.score ?? 0,
      gruss: stage1.grussScore,
      items: stage2.items,
    },
    grammar_errors: errors,
    grammar_penalty: grammarPenalty,
    feedback_summary: feedbackText,
    diff_summary: diffSummary,
    user_segments: userSegments,
  };
}

export async function gradeSchreibenSubmission({
  userText = '',
  question = {},
  provider = null,
  options = {},
  onProgress = null,
}) {
  const raw = String(userText || '').trim();
  const criteria = resolveLeitpunktCriteria(question);
  const activeProvider = provider || (options.forceLimitedMode
    ? aiProviderRegistry.getProvider(PROVIDER_IDS.NONE)
    : await aiProviderRegistry.getActiveProvider());

  onProgress?.('Vorverarbeitung und Textanalyse...', 0.1);
  const stage0 = runStage0Preprocessing(raw);
  const quality = analyzeGermanQuality(raw, 30);
  const stage1 = runStage1Scoring(stage0);

  onProgress?.('Prüfung der Leitpunkte...', 0.4);
  const customExtractor = options.forceLimitedMode ? false : options.customExtractor;
  const stage2 = await scorePipelineLeitpunkte({
    criteria,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    customExtractor,
  });

  onProgress?.('Grammatikprüfung...', 0.7);
  const errors = await collectPipelineGrammarErrors({
    rawText: raw,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    semanticErrors: stage2.semanticErrors || [],
  });
  const grammarPenalty = computeGrammarPenalty(errors.length);

  onProgress?.('Erstelle Feedback...', 0.9);
  const facts = buildFeedbackFacts(stage1, stage2, errors);
  const feedbackText = await resolveFeedbackText(facts, activeProvider, options.enableLlmPolish);

  const { finalPoints } = computeTelcFinalScore({
    salutationScore: stage1.anredeScore,
    leitpunkteScore: stage2.totalScore,
    closingScore: stage1.grussScore,
    wordCount: stage0.wordCount,
    isGibberish: quality.isGibberish,
    grammarErrorsCount: errors.length,
  });

  const diffSummary = buildDiffSummary(stage2.items);
  const seg = segmentUserEssay(raw, criteria);
  const userSegments = {
    anrede: stage0.salutation.recognized ? stage0.salutation.text : (seg.anrede || ''),
    closing: stage0.closing.recognized ? stage0.closing.text : (seg.closing || ''),
    senderName: stage0.closing.senderName || seg.senderName || '',
    leitpunkte: seg.leitpunkte,
  };

  onProgress?.('Bewertung abgeschlossen', 1.0);
  return assembleGradingResult({
    stage0,
    stage1,
    stage2,
    errors,
    grammarPenalty,
    finalPoints,
    question,
    activeProvider,
    feedbackText,
    diffSummary,
    userSegments,
  });
}
