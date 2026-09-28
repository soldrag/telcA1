/**
 * Single source of truth for Schreiben Teil 2 grading.
 * Orchestrates Stages 0-4 deterministically; providers execute only micro-tasks.
 * Detectors produce coverage levels (0/1/2); the exam regulation turns them into points.
 */

import { runStage0Preprocessing } from './grading/stage0Preprocessing.js';
import { runStage1Scoring } from './grading/stage1SalutationClosing.js';
import { composeExaminerFeedback } from './grading/pipelineFeedback.js';
import { resolveLevelContext } from './levelContext.js';
import { resolveLeitpunktCriteria } from './leitpunktCriteria.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';
import { isGibberishText } from './gibberishDetector.js';
import { segmentUserEssay } from './schreibenTextSegmenter.js';
import { aiProviderRegistry } from '../ai/aiProviderRegistry.js';
import { PROVIDER_IDS, GRADING_MODES, GRADING_STAGES } from '../ai/types.js';
import { scorePipelineLeitpunkte, collectPipelineGrammarErrors } from './grading/pipelineStageScorers.js';
import { collectUnassignedSentences } from './grading/unassignedSentences.js';
import { detectLetterContentFacts } from './grading/letterContentFacts.js';

function classifyArbitration(it) {
  if (it.isProtected) return 'protected';
  return it.score > it.baselineScore ? 'rescued' : 'adjusted';
}

function buildDiffSummary(items = []) {
  return items
    .filter((it) => it.arbitrated && (it.isProtected || it.score !== it.baselineScore))
    .map((it) => ({
      id: it.id,
      change: classifyArbitration(it),
      from: it.baselineScore,
      to: it.score,
      rankerScore: it.rankerScore,
    }));
}

// `score` is the level the regulation awarded (it may void a covered point); `detectedScore` is the coverage.
function attachPoints(items, score) {
  return items.map((it, i) => ({
    ...it,
    score: score.leitpunkte[i]?.level ?? it.score,
    detectedScore: it.score,
    points: score.leitpunkte[i]?.points ?? 0,
    maxPoints: score.leitpunkte[i]?.maxPoints ?? 0,
  }));
}

function buildCriteriaBreakdown({ stage1, items, score, regulation, unassignedSentences }) {
  return {
    scale: regulation.id,
    anrede: stage1.anredeScore,
    lp1: items[0]?.score ?? 0,
    lp2: items[1]?.score ?? 0,
    lp3: items[2]?.score ?? 0,
    gruss: stage1.grussScore,
    kg: score.kg.level,
    items,
    diagnostic: { anrede: stage1.anrede, gruss: stage1.gruss, items, unassignedSentences },
  };
}

/** onProgress receives { stage: GRADING_STAGES value, fraction 0..1, loadedBytes? }. */
function reportStage(onProgress, stage, fraction) {
  onProgress?.({ stage, fraction });
}

function resolveGradingMode(provider, modelUsed) {
  if (provider.id === PROVIDER_IDS.NONE) return GRADING_MODES.LIMITED;
  return modelUsed ? GRADING_MODES.RANKER : GRADING_MODES.RANKER_WITHOUT_MODEL;
}

function assembleGradingResult({ stage0, stage1, stage2, errors, score, regulation, activeProvider, examinerFeedback, diffSummary, userSegments }) {
  const { items } = stage2;
  const unassignedSentences = collectUnassignedSentences(stage0.bodySentences, stage2.items);
  const gradingMode = resolveGradingMode(activeProvider, stage2.modelUsed);
  return {
    word_count: stage0.wordCount,
    points_earned: score.total,
    max_points: score.maxPoints,
    is_correct: score.total >= regulation.trainingPassMark,
    is_limited_mode: gradingMode !== GRADING_MODES.RANKER,
    provider_id: activeProvider.id,
    grading_mode: gradingMode,
    breakdown: {
      anrede: stage1.anredeScore,
      leitpunkte: items.reduce((sum, it) => sum + it.points, 0),
      leitpunkte_void_reason: score.leitpunkteVoidReason ?? null,
      gruss: stage1.grussScore,
      kommunikative_gestaltung: score.kg,
      items,
    },
    criteria_breakdown: buildCriteriaBreakdown({ stage1, items, score, regulation, unassignedSentences }),
    grammar_errors: errors,
    examiner_feedback: examinerFeedback,
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
  const levelContext = resolveLevelContext(question.level);
  await levelContext.lexicon.load();
  const stage0 = runStage0Preprocessing(userText, levelContext);
  const raw = stage0.rawText;
  const criteria = resolveLeitpunktCriteria(question);
  const activeProvider = provider || (options.forceLimitedMode
    ? aiProviderRegistry.getProvider(PROVIDER_IDS.NONE)
    : await aiProviderRegistry.getActiveProvider());

  reportStage(onProgress, GRADING_STAGES.PREPROCESSING, 0.1);
  const isGibberish = isGibberishText(raw);
  const stage1 = runStage1Scoring(stage0);

  const levelPolicy = levelContext.policy;
  const userSegments = {
    anrede: stage1.anrede.text,
    closing: stage1.gruss.text,
    senderName: stage1.gruss.senderName,
    leitpunkte: segmentUserEssay(stage0.bodySentences, criteria, levelContext).leitpunkte,
  };

  reportStage(onProgress, GRADING_STAGES.LEITPUNKTE, 0.4);
  const customExtractor = options.forceLimitedMode ? false : options.customExtractor;
  const stage2 = await scorePipelineLeitpunkte({
    criteria,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    customExtractor,
    userSegments,
    policy: levelPolicy,
    onModelDownload: ({ loadedBytes }) => onProgress?.({ stage: GRADING_STAGES.MODEL_DOWNLOAD, fraction: 0.4, loadedBytes }),
  });

  reportStage(onProgress, GRADING_STAGES.GRAMMAR, 0.7);
  const baselineErrors = question.grammar_errors || options.baselineErrors || [];
  const errors = collectPipelineGrammarErrors({
    rawText: raw,
    semanticErrors: stage2.semanticErrors || [],
    baselineErrors,
    grammar: levelContext.grammar,
  });

  const { finalPoints, score, regulation } = computeTelcFinalScore({
    leitpunktLevels: stage2.items.map((it) => it.score),
    salutationScore: stage1.anredeScore,
    closingScore: stage1.grussScore,
    wordCount: stage0.wordCount,
    isGibberish,
    grammarErrors: errors,
    content: detectLetterContentFacts({ bodySentences: stage0.bodySentences, criteria, lexicon: levelContext.lexicon }),
    level: question.level,
  });

  reportStage(onProgress, GRADING_STAGES.FEEDBACK, 0.9);
  const scoredStage2 = { ...stage2, items: attachPoints(stage2.items, score) };
  const examinerFeedback = composeExaminerFeedback({
    context: {
      stage0, stage1, stage2: scoredStage2, errors, userSegments, finalPoints,
      maxPoints: score.maxPoints, isGibberish, leitpunkteVoidReason: score.leitpunkteVoidReason,
    },
    policy: levelPolicy,
  });

  const diffSummary = buildDiffSummary(stage2.items);

  reportStage(onProgress, GRADING_STAGES.DONE, 1);
  return assembleGradingResult({
    stage0, stage1, stage2: scoredStage2, errors, score, regulation, activeProvider, examinerFeedback, diffSummary, userSegments,
  });
}
