/**
 * Semantic topic matcher for German A1 Leitpunkte.
 * Matches user sentences to exam Leitpunkte using German stem clusters.
 */
import { stemGermanWord } from '../linguistic/germanStemmer.js';

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

  const isProposalOrInquiry = labelStems.some(s => ['vorschlag', 'terminvorschlag', 'frag', 'bitt', 'kost', 'anmeld'].includes(s));
  if (isQuestion && isProposalOrInquiry) {
    score += 1;
  }

  return { score, matchesCount, totalKeywords: Math.max(1, rawKeywords.length) };
}

export function matchSentenceToCriteria(sentence = '', criteria = []) {
  if (!sentence || !Array.isArray(criteria) || criteria.length === 0) {
    return { bestIdx: -1, score: 0 };
  }

  const clean = sentence.trim();
  const isQuestion = clean.endsWith('?') || /^(haben sie|können wir|kann ich|geht es|passt es|wie viel|wann|wo|was)\b/i.test(clean);
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
  topCandidates.sort((a, b) => (b.matchesCount / b.totalKeywords) - (a.matchesCount / a.totalKeywords) || a.idx - b.idx);

  return { bestIdx: topCandidates[0].idx, score: maxScore };
}

