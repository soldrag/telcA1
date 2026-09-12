/**
 * Stage scorers and collectors for Schreiben grading pipeline.
 * Extracts sentence embeddings scoring and candidate error gathering from the main pipeline orchestrator.
 */

import { evaluateCriterionKeywords, isScoreInGrayZone, coverageToPoints } from './stage2Leitpunkte.js';
import { SIMILARITY_T2, SIMILARITY_T1 } from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { filterCandidateErrors } from './stage3Grammar.js';
import { checkGermanA1Grammar } from '../germanGrammarChecker.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { computeEmbedding, getCachedLpEmbedding } from '../../embeddings/embeddingService.js';

async function arbitrateLeitpunkt(criterion, relevantSentences, baselineScore, provider) {
  if (!relevantSentences || !provider || provider.id === PROVIDER_IDS.NONE) {
    return { score: baselineScore, arbitrated: false };
  }
  try {
    const res = await provider.classifyCoverage(criterion, relevantSentences);
    const newScore = coverageToPoints(res?.coverage, baselineScore);
    return { score: newScore, arbitrated: newScore !== baselineScore };
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

async function scoreCriterionItem({ crit, bodySentences, sentenceVectors, customExtractor, provider }) {
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
    } catch (err) {
      console.warn('[PipelineStageScorers] LP vector matching failed:', err?.message || err);
    }
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

  return { id: crit.id, label: lpText, score: finalScore, baselineScore: baseScore, arbitrated };
}

export async function scorePipelineLeitpunkte({ criteria, bodySentences, provider, customExtractor }) {
  const sentenceVectors = await computeSentenceVectors(bodySentences, customExtractor);
  const items = [];

  for (const crit of criteria) {
    const scoredItem = await scoreCriterionItem({
      crit,
      bodySentences,
      sentenceVectors,
      customExtractor,
      provider,
    });
    items.push(scoredItem);
  }

  const totalScore = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  return { items, totalScore };
}

export async function collectPipelineGrammarErrors({ rawText, bodySentences, provider }) {
  const baseline = checkGermanA1Grammar(rawText) || [];
  if (!provider || provider.id === PROVIDER_IDS.NONE) return baseline;

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

  const merged = [...baseline];
  const seenOriginals = new Set(baseline.map((e) => e.original.toLowerCase()));
  for (const c of candidateList) {
    if (!seenOriginals.has(c.original.toLowerCase())) {
      seenOriginals.add(c.original.toLowerCase());
      merged.push(c);
    }
  }
  return merged;
}
