/**
 * Deterministic Ranker Fallback Scorer & Query Builder.
 * Offline System 1 scoring (concept lexicon + rubric keyword stems), criterion query
 * formatting for EmbeddingGemma, and keyword-to-aspect partitioning for compound criteria.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { stemGermanWord } from '../linguistic/germanStemmer.js';
import { scoreAspectConceptOverlap, scoreStructuredAspectEvidence, getDomainStemsForToken } from './conceptDomainScorer.js';
import { requireLevelPort } from './levelPorts.js';
import { findMatchedKeywords } from '../linguistic/keywordStemMatcher.js';
import { cosineSimilarity } from './vectorMath.js';

const STOP_WORDS = new Set([
  'der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'eine', 'einen', 'einem', 'und', 'oder',
  'sie', 'ich', 'wir', 'ihr', 'ihre', 'ihren', 'ihnen', 'mir', 'mich', 'uns', 'für', 'mit', 'von',
  'zum', 'zur', 'bei', 'auf', 'aus', 'wie', 'was', 'wann', 'warum',
]);
const MAX_QUERY_KEYWORDS = 8;

function toStems(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[.,!?;:]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => stemGermanWord(w));
}

function scoreKeywordCoverage(keywords = [], sentence = '', lexicon) {
  const stemOf = (k) => stemGermanWord(String(k).toLowerCase());
  const kwStems = [...new Set(keywords.map(stemOf))];
  if (kwStems.length === 0) return 0;
  const matched = new Set(findMatchedKeywords(keywords, sentence.split(/\s+/), lexicon).map(stemOf)).size;
  if (matched === 0) return 0;
  return Math.min(1, 0.4 + 0.5 * (matched / kwStems.length) + 0.1 * (matched - 1));
}

function scoreLabelTokenOverlap(criterionText = '', sentStems = []) {
  const critTokens = String(criterionText).toLowerCase().replace(/[.,!?;:]+/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .map((w) => stemGermanWord(w));
  if (critTokens.length === 0) return 0.5;
  const matches = critTokens.filter((token) => sentStems.includes(token));
  return Math.min(1, Math.max(0, (matches.length / critTokens.length) * 1.5));
}

function normalizeAspect(aspect) {
  const { label = '', keywords = [], evidence = null } = typeof aspect === 'string' ? { label: aspect } : (aspect || {});
  return { label: String(label), keywords: keywords || [], evidence };
}

/**
 * Deterministic evidence split by trust level: `lexical` (keyword/concept/label overlap) only hints
 * at a topic, `structured` (a recognised calendar expression or person count) proves the aspect is stated.
 * @param {string|{ label: string, keywords?: string[], evidence?: 'temporal'|'personCount'|'occupation'|null }} aspect
 * @param {string} sentenceText
 * @param {{ policy: object }} context - the level policy: its concept domains, and the bound for lexical
 *   hints on an unproven evidence kind
 * @returns {{ lexical: number, structured: number }}
 */
export function computeFallbackEvidence(aspect, sentenceText = '', { policy } = {}) {
  requireLevelPort(policy, 'computeFallbackEvidence: policy');
  const { label, keywords, evidence } = normalizeAspect(aspect);
  const normSent = String(sentenceText).toLowerCase();
  if (!normSent.trim()) return { lexical: 0, structured: 0 };

  const sentStems = toStems(normSent);
  const keywordScore = scoreKeywordCoverage(keywords, normSent, policy.lexicon);
  const conceptScore = scoreAspectConceptOverlap({ label: label.toLowerCase(), evidence }, { sentenceStems: sentStems, rawSentence: normSent, domains: policy.conceptDomains });
  const labelScore = conceptScore > 0 ? conceptScore : scoreLabelTokenOverlap(label, sentStems);
  const lexical = Math.max(keywordScore, labelScore);
  const structured = scoreStructuredAspectEvidence(evidence, normSent);
  const boundedLexical = structured === 0 ? policy.capUnprovenLexical(evidence, lexical) : lexical;
  return { lexical: boundedLexical, structured };
}

export function computeDeterministicFallbackScore(aspect, sentenceText = '', context = {}) {
  const { lexical, structured } = computeFallbackEvidence(aspect, sentenceText, context);
  return Math.max(lexical, structured);
}

export function formatCriterionQuery(label = '', keywords = []) {
  const cleanLabel = String(label || '').trim();
  const kw = (keywords || []).map((k) => String(k).trim()).filter(Boolean).slice(0, MAX_QUERY_KEYWORDS);
  return kw.length > 0 ? `${cleanLabel}: ${kw.join(', ')}` : cleanLabel;
}

function findExplicitAspectKeywords(criterion, aspectLabel) {
  const aspects = Array.isArray(criterion?.aspects) ? criterion.aspects : [];
  const match = aspects.find((a) => String(a?.label || '').toLowerCase() === aspectLabel.toLowerCase());
  return Array.isArray(match?.keywords) ? match.keywords : null;
}

function assignKeywordByLexicon(keyword, aspectLabels, domains) {
  const kwStem = stemGermanWord(String(keyword).toLowerCase());
  return aspectLabels.find((label) =>
    toStems(label).some((token) => getDomainStemsForToken(token, domains).includes(kwStem))
  ) || null;
}

async function assignKeywordByEmbedding(keyword, aspectLabels, embedder) {
  const kwVec = await embedder.embedQuery(`kw:::${keyword}`, keyword);
  let best = null;
  let bestSim = -1;
  for (const label of aspectLabels) {
    const aspectVec = await embedder.embedQuery(`aspect:::${label}`, label);
    const sim = cosineSimilarity(kwVec, aspectVec);
    if (sim > bestSim) {
      bestSim = sim;
      best = label;
    }
  }
  return best;
}

/** @param {{ policy: object }} context - the level policy (concept domains) */
export function partitionAspectKeywordsSync(criterion, aspectLabels = [], { policy } = {}) {
  const domains = requireLevelPort(policy, 'partitionAspectKeywordsSync: policy').conceptDomains;
  const keywords = Array.isArray(criterion?.keywords) ? criterion.keywords : [];
  const result = Object.fromEntries(aspectLabels.map((label) => [label, []]));
  if (aspectLabels.length === 1) {
    result[aspectLabels[0]] = findExplicitAspectKeywords(criterion, aspectLabels[0]) || keywords;
    return result;
  }

  const explicitCount = aspectLabels.filter((label) => findExplicitAspectKeywords(criterion, label)).length;
  if (explicitCount > 0) {
    aspectLabels.forEach((label) => { result[label] = findExplicitAspectKeywords(criterion, label) || []; });
    return result;
  }

  for (const keyword of keywords) {
    const target = assignKeywordByLexicon(keyword, aspectLabels, domains);
    if (target) result[target].push(keyword);
  }
  return result;
}

/**
 * Distributes rubric keywords across compound sub-aspects.
 * Priority: explicit rubric `aspects[]` -> concept lexicon domain -> embedding proximity.
 * @param {object} criterion
 * @param {string[]} aspectLabels
 * @param {{ embedder?: object|null, policy: object }} context - optional embedder and the level policy
 * @returns {Promise<Record<string, string[]>>}
 */
export async function partitionAspectKeywords(criterion, aspectLabels = [], { embedder = null, policy } = {}) {
  const syncResult = partitionAspectKeywordsSync(criterion, aspectLabels, { policy });
  if (!embedder || aspectLabels.length <= 1) return syncResult;

  const keywords = Array.isArray(criterion?.keywords) ? criterion.keywords : [];
  const assigned = new Set(Object.values(syncResult).flat());
  const unassigned = keywords.filter((k) => !assigned.has(k));

  for (const keyword of unassigned) {
    const target = await assignKeywordByEmbedding(keyword, aspectLabels, embedder);
    if (target) syncResult[target].push(keyword);
  }
  return syncResult;
}
