/**
 * Semantic topic matcher for German A1 Leitpunkte.
 * Matches user sentences to exam Leitpunkte using German stem clusters.
 */
import { stemByLemma } from '../linguistic/lemmaStem.js';
import { isAddresseeDirected } from '../linguistic/sentenceMood.js';
import { resolveCriterionIntent, isAddresseeRequestIntent } from '../linguistic/criterionIntents.js';
import { hasAspectConceptEvidence } from '../grading/aspectConceptEvidence.js';
import { requireLevelPort } from '../grading/levelPorts.js';

const KEYWORD_WEIGHT = 2;

function extractStems(str, lexicon) {
  return String(str || '')
    .split(/\s+/)
    .map((w) => stemByLemma(w, lexicon))
    .filter(s => s && s.length >= 2);
}

function computeCriterionScore(sentenceStems = [], crit = {}, { isQuestion = false, hasConcept = false, lexicon } = {}) {
  const rawKeywords = crit.keywords || [];
  let score = 0;
  let matchesCount = 0;

  for (const kw of rawKeywords) {
    const kwStems = extractStems(kw, lexicon);
    if (kwStems.length === 1) {
      if (sentenceStems.includes(kwStems[0])) {
        score += KEYWORD_WEIGHT;
        matchesCount += 1;
      }
    } else if (kwStems.length > 1) {
      const allPresent = kwStems.every(st => sentenceStems.includes(st));
      if (allPresent) {
        score += KEYWORD_WEIGHT;
        matchesCount += 1;
      }
    }
  }

  const keywordMatches = matchesCount;
  const labelStems = extractStems(crit.label, lexicon);
  for (const sStem of sentenceStems) {
    if (labelStems.includes(sStem)) {
      score += 1;
    }
  }

  // A concept-domain hit on an aspect ("billig" → Preis) weighs like one rubric keyword.
  if (hasConcept) {
    score += KEYWORD_WEIGHT;
    matchesCount += 1;
  }

  if (isQuestion && isAddresseeRequestIntent(resolveCriterionIntent(crit))) {
    score += 1;
  }

  return { score, matchesCount, keywordMatches, totalKeywords: Math.max(1, rawKeywords.length) };
}

/**
 * @param {string} sentence
 * @param {object[]} criteria - rubric Leitpunkte
 * @param {{ lexicon: object, policy: object }} context - the level's lexicon port and ranker policy (concept domains)
 */
export function matchSentenceToCriteria(sentence = '', criteria = [], { lexicon, policy } = {}) {
  requireLevelPort(policy, 'matchSentenceToCriteria: policy');
  if (!sentence || !Array.isArray(criteria) || criteria.length === 0) {
    return { bestIdx: -1, score: 0 };
  }

  const clean = sentence.trim();
  const isQuestion = isAddresseeDirected(clean, { lexicon });
  const sentenceStems = extractStems(clean, lexicon);

  const scoredList = criteria.map((crit, idx) => {
    const hasConcept = hasAspectConceptEvidence(crit, clean, { policy });
    const evalRes = computeCriterionScore(sentenceStems, crit, { isQuestion, hasConcept, lexicon });
    return { idx, ...evalRes };
  });

  const maxScore = Math.max(0, ...scoredList.map(s => s.score));
  if (maxScore === 0) {
    return { bestIdx: -1, score: 0 };
  }

  const topCandidates = scoredList.filter(s => s.score === maxScore);
  // On a tie a rubric keyword claims the sentence before a concept domain, as in evidence gathering
  // (isClaimedByRival): the Leitpunkt that gets the sentence is the one allowed to score it.
  topCandidates.sort((a, b) => b.keywordMatches - a.keywordMatches
    || (b.matchesCount / b.totalKeywords) - (a.matchesCount / a.totalKeywords) || a.idx - b.idx);

  return { bestIdx: topCandidates[0].idx, score: maxScore };
}

