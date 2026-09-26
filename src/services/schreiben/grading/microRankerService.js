/**
 * Client-side Micro-Ranker Service (System 1 Decision Model).
 * Scores criterion coverage as max(deterministic fallback, cosine(EmbeddingGemma query, sentence)).
 * The embedder is an injected port (see embeddings/rankerEmbedder.js) — no model is owned here,
 * so the ranker shares the Stage 2 EmbeddingGemma instance and precomputed sentence vectors.
 * Accepts pluggable IRankerPolicy (DIP). Fully static and browser-first.
 */

import {
  splitCompoundCriterion,
  isCompoundCriterion,
} from './compoundCriterionDecomposer.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';
import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';
import { cosineSimilarity } from './vectorMath.js';
import {
  computeDeterministicFallbackScore,
  formatCriterionQuery,
  partitionAspectKeywords,
} from './rankerFallbackScorer.js';

export { computeDeterministicFallbackScore } from './rankerFallbackScorer.js';

async function isClaimedByRival(sentVec, ownSim, rivalQueries, embedder) {
  for (const rival of rivalQueries) {
    const rivalVec = await embedder.embedQuery(`ranker:::${rival}`, rival);
    if (cosineSimilarity(rivalVec, sentVec) > ownSim) return true;
  }
  return false;
}

// Competitive gate: EmbeddingGemma ranks well but its absolute cosine is not calibrated across
// criteria, so a sentence only counts for the criterion it is semantically closest to.
async function computeNeuralScore(queryText, sentenceText, { embedder, rivalQueries = [], policy }) {
  if (!embedder) return 0;
  try {
    const queryVec = await embedder.embedQuery(`ranker:::${queryText}`, queryText);
    const sentVec = await embedder.embedText(sentenceText);
    const sim = Math.max(0, Math.min(1, cosineSimilarity(queryVec, sentVec)));
    if (await isClaimedByRival(sentVec, sim, rivalQueries, embedder)) return 0;
    return policy.calibrateNeuralScore(sim);
  } catch (err) {
    console.warn('[MicroRanker] Embedding fallback triggered:', err?.message || err);
    return 0;
  }
}

/**
 * @param {{ label: string, keywords?: string[] }|string} aspect
 * @param {string} sentenceText
 * @param {{ embedder?: object|null, rivalQueries?: string[], policy?: object }} options
 */
export async function scoreSentencePair(aspect, sentenceText, { embedder = null, rivalQueries = [], policy = defaultA1RankerPolicy } = {}) {
  const label = String((typeof aspect === 'string' ? aspect : aspect?.label) || '').trim();
  const keywords = typeof aspect === 'string' ? [] : (aspect?.keywords || []);
  const sText = String(sentenceText || '').trim();
  if (!sText || !label) return 0;

  const fallbackScore = computeDeterministicFallbackScore(label, sText, keywords);
  const queryText = formatCriterionQuery(label, keywords);
  const neuralScore = await computeNeuralScore(queryText, sText, { embedder, rivalQueries, policy });
  return Math.max(fallbackScore, neuralScore);
}

async function classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries }) {
  let bestScore = 0;
  let bestSentence = '';

  for (const s of sentences) {
    const score = await scoreSentencePair(aspect, s, { embedder, rivalQueries, policy });
    if (score > bestScore) {
      bestScore = score;
      bestSentence = s;
    }
  }

  const coverage = policy.classifyScore(bestScore);
  return { coverage, score: bestScore, matchedSentence: bestSentence };
}

function normalizeCandidateSentences(candidateSentences) {
  const sentences = Array.isArray(candidateSentences) ? candidateSentences : [String(candidateSentences || '')];
  if (sentences.length === 1 && /[.?!]/.test(sentences[0])) {
    const split = splitGermanSentences(sentences[0]);
    if (split.length > 1) return split;
  }
  return sentences.filter((s) => String(s || '').trim());
}

/**
 * @param {string|{ label?: string, id?: string, keywords?: string[], aspects?: Array }} criterion
 * @param {string|string[]} candidateSentences
 * @param {{ embedder?: object|null, policy?: object, rivalCriteria?: object[] }} options
 *   rivalCriteria: the task's other Leitpunkte, used by the competitive gate.
 */
export async function classifyCriterionCoverage(criterion, candidateSentences, options = {}) {
  const policy = options.policy || defaultA1RankerPolicy;
  const embedder = options.embedder || null;
  const critObj = typeof criterion === 'string' ? { label: criterion } : (criterion || {});
  const critLabel = critObj.label || critObj.id || '';
  const sentences = normalizeCandidateSentences(candidateSentences);
  const rivalQueries = (options.rivalCriteria || []).map((c) => formatCriterionQuery(c.label || c.id, c.keywords));

  const aspectLabels = isCompoundCriterion(critLabel) ? splitCompoundCriterion(critLabel) : [critLabel];
  const keywordsByAspect = await partitionAspectKeywords(critObj, aspectLabels, embedder);

  if (aspectLabels.length === 1) {
    const aspect = { label: critLabel, keywords: keywordsByAspect[critLabel] };
    return classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries });
  }

  const aspectResults = [];
  for (const label of aspectLabels) {
    const aspect = { label, keywords: keywordsByAspect[label] };
    const res = await classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries });
    aspectResults.push({ aspect: label, ...res });
  }
  return policy.aggregateCompound(aspectResults);
}
