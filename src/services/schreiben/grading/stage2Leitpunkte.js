/**
 * Stage 2: Leitpunkte Scoring (EmbeddingGemma + Qwen3 Arbiter).
 * Computes cosine similarity of body sentences against Leitpunkte queries,
 * incorporates per-LP keywords, and triggers Qwen3 arbitration ONLY in gray zones.
 */

import {
  SIMILARITY_T2,
  SIMILARITY_T1,
  GRAY_ZONE_DELTA,
  LEITPUNKT_COVERAGE_SCHEMA
} from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { getEmbedding } from './embeddingGemmaService.js';
import { stemGermanWord } from '../linguistic/germanStemmer.js';
import { tagTokens } from '../linguistic/a1LexiconService.js';
import { validateSentenceFrame } from '../linguistic/semanticFrameValidator.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';
import { buildArbiterPrompt, arbitrateGrayZone } from './stage2Arbitration.js';

export { buildArbiterPrompt, arbitrateGrayZone };

export function isScoreInGrayZone(similarity = 0, delta = GRAY_ZONE_DELTA) {
  const nearT2 = Math.abs(similarity - SIMILARITY_T2) <= delta;
  const nearT1 = Math.abs(similarity - SIMILARITY_T1) <= delta;
  return nearT2 || nearT1;
}

export function coverageToPoints(coverage = '', fallback = 0) {
  const c = String(coverage || '').toLowerCase().trim();
  if (c === 'full') return 2;
  if (c === 'partial') return 1;
  if (c === 'no') return 0;
  return fallback;
}

export function applyConfidenceFloor(baselineScore = 0, rawScore = 0) {
  const guardedScore = baselineScore >= 1 ? Math.max(baselineScore, rawScore) : rawScore;
  const isProtected = baselineScore >= 1 && rawScore < baselineScore;
  return { score: guardedScore, isProtected };
}

export function evaluateCriterionKeywords(sentences = [], criterion = {}) {
  const rawKeywords = criterion.keywords || [];
  if (rawKeywords.length === 0) return { matchedCount: 0, score: 0, relevantSentences: [] };

  const critStems = rawKeywords.map(k => stemGermanWord(k.toLowerCase()));
  const affirmativeSentences = sentences.filter(s => !detectSemanticInversion(s, criterion).isInverted);

  const allWords = affirmativeSentences
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .map(w => stemGermanWord(w))
    .filter(s => s && s.length >= 2);

  let matchedCount = 0;
  for (const cStem of critStems) {
    if (allWords.includes(cStem)) {
      matchedCount += 1;
    }
  }

  const req = criterion.requiredMatches !== undefined ? criterion.requiredMatches : 2;
  const threshold = Math.min(req, Math.max(1, critStems.length));

  const relevantSentences = affirmativeSentences.filter(s => {
    const sWords = s.toLowerCase().split(/\s+/).map(w => stemGermanWord(w));
    return critStems.some(c => sWords.includes(c));
  });

  const kwScore = matchedCount >= threshold ? 2 : (matchedCount > 0 ? 1 : 0);
  return { matchedCount, score: kwScore, relevantSentences };
}

function checkRelevantSentencesFrame(sentences = [], criterion = {}) {
  let penalty = 0;
  for (const s of sentences) {
    const pol = detectSemanticInversion(s, criterion);
    if (pol.isInverted) {
      penalty = Math.max(penalty, 2);
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
    }
  }
  return penalty;
}

export async function scoreSingleLeitpunkt({
  criterion = {},
  bodySentences = [],
  sentenceEmbeddings = [],
  embedder = null,
  qwenEngine = null
}) {
  const lpText = criterion.label || criterion.id;
  const kwEval = evaluateCriterionKeywords(bodySentences, criterion);

  let bestSim = 0;
  let relevantSentencesList = [...kwEval.relevantSentences];

  if (embedder && bodySentences.length > 0) {
    const lpVec = await getEmbedding(lpText, true, embedder);
    bodySentences.forEach((s, idx) => {
      const sVec = sentenceEmbeddings[idx];
      const sim = sVec ? cosineSimilarity(lpVec, sVec) : 0;
      if (sim > bestSim) bestSim = sim;
      if (sim >= 0.35 && !relevantSentencesList.includes(s)) {
        relevantSentencesList.push(s);
      }
    });
  }

  // Hybrid score: strong keyword evidence guarantees a high baseline similarity
  const kwSim = kwEval.score === 2 ? 0.75 : (kwEval.score === 1 ? 0.50 : 0.20);
  const effectiveSim = Math.max(bestSim, kwSim);

  const baselineScore = effectiveSim >= SIMILARITY_T2 ? 2 : (effectiveSim >= SIMILARITY_T1 ? 1 : 0);
  const inGrayZone = isScoreInGrayZone(effectiveSim);

  const framePenalty = checkRelevantSentencesFrame(relevantSentencesList, criterion);
  let finalScore = baselineScore;
  let arbitrated = false;

  if (framePenalty >= 2) {
    finalScore = 0;
  } else if (framePenalty === 1) {
    finalScore = Math.min(baselineScore, 1);
  } else if (kwEval.score === 2) {
    finalScore = 2;
  } else if (inGrayZone && relevantSentencesList.length > 0 && qwenEngine) {
    const arbRes = await arbitrateGrayZone({
      lpLabel: lpText,
      relevantSentences: relevantSentencesList.join(' '),
      baselineScore,
      qwenEngine
    });
    finalScore = arbRes.score;
    arbitrated = arbRes.arbitrated;
  }

  return {
    id: criterion.id,
    label: lpText,
    score: finalScore,
    baselineScore,
    maxScore: 2,
    similarity: Number(effectiveSim.toFixed(3)),
    inGrayZone,
    arbitrated,
    matchedSentences: relevantSentencesList
  };
}

export async function runStage2Leitpunkte({
  criteria = [],
  bodySentences = [],
  embedder = null,
  qwenEngine = null
}) {
  let sentenceEmbeddings = [];
  if (embedder && bodySentences.length > 0) {
    sentenceEmbeddings = await Promise.all(
      bodySentences.map(s => getEmbedding(s, false, embedder))
    );
  }

  const items = [];
  let totalScore = 0;

  for (const crit of criteria) {
    const scored = await scoreSingleLeitpunkt({
      criterion: crit,
      bodySentences,
      sentenceEmbeddings,
      embedder,
      qwenEngine
    });
    items.push(scored);
    totalScore += scored.score;
  }

  return {
    totalScore,
    maxScore: criteria.length * 2,
    items
  };
}
