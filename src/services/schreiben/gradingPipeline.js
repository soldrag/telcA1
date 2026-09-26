/**
 * Single source of truth for Schreiben Teil 2 grading.
 * Orchestrates Stages 0-4 deterministically; providers execute only micro-tasks.
 * Detectors produce coverage levels (0/1/2); the exam regulation turns them into points.
 */

import { runStage0Preprocessing } from './grading/stage0Preprocessing.js';
import { runStage1Scoring } from './grading/stage1SalutationClosing.js';
import { composePipelineFeedback } from './grading/pipelineFeedback.js';
import { getRankerPolicy } from './grading/policies/index.js';
import { resolveLeitpunktCriteria } from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';
import { calculateLinguisticAccuracy } from './scoring/linguisticAccuracyScorer.js';
import { getGrammarProfile } from './profiles/index.js';
import { countLetterBodyWords } from './scoring/letterBodyWordCounter.js';
import { analyzeGermanQuality } from './germanQualityAnalyzer.js';
import { segmentUserEssay } from './schreibenTextSegmenter.js';
import { aiProviderRegistry } from '../ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../ai/types.js';
import { scorePipelineLeitpunkte, collectPipelineGrammarErrors } from './grading/pipelineStageScorers.js';
import { collectUnassignedSentences } from './grading/unassignedSentences.js';

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

function attachPoints(items, score) {
  return items.map((it, i) => ({
    ...it,
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

function assembleGradingResult({ stage0, stage1, stage2, errors, score, regulation, activeProvider, feedback, diffSummary, userSegments, linguisticAccuracy }) {
  const items = attachPoints(stage2.items, score);
  const unassignedSentences = collectUnassignedSentences(stage0.bodySentences, stage2.items);
  return {
    word_count: stage0.wordCount,
    points_earned: score.total,
    max_points: score.maxPoints,
    is_correct: score.total >= regulation.trainingPassMark,
    is_limited_mode: activeProvider.id === PROVIDER_IDS.NONE,
    provider_id: activeProvider.id,
    provider_name: activeProvider.name,
    linguistic_accuracy: linguisticAccuracy,
    breakdown: {
      anrede: stage1.anredeScore,
      leitpunkte: items.reduce((sum, it) => sum + it.points, 0),
      gruss: stage1.grussScore,
      kommunikative_gestaltung: score.kg,
      items,
    },
    criteria_breakdown: buildCriteriaBreakdown({ stage1, items, score, regulation, unassignedSentences }),
    grammar_errors: errors,
    feedback_summary: feedback.feedbackText,
    examiner_feedback: feedback.examinerFeedback,
    diff_summary: diffSummary,
    unassigned_sentences: unassignedSentences,
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
  const stage0 = runStage0Preprocessing(userText);
  const raw = stage0.rawText;
  const criteria = resolveLeitpunktCriteria(question);
  const activeProvider = provider || (options.forceLimitedMode
    ? aiProviderRegistry.getProvider(PROVIDER_IDS.NONE)
    : await aiProviderRegistry.getActiveProvider());

  onProgress?.('Vorverarbeitung und Textanalyse...', 0.1);
  const quality = analyzeGermanQuality(raw, 30);
  const stage1 = runStage1Scoring(stage0);

  const { lexicon } = getRankerPolicy(question.level);
  const seg = segmentUserEssay(raw, criteria, { lexicon });
  const userSegments = {
    anrede: stage0.salutation.recognized ? stage0.salutation.text : (seg.anrede || ''),
    closing: stage0.closing.recognized ? stage0.closing.text : (seg.closing || ''),
    senderName: stage0.closing.senderName || seg.senderName || '',
    leitpunkte: seg.leitpunkte,
  };

  onProgress?.('Prüfung der Leitpunkte...', 0.4);
  const customExtractor = options.forceLimitedMode ? false : options.customExtractor;
  const stage2 = await scorePipelineLeitpunkte({
    criteria,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    customExtractor,
    userSegments,
    lexicon,
  });

  onProgress?.('Grammatikprüfung...', 0.7);
  const baselineErrors = question.grammar_errors || options.baselineErrors || [];
  const errors = await collectPipelineGrammarErrors({
    rawText: raw,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    semanticErrors: stage2.semanticErrors || [],
    baselineErrors,
  });

  const { finalPoints, score, regulation } = computeTelcFinalScore({
    leitpunktLevels: stage2.items.map((it) => it.score),
    salutationScore: stage1.anredeScore,
    closingScore: stage1.grussScore,
    wordCount: stage0.wordCount,
    isGibberish: quality.isGibberish,
    grammarErrors: errors,
    level: question.level,
  });

  onProgress?.('Erstelle Feedback...', 0.9);
  const feedback = await composePipelineFeedback({
    context: {
      stage0, stage1, stage2, errors, userSegments, finalPoints,
      maxPoints: score.maxPoints, isGibberish: quality.isGibberish,
    },
    policy: getRankerPolicy(question.level),
    activeProvider,
    enableLlmPolish: options.enableLlmPolish,
  });

  const diffSummary = buildDiffSummary(stage2.items);
  const linguisticAccuracy = calculateLinguisticAccuracy({
    grammarErrors: errors,
    wordCount: countLetterBodyWords(userText),
    isGibberish: quality.isGibberish,
    weights: getGrammarProfile(question.level).accuracyWeights,
  });

  onProgress?.('Bewertung abgeschlossen', 1.0);
  return assembleGradingResult({
    stage0, stage1, stage2, errors, score, regulation, activeProvider, feedback, diffSummary, userSegments, linguisticAccuracy,
  });
}
