/**
 * Client-side Micro-Ranker Service (System 1 Decision Model).
 * Scores criterion coverage from cosine(EmbeddingGemma query, sentence) plus deterministic evidence,
 * combined by the policy (combineEvidence): with an embedder the neural verdict leads.
 * The embedder is an injected port (see embeddings/rankerEmbedder.js) — no model is owned here,
 * so the ranker shares the Stage 2 EmbeddingGemma instance and precomputed sentence vectors.
 * Accepts pluggable IRankerPolicy (DIP). Fully static and browser-first.
 */

import {
  splitCompoundCriterion,
  isCompoundCriterion,
} from './compoundCriterionDecomposer.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';
import { parseSentencePropositions } from '../linguistic/clauseStructureParser.js';
import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';
import { cosineSimilarity } from './vectorMath.js';
import {
  computeFallbackEvidence,
  formatCriterionQuery,
  partitionAspectKeywords,
} from './rankerFallbackScorer.js';
import { resolveAspectEvidence } from '../linguistic/criterionIntents.js';

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
// A sentence claimed by a rival criterion scores 0 here but is not a rejection of this aspect:
// `hasVerdict` is true only when the embedder actually judged the pair on its own.
async function computeNeuralScore(queryText, sentenceText, { embedder, rivalQueries = [], policy }) {
  if (!embedder) return { neural: 0, hasVerdict: false };
  try {
    const queryVec = await embedder.embedQuery(`ranker:::${queryText}`, queryText);
    const sentVec = await embedder.embedText(sentenceText);
    const sim = Math.max(0, Math.min(1, cosineSimilarity(queryVec, sentVec)));
    if (await isClaimedByRival(sentVec, sim, rivalQueries, embedder)) return { neural: 0, hasVerdict: false };
    return { neural: policy.calibrateNeuralScore(sim), hasVerdict: true };
  } catch (err) {
    console.warn('[MicroRanker] Embedding fallback triggered:', err?.message || err);
    return { neural: 0, hasVerdict: false };
  }
}

/**
 * @param {{ label: string, keywords?: string[], evidence?: string|null }|string} aspect
 * @param {string} sentenceText
 * @param {{ embedder?: object|null, rivalQueries?: string[], policy?: object }} options
 */
export async function scoreSentencePair(aspect, sentenceText, options = {}) {
  return (await evaluateSentencePair(aspect, sentenceText, options)).score;
}

async function evaluateSentencePair(aspect, sentenceText, { embedder = null, rivalQueries = [], policy = defaultA1RankerPolicy } = {}) {
  const label = String((typeof aspect === 'string' ? aspect : aspect?.label) || '').trim();
  const keywords = typeof aspect === 'string' ? [] : (aspect?.keywords || []);
  const aspectEvidence = typeof aspect === 'string' ? null : (aspect?.evidence || null);
  const sText = String(sentenceText || '').trim();
  if (!sText || !label) return { score: 0, vetoed: false };

  const { lexical, structured } = computeFallbackEvidence({ label, keywords, evidence: aspectEvidence }, sText, { policy });
  const queryText = formatCriterionQuery(label, keywords);
  const { neural, hasVerdict } = await computeNeuralScore(queryText, sText, { embedder, rivalQueries, policy });
  const evidence = { neural, lexical, structured, hasNeural: hasVerdict };
  return { score: policy.combineEvidence(evidence), vetoed: policy.isLexicalVeto(evidence) };
}

// A sentence that joins two Leitpunkt aspects ("Wie viel kostet der Kurs und wie kann ich mich anmelden?")
// dilutes a whole-sentence embedding, so each clause is also judged on its own.
function expandClauseCandidates(sentence, policy) {
  const clauses = parseSentencePropositions(sentence, { lexicon: policy.lexicon }).map((p) => p.rawText).filter(Boolean);
  return clauses.length > 1 ? [sentence, ...clauses] : [sentence];
}

async function evaluateSentenceWithClauses(aspect, sentence, options) {
  let best = { score: 0, vetoed: false };
  for (const candidate of expandClauseCandidates(sentence, options.policy || defaultA1RankerPolicy)) {
    const pair = await evaluateSentencePair(aspect, candidate, options);
    if (pair.score > best.score) best = pair;
  }
  return best;
}

async function classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries }) {
  let best = { score: 0, vetoed: false };
  let bestSentence = '';

  for (const s of sentences) {
    const pair = await evaluateSentenceWithClauses(aspect, s, { embedder, rivalQueries, policy });
    if (pair.score > best.score) {
      best = pair;
      bestSentence = s;
    }
  }

  const bestScore = best.score;
  const coverage = policy.classifyScore(bestScore);
  return { coverage, score: bestScore, matchedSentence: bestSentence, rankerVeto: best.vetoed };
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
    const aspect = { label: critLabel, keywords: keywordsByAspect[critLabel], evidence: resolveAspectEvidence(critObj, critLabel) };
    return classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries });
  }

  const aspectResults = [];
  for (const label of aspectLabels) {
    const aspect = { label, keywords: keywordsByAspect[label], evidence: resolveAspectEvidence(critObj, label) };
    const res = await classifySingleAspect(aspect, sentences, { embedder, policy, rivalQueries });
    aspectResults.push({ aspect: label, ...res });
  }
  return policy.aggregateCompound(aspectResults);
}
