/**
 * Single source of truth for Schreiben Teil 2 grading.
 * Orchestrates Stages 0-4 deterministically; providers execute only micro-tasks.
 */

import { runStage0Preprocessing } from './grading/stage0Preprocessing.js';
import { runStage1Scoring } from './grading/stage1SalutationClosing.js';
import {
  evaluateCriterionKeywords,
  isScoreInGrayZone,
  coverageToPoints
} from './grading/stage2Leitpunkte.js';
import { SIMILARITY_T2, SIMILARITY_T1 } from './grading/types.js';
import { cosineSimilarity } from './grading/vectorMath.js';
import { filterCandidateErrors, computeGrammarPenalty } from './grading/stage3Grammar.js';
import { checkGermanA1Grammar } from './germanGrammarChecker.js';
import { assembleDeterministicFeedback } from './grading/stage4Feedback.js';
import { resolveLeitpunktCriteria } from './deterministicBaseline.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';
import { analyzeGermanQuality } from './germanQualityAnalyzer.js';
import { segmentUserEssay } from './schreibenTextSegmenter.js';
import { aiProviderRegistry } from '../ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../ai/types.js';
import { computeEmbedding, getCachedLpEmbedding } from '../embeddings/embeddingService.js';

async function arbitrateLeitpunkt(criterion, relevantSentences, baselineScore, provider) {
  if (!relevantSentences || !provider || provider.id === PROVIDER_IDS.NONE) {
    return { score: baselineScore, arbitrated: false };
  }
  try {
    const res = await provider.classifyCoverage(criterion, relevantSentences);
    const newScore = coverageToPoints(res?.coverage, baselineScore);
    return { score: newScore, arbitrated: newScore !== baselineScore };
  } catch (err) {
    console.warn('[GradingPipeline] LP arbitration skipped on error:', err?.message || err);
    return { score: baselineScore, arbitrated: false };
  }
}

async function scoreLeitpunkte({ criteria, bodySentences, provider, customExtractor, onProgress }) {
  let sentenceVectors = [];
  try {
    if (bodySentences.length > 0 && customExtractor !== false) {
      sentenceVectors = await Promise.all(
        bodySentences.map(s => computeEmbedding(s, false, customExtractor).catch(() => null))
      );
    }
  } catch {}

  const items = [];
  for (const crit of criteria) {
    const lpText = crit.label || crit.id;
    const kw = evaluateCriterionKeywords(bodySentences, crit);
    let bestSim = 0;
    const relSentences = [...kw.relevantSentences];

    if (sentenceVectors.length > 0) {
      try {
        const lpVec = await getCachedLpEmbedding(crit.id, lpText, customExtractor);
        bodySentences.forEach((s, i) => {
          const sVec = sentenceVectors[i];
          const sim = sVec && lpVec ? cosineSimilarity(lpVec, sVec) : 0;
          if (sim > bestSim) bestSim = sim;
          if (sim >= 0.35 && !relSentences.includes(s)) relSentences.push(s);
        });
      } catch {}
    }

    const kwSim = kw.score === 2 ? 0.75 : (kw.score === 1 ? 0.50 : 0.20);
    const effectiveSim = Math.max(bestSim, kwSim);
    const baseScore = effectiveSim >= SIMILARITY_T2 ? 2 : (effectiveSim >= SIMILARITY_T1 ? 1 : 0);

    let finalScore = baseScore;
    let arbitrated = false;
    if (isScoreInGrayZone(effectiveSim)) {
      const arb = await arbitrateLeitpunkt(crit, relSentences.join(' '), baseScore, provider);
      finalScore = arb.score;
      arbitrated = arb.arbitrated;
    }

    items.push({ id: crit.id, label: lpText, score: finalScore, baselineScore: baseScore, arbitrated });
  }

  const totalScore = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  return { items, totalScore };
}

async function collectGrammarErrors({ rawText, bodySentences, provider }) {
  const baseline = checkGermanA1Grammar(rawText) || [];
  if (!provider || provider.id === PROVIDER_IDS.NONE) return baseline;

  const candidateList = [];
  for (const s of bodySentences.slice(0, 5)) {
    try {
      const rawCandidates = await provider.proposeGrammarCandidates(s);
      const filtered = filterCandidateErrors(s, rawCandidates, 2);
      candidateList.push(...filtered);
    } catch {}
  }

  const merged = [...baseline];
  const seenOriginals = new Set(baseline.map(e => e.original.toLowerCase()));
  for (const c of candidateList) {
    if (!seenOriginals.has(c.original.toLowerCase())) {
      seenOriginals.add(c.original.toLowerCase());
      merged.push(c);
    }
  }
  return merged;
}

export async function gradeSchreibenSubmission({
  userText = '',
  question = {},
  provider = null,
  options = {},
  onProgress = null
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
  const extractorOption = options.forceLimitedMode ? false : options.customExtractor;
  const stage2 = await scoreLeitpunkte({
    criteria,
    bodySentences: stage0.bodySentences,
    provider: activeProvider,
    customExtractor: extractorOption,
    onProgress
  });

  onProgress?.('Grammatikprüfung...', 0.7);
  const errors = await collectGrammarErrors({
    rawText: raw,
    bodySentences: stage0.bodySentences,
    provider: activeProvider
  });
  const grammarPenalty = computeGrammarPenalty(errors.length);

  onProgress?.('Erstelle Feedback...', 0.9);
  const facts = {
    anredeScore: stage1.anredeScore,
    lpScore: stage2.totalScore,
    grussScore: stage1.grussScore,
    grammarErrorCount: errors.length
  };
  let feedbackText = assembleDeterministicFeedback(facts);
  if (options.enableLlmPolish && activeProvider.id !== PROVIDER_IDS.NONE) {
    try {
      feedbackText = await activeProvider.polishFeedback(facts);
    } catch {}
  }

  const { finalPoints } = computeTelcFinalScore({
    salutationScore: stage1.anredeScore,
    leitpunkteScore: stage2.totalScore,
    closingScore: stage1.grussScore,
    wordCount: stage0.wordCount,
    isGibberish: quality.isGibberish,
    grammarErrorsCount: errors.length
  });

  const diffSummary = stage2.items
    .filter(it => it.arbitrated)
    .map(it => ({
      id: it.id,
      change: it.score > it.baselineScore ? 'rescued' : (it.score < it.baselineScore ? 'adjusted' : 'protected'),
      from: it.baselineScore,
      to: it.score
    }));

  const seg = segmentUserEssay(raw, criteria);
  onProgress?.('Bewertung abgeschlossen', 1.0);

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
      items: stage2.items
    },
    criteria_breakdown: {
      anrede: stage1.anredeScore,
      lp1: stage2.items[0]?.score ?? 0,
      lp2: stage2.items[1]?.score ?? 0,
      lp3: stage2.items[2]?.score ?? 0,
      gruss: stage1.grussScore,
      items: stage2.items
    },
    grammar_errors: errors,
    grammar_penalty: grammarPenalty,
    feedback_summary: feedbackText,
    diff_summary: diffSummary,
    user_segments: {
      anrede: stage0.salutation.recognized ? stage0.salutation.text : (seg.anrede || ''),
      closing: stage0.closing.recognized ? stage0.closing.text : (seg.closing || ''),
      senderName: stage0.closing.senderName || seg.senderName || '',
      leitpunkte: seg.leitpunkte
    }
  };
}
