/**
 * Stage 2: Leitpunkte Scoring (EmbeddingGemma + Qwen3 Arbiter).
 * Computes cosine similarity of body sentences against Leitpunkte queries,
 * incorporates per-LP keywords, and triggers Qwen3 arbitration ONLY in gray zones.
 */

import { SIMILARITY_T2, SIMILARITY_T1, GRAY_ZONE_DELTA } from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { getEmbedding } from './embeddingGemmaService.js';
import { findMatchedKeywords } from '../linguistic/keywordStemMatcher.js';
import { countMatchedConcepts } from '../linguistic/keywordConcepts.js';
import { extractAffirmativeText } from '../linguistic/semanticPolarityValidator.js';
import { buildArbiterPrompt, arbitrateGrayZone } from './stage2Arbitration.js';
import { assessEvidenceSentences } from './criterionPolarityGate.js';
import { hasTemporalExpression } from './temporalRangeDetector.js';
import { hasTemporalEvidence } from '../linguistic/criterionIntents.js';
import { requireLevelPort } from './levelPorts.js';
import { isClaimedByRival, keywordThreshold } from './rivalEvidence.js';

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

function collectAffirmativeEvidence(sentences, criterion, lexicon) {
  return sentences
    .map(sentence => ({ sentence, text: extractAffirmativeText(sentence, criterion, { lexicon }) }))
    .filter(evidence => evidence.text);
}

function isTemporalEvidence(text, criterion, context) {
  return hasTemporalExpression(text) && !isClaimedByRival(text, { criterion, ...context });
}

/**
 * @param {{ lexicon: object, rivalCriteria?: object[] }} context - the level's lexicon port (ranker policy
 *   `lexicon`) and the task's other Leitpunkte, which claim the dates they name
 */
export function evaluateCriterionKeywords(sentences = [], criterion = {}, { lexicon, rivalCriteria = [] } = {}) {
  requireLevelPort(lexicon, 'evaluateCriterionKeywords: lexicon');
  const rawKeywords = criterion.keywords || [];
  if (rawKeywords.length === 0) return { matchedCount: 0, score: 0, relevantSentences: [] };

  const affirmative = collectAffirmativeEvidence(sentences, criterion, lexicon);
  const allWords = affirmative.map(a => a.text).join(' ').split(/\s+/);
  let matchedCount = countMatchedConcepts(rawKeywords, allWords, lexicon);

  const isTemporalCrit = hasTemporalEvidence(criterion);
  const hasTemp = (text) => isTemporalCrit && isTemporalEvidence(text, criterion, { rivalCriteria, lexicon });
  if (affirmative.some(({ text }) => hasTemp(text))) matchedCount += 1;

  const relevantSentences = affirmative
    .filter(({ text }) => findMatchedKeywords(rawKeywords, text.split(/\s+/), lexicon).length > 0 || hasTemp(text))
    .map(a => a.sentence);

  const threshold = keywordThreshold(criterion, lexicon);
  const kwScore = matchedCount >= threshold ? 2 : (matchedCount > 0 ? 1 : 0);
  return { matchedCount, score: kwScore, relevantSentences };
}

export async function scoreSingleLeitpunkt({
  criterion = {},
  bodySentences = [],
  sentenceEmbeddings = [],
  embedder = null,
  qwenEngine = null,
  lexicon,
  rivalCriteria = []
}) {
  const lpText = criterion.label || criterion.id;
  const kwEval = evaluateCriterionKeywords(bodySentences, criterion, { lexicon, rivalCriteria });

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

  const { penalty: framePenalty } = assessEvidenceSentences({
    sentences: relevantSentencesList, criterion, hasAffirmativeEvidence: kwEval.relevantSentences.length > 0, lexicon
  });
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

/** lexicon: the level's lexicon port (resolveLevelContext) */
export async function runStage2Leitpunkte({ criteria = [], bodySentences = [], embedder = null, qwenEngine = null, lexicon }) {
  let sentenceEmbeddings = [];
  if (embedder && bodySentences.length > 0) {
    sentenceEmbeddings = await Promise.all(bodySentences.map(s => getEmbedding(s, false, embedder)));
  }

  const items = [];
  let totalScore = 0;
  for (const crit of criteria) {
    const scored = await scoreSingleLeitpunkt({ criterion: crit, bodySentences, sentenceEmbeddings, embedder, qwenEngine, lexicon, rivalCriteria: criteria });
    items.push(scored);
    totalScore += scored.score;
  }

  return { totalScore, maxScore: criteria.length * 2, items };
}
