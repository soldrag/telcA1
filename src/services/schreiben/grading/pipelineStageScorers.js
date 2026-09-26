/**
 * Stage scorers and collectors for Schreiben grading pipeline.
 * Extracts sentence embeddings scoring and candidate error gathering from the main pipeline orchestrator.
 */

import { evaluateCriterionKeywords } from './stage2Leitpunkte.js';
import { arbitrateLeitpunkt, shouldArbitrateLeitpunkt } from './leitpunktArbitration.js';
import { formatCriterionQuery } from './rankerFallbackScorer.js';
import { SIMILARITY_T2, SIMILARITY_T1 } from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { filterCandidateErrors } from './stage3Grammar.js';
import { checkGermanA1Grammar } from '../germanGrammarChecker.js';
import { assessEvidenceSentences } from './criterionPolarityGate.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { computeEmbedding, getCachedLpEmbedding } from '../../embeddings/embeddingService.js';
import { createRankerEmbedder, buildSentenceVectorMap } from '../../embeddings/rankerEmbedder.js';
import { mergeCandidateGrammarErrors } from '../linguistic/sentenceGrammarFilter.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';
import { resolveLpDiagnosticCode } from '../feedback/feedbackContracts.js';

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

async function gatherCriterionEvidence({ crit, critIdx, bodySentences, sentenceVectors, customExtractor, userSegments }) {
  const kw = evaluateCriterionKeywords(bodySentences, crit);
  let bestSim = 0;
  const relSentences = [...kw.relevantSentences];

  const assigned = userSegments?.leitpunkte?.[critIdx]?.userSentence;
  const segSentences = userSegments?.leitpunkte?.[critIdx]?.sentences
    || (assigned && assigned !== 'Kein Satz im Text gefunden' ? splitGermanSentences(assigned) : []);
  for (const s of [...segSentences].reverse()) {
    const idx = relSentences.indexOf(s);
    if (idx > -1) relSentences.splice(idx, 1);
    relSentences.unshift(s);
  }

  if (sentenceVectors.length > 0) {
    try {
      const lpQuery = formatCriterionQuery(crit.label || crit.id, crit.keywords);
      const lpVec = await getCachedLpEmbedding(crit.id, lpQuery, customExtractor);
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
  return { relSentences, effectiveSim, keywordSentences: kw.relevantSentences };
}

function calculateBaseScore(effectiveSim, framePenalty) {
  if (framePenalty >= 2) return 0;
  const rawScore = effectiveSim >= SIMILARITY_T2 ? 2 : (effectiveSim >= SIMILARITY_T1 ? 1 : 0);
  return framePenalty === 1 ? Math.min(rawScore, 1) : rawScore;
}

async function scoreCriterionItem(params) {
  const { crit, provider, bodySentences, rankerEmbedder, criteria = [] } = params;
  const lpText = crit.label || crit.id;
  const { relSentences, effectiveSim, keywordSentences } = await gatherCriterionEvidence(params);
  const hasAffirmativeEvidence = keywordSentences.length > 0;
  const frameCheck = assessEvidenceSentences({ sentences: relSentences, criterion: crit, hasAffirmativeEvidence });
  const baseScore = calculateBaseScore(effectiveSim, frameCheck.penalty);

  let finalScore = baseScore;
  let arbitrated = false;
  let rankerDetails = null;
  let arbitration = null;

  if (shouldArbitrateLeitpunkt({ provider, effectiveSim, framePenalty: frameCheck.penalty })) {
    const sentences = relSentences.length > 0 ? relSentences : (bodySentences || []);
    const arb = await arbitrateLeitpunkt({
      criterion: crit, sentences, baselineScore: baseScore, provider,
      embedder: rankerEmbedder, rivalCriteria: criteria.filter((c) => c !== crit),
    });
    finalScore = arb.score;
    arbitrated = arb.arbitrated;
    rankerDetails = arb.rankerDetails || null;
    arbitration = { rankerScore: arb.rankerScore, isProtected: Boolean(arb.isProtected) };
  }

  const diagnosticCode = resolveLpDiagnosticCode(finalScore, frameCheck.inversionInfo, frameCheck.penalty === 0);

  return {
    id: crit.id,
    label: lpText,
    score: finalScore,
    baselineScore: baseScore,
    arbitrated,
    rankerScore: arbitration?.rankerScore ?? null,
    isProtected: arbitration?.isProtected ?? false,
    diagnosticCode,
    matchedSentence: rankerDetails?.matchedSentence || relSentences[0] || '',
    keywordSentences,
    frameErrors: frameCheck.frameErrors,
    rankerDetails,
  };
}

export async function scorePipelineLeitpunkte({ criteria, bodySentences, provider, customExtractor, userSegments = null }) {
  const sentenceVectors = await computeSentenceVectors(bodySentences, customExtractor);
  const rankerEmbedder = sentenceVectors.some(Boolean)
    ? createRankerEmbedder({ customExtractor, sentenceVectors: buildSentenceVectorMap(bodySentences, sentenceVectors) })
    : null;
  const items = [];
  const semanticErrors = [];

  for (let idx = 0; idx < criteria.length; idx++) {
    const scoredItem = await scoreCriterionItem({
      crit: criteria[idx], critIdx: idx, bodySentences, sentenceVectors, customExtractor, provider, userSegments, rankerEmbedder, criteria
    });
    items.push(scoredItem);
    if (scoredItem.frameErrors?.length > 0) semanticErrors.push(...scoredItem.frameErrors);
  }

  const totalScore = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  return { items, totalScore, semanticErrors };
}

export async function collectPipelineGrammarErrors({ rawText, bodySentences, provider, semanticErrors = [], baselineErrors = [] }) {
  const ruleErrors = checkGermanA1Grammar(rawText) || [];
  const baseMerged = mergeCandidateGrammarErrors(baselineErrors, ruleErrors);
  const initial = mergeCandidateGrammarErrors(baseMerged, semanticErrors);
  if (!provider || provider.id === PROVIDER_IDS.NONE) return initial;

  const candidateList = [];
  for (const s of bodySentences.slice(0, 5)) {
    try {
      const rawCandidates = await provider.proposeGrammarCandidates(s);
      candidateList.push(...filterCandidateErrors(s, rawCandidates, 2));
    } catch (err) {
      console.warn('[PipelineStageScorers] Candidate grammar check skipped for sentence:', err?.message || err);
    }
  }

  return mergeCandidateGrammarErrors(initial, candidateList);
}
