/**
 * Deterministic Ranker Fallback Scorer & Query Builder.
 * Offline System 1 scoring (concept lexicon + rubric keyword stems), criterion query
 * formatting for EmbeddingGemma, and keyword-to-aspect partitioning for compound criteria.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { stemByLemma } from '../linguistic/lemmaStem.js';
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

function splitLabelWords(text) {
  return String(text || '').toLowerCase().replace(/[.,!?;:]+/g, ' ').split(/\s+/).filter(Boolean);
}

function toStems(text, lexicon) {
  return splitLabelWords(text).map((w) => stemByLemma(w, lexicon));
}

function scoreKeywordCoverage(keywords = [], sentence = '', lexicon) {
  const stemOf = (k) => stemByLemma(k, lexicon);
  const kwStems = [...new Set(keywords.map(stemOf))];
  if (kwStems.length === 0) return 0;
  const matched = new Set(findMatchedKeywords(keywords, sentence.split(/\s+/), lexicon).map(stemOf)).size;
  if (matched === 0) return 0;
  return Math.min(1, 0.4 + 0.5 * (matched / kwStems.length) + 0.1 * (matched - 1));
}

// The nouns of a label carry its topic ("Neuer Terminvorschlag" is about the Terminvorschlag, not about
// anything "neu"). A word is a noun when the lexicon reads it so, or when the lexicon does not know it
// and the label capitalises it. A label without nouns is read by all its content words.
function isLabelNoun(word, lexicon) {
  const entries = lexicon.lookup(word) || [];
  if (entries.length > 0) return entries.some((e) => e.pos === 'NOUN');
  return /^[A-ZÄÖÜ]/.test(word);
}

function scoreLabelTokenOverlap(criterionText = '', sentStems = [], lexicon) {
  const contentWords = String(criterionText).replace(/[.,!?;:]+/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));
  if (contentWords.length === 0) return 0.5;
  const nouns = contentWords.filter((w) => isLabelNoun(w, lexicon));
  const topicStems = (nouns.length > 0 ? nouns : contentWords).map((w) => stemByLemma(w, lexicon));
  return topicStems.filter((stem) => sentStems.includes(stem)).length / topicStems.length;
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

  const sentStems = toStems(normSent, policy.lexicon);
  const keywordScore = scoreKeywordCoverage(keywords, normSent, policy.lexicon);
  const conceptScore = scoreAspectConceptOverlap({ label: label.toLowerCase(), evidence }, { sentenceStems: sentStems, rawSentence: normSent, domains: policy.conceptDomains, lexicon: policy.lexicon });
  const labelScore = conceptScore > 0 ? conceptScore : scoreLabelTokenOverlap(label, sentStems, policy.lexicon);
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

function assignKeywordByLexicon(keyword, aspectLabels, { conceptDomains, lexicon }) {
  const kwStem = stemByLemma(keyword, lexicon);
  return aspectLabels.find((label) =>
    splitLabelWords(label).some((token) => getDomainStemsForToken(token, conceptDomains, lexicon).includes(kwStem))
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
  requireLevelPort(policy, 'partitionAspectKeywordsSync: policy');
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
    const target = assignKeywordByLexicon(keyword, aspectLabels, policy);
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
