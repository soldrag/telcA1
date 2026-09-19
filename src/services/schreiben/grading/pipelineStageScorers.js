/**
 * Stage scorers and collectors for Schreiben grading pipeline.
 * Extracts sentence embeddings scoring and candidate error gathering from the main pipeline orchestrator.
 */

import { evaluateCriterionKeywords, isScoreInGrayZone, coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { SIMILARITY_T2, SIMILARITY_T1 } from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { filterCandidateErrors } from './stage3Grammar.js';
import { checkGermanA1Grammar } from '../germanGrammarChecker.js';
import { tagTokens } from '../linguistic/a1LexiconService.js';
import { validateSentenceFrame } from '../linguistic/semanticFrameValidator.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { computeEmbedding, getCachedLpEmbedding } from '../../embeddings/embeddingService.js';
import { mergeCandidateGrammarErrors } from '../linguistic/sentenceGrammarFilter.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';
import { resolveLpDiagnosticCode } from '../feedback/feedbackContracts.js';

async function arbitrateLeitpunkt(criterion, relevantSentences, baselineScore, provider) {
  if (!relevantSentences || !provider || provider.id === PROVIDER_IDS.NONE) {
    return { score: baselineScore, arbitrated: false };
  }
  try {
    const res = await provider.classifyCoverage(criterion, relevantSentences);
    const rawScore = coverageToPoints(res?.coverage, baselineScore);
    const { score: guardedScore, isProtected } = applyConfidenceFloor(baselineScore, rawScore);
    return { score: guardedScore, arbitrated: guardedScore !== baselineScore || isProtected };
  } catch (err) {
    console.warn('[PipelineStageScorers] LP arbitration skipped on error:', err?.message || err);
    return { score: baselineScore, arbitrated: false };
  }
}

async function computeSentenceVectors(bodySentences, customExtractor) {
  if (bodySentences.length === 0 || customExtractor === false) return [];
  try {
    return await Promise.all(
      bodySentences.map((s) => computeEmbedding(s, false, customExtractor).catch(() => null))
    );
  } catch (err) {
    console.warn('[PipelineStageScorers] Embedding computation failed, falling back to keywords:', err?.message || err);
    return [];
  }
}

function checkRelevantSentencesFrame(sentences = [], criterion = {}) {
  let penalty = 0;
  const frameErrors = [];
  let inversionInfo = { isInverted: false };
  for (const s of sentences) {
    const pol = detectSemanticInversion(s, criterion);
    if (pol.isInverted) {
      penalty = Math.max(penalty, 2);
      inversionInfo = pol;
    }

    const words = s.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
    const tagged = tagTokens(words);
    const res = validateSentenceFrame({
      taggedTokens: tagged,
      conversiveRules: criterion.conversive_rules || [],
      semanticSlots: criterion.semantic_slots || []
    });
    if (!res.isValid) {
      penalty = Math.max(penalty, res.maxPenalty);
      frameErrors.push(...res.errors);
    }
  }
  return { penalty, frameErrors, inversionInfo };
}

async function gatherCriterionEvidence({ crit, critIdx, bodySentences, sentenceVectors, customExtractor, userSegments }) {
  const kw = evaluateCriterionKeywords(bodySentences, crit);
  let bestSim = 0;
  const relSentences = [...kw.relevantSentences];

  const assigned = userSegments?.leitpunkte?.[critIdx]?.userSentence;
  const segSentences = userSegments?.leitpunkte?.[critIdx]?.sentences
    || (assigned && assigned !== 'Kein Satz im Text gefunden' ? splitGermanSentences(assigned) : []);
  for (const s of segSentences) {
    if (!relSentences.includes(s)) relSentences.push(s);
  }

  if (sentenceVectors.length > 0) {
    try {
      const lpVec = await getCachedLpEmbedding(crit.id, crit.label || crit.id, customExtractor);
      bodySentences.forEach((s, i) => {
        const sVec = sentenceVectors[i];
        const sim = sVec && lpVec ? cosineSimilarity(lpVec, sVec) : 0;
        if (sim > bestSim) bestSim = sim;
        if (sim >= 0.35 && !relSentences.includes(s)) relSentences.push(s);
      });
    } catch (err) {
      console.warn('[PipelineStageScorers] LP vector matching failed:', err?.message || err);
    }
  }

  const kwSim = kw.score === 2 ? 0.75 : (kw.score === 1 ? 0.50 : 0.20);
  const effectiveSim = Math.max(bestSim, kwSim);
  return { relSentences, effectiveSim };
}

function calculateBaseScore(effectiveSim, framePenalty) {
  if (framePenalty >= 2) return 0;
  const rawScore = effectiveSim >= SIMILARITY_T2 ? 2 : (effectiveSim >= SIMILARITY_T1 ? 1 : 0);
  return framePenalty === 1 ? Math.min(rawScore, 1) : rawScore;
}

async function scoreCriterionItem(params) {
  const { crit, provider } = params;
  const lpText = crit.label || crit.id;
  const { relSentences, effectiveSim } = await gatherCriterionEvidence(params);
  const frameCheck = checkRelevantSentencesFrame(relSentences, crit);
  const baseScore = calculateBaseScore(effectiveSim, frameCheck.penalty);

  let finalScore = baseScore;
  let arbitrated = false;
  if (isScoreInGrayZone(effectiveSim) && frameCheck.penalty === 0) {
    const arb = await arbitrateLeitpunkt(crit, relSentences.join(' '), baseScore, provider);
    finalScore = arb.score;
    arbitrated = arb.arbitrated;
  }

  const diagnosticCode = resolveLpDiagnosticCode(finalScore, frameCheck.inversionInfo, frameCheck.penalty === 0);

  return {
    id: crit.id,
    label: lpText,
    score: finalScore,
    baselineScore: baseScore,
    arbitrated,
    diagnosticCode,
    matchedSentence: relSentences[0] || '',
    frameErrors: frameCheck.frameErrors
  };
}

export async function scorePipelineLeitpunkte({
  criteria,
  bodySentences,
  provider,
  customExtractor,
  userSegments = null,
}) {
  const sentenceVectors = await computeSentenceVectors(bodySentences, customExtractor);
  const items = [];
  const semanticErrors = [];

  for (let idx = 0; idx < criteria.length; idx++) {
    const crit = criteria[idx];
    const scoredItem = await scoreCriterionItem({
      crit,
      critIdx: idx,
      bodySentences,
      sentenceVectors,
      customExtractor,
      provider,
      userSegments,
    });
    items.push(scoredItem);
    if (scoredItem.frameErrors?.length > 0) {
      semanticErrors.push(...scoredItem.frameErrors);
    }
  }

  const totalScore = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  return { items, totalScore, semanticErrors };
}

export async function collectPipelineGrammarErrors({
  rawText,
  bodySentences,
  provider,
  semanticErrors = [],
  baselineErrors = []
}) {
  const ruleErrors = checkGermanA1Grammar(rawText) || [];
  const baseMerged = mergeCandidateGrammarErrors(baselineErrors, ruleErrors);
  const initial = mergeCandidateGrammarErrors(baseMerged, semanticErrors);
  if (!provider || provider.id === PROVIDER_IDS.NONE) return initial;

  const candidateList = [];
  for (const s of bodySentences.slice(0, 5)) {
    try {
      const rawCandidates = await provider.proposeGrammarCandidates(s);
      const filtered = filterCandidateErrors(s, rawCandidates, 2);
      candidateList.push(...filtered);
    } catch (err) {
      console.warn('[PipelineStageScorers] Candidate grammar check skipped for sentence:', err?.message || err);
    }
  }

  return mergeCandidateGrammarErrors(initial, candidateList);
}
