/**
 * Semantic topic matcher for German A1 Leitpunkte.
 * Matches user sentences to exam Leitpunkte using German stem clusters.
 */
import { stemGermanWord } from '../linguistic/germanStemmer.js';
import { isAddresseeDirected } from '../linguistic/sentenceMood.js';
import { resolveCriterionIntent, isAddresseeRequestIntent } from '../linguistic/criterionIntents.js';

function extractStems(str = '') {
  return (str || '')
    .toLowerCase()
    .split(/\s+/)
    .map(w => stemGermanWord(w))
    .filter(s => s && s.length >= 2);
}

function computeCriterionScore(sentenceStems = [], crit = {}, isQuestion = false) {
  const rawKeywords = crit.keywords || [];
  let score = 0;
  let matchesCount = 0;

  for (const kw of rawKeywords) {
    const kwStems = extractStems(kw);
    if (kwStems.length === 1) {
      if (sentenceStems.includes(kwStems[0])) {
        score += 2;
        matchesCount += 1;
      }
    } else if (kwStems.length > 1) {
      const allPresent = kwStems.every(st => sentenceStems.includes(st));
      if (allPresent) {
        score += 2;
        matchesCount += 1;
      }
    }
  }

  const labelStems = extractStems(crit.label || '');
  for (const sStem of sentenceStems) {
    if (labelStems.includes(sStem)) {
      score += 1;
    }
  }

  if (isQuestion && isAddresseeRequestIntent(resolveCriterionIntent(crit))) {
    score += 1;
  }

  return { score, matchesCount };
}

/**
 * @param {string} sentence
 * @param {object[]} criteria - rubric Leitpunkte
 * @param {{ lexicon: object }} context - the level's lexicon port
 */
export function matchSentenceToCriteria(sentence = '', criteria = [], { lexicon } = {}) {
  if (!sentence || !Array.isArray(criteria) || criteria.length === 0) {
    return { bestIdx: -1, score: 0 };
  }

  const clean = sentence.trim();
  const isQuestion = isAddresseeDirected(clean, { lexicon });
  const sentenceStems = extractStems(clean);

  const scoredList = criteria.map((crit, idx) => {
    const evalRes = computeCriterionScore(sentenceStems, crit, isQuestion);
    return { idx, ...evalRes };
  });

  const maxScore = Math.max(0, ...scoredList.map(s => s.score));
  if (maxScore === 0) {
    return { bestIdx: -1, score: 0 };
  }

  const topCandidates = scoredList.filter(s => s.score === maxScore);
  topCandidates.sort((a, b) => b.matchesCount - a.matchesCount || a.idx - b.idx);

  return { bestIdx: topCandidates[0].idx, score: maxScore };
}

