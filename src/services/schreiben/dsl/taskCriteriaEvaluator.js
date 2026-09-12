/**
 * Task Criteria Evaluator: Matches student body sentences to Inhaltspunkte.
 * Incorporates Negation/Polarity Guards to prevent false-positive content passes.
 * Strictly complies with McConnell limits (<= 180 lines, <= 25 lines per function).
 */

import { tagTokens } from '../linguistic/a1LexiconService.js';

function checkClusterPolarity(tokens = [], cluster = {}) {
  const words = tokens.map(t => t.lower);
  const lemmas = tokens.map(t => (t.lemma || t.raw).toLowerCase());

  const hasLemma = cluster.lemmas.some(l => {
    const target = l.toLowerCase();
    return words.some(w => w === target || w.startsWith(target)) ||
           lemmas.some(lem => lem === target || lem.startsWith(target));
  });

  if (!hasLemma) return false;

  const hasNegation = tokens.some(t => t.pos === 'PART_NEG' || t.lower === 'nicht' || t.lower.startsWith('kein'));

  if (cluster.polarity === 'NEGATIVE') {
    const inherentNegative = lemmas.some(l => l === 'absagen' || l === 'stornieren' || l === 'verspätung');
    return hasNegation || inherentNegative;
  }

  if (cluster.polarity === 'AFFIRMATIVE') {
    return !hasNegation;
  }

  return true;
}

function evaluateSentenceForPoint(sentence = '', point = {}) {
  const clean = sentence.trim().replace(/[.,!?;:]+$/, '');
  const tokens = tagTokens(clean.split(/\s+/));
  const clusters = point.conceptClusters || [];

  if (clusters.length === 0) {
    // Fallback: check keywords if legacy format
    const kws = point.keywords || [];
    const lower = clean.toLowerCase();
    const matches = kws.filter(k => lower.includes(k.toLowerCase()));
    return matches.length >= (point.requiredMatches || 1);
  }

  if (point.matchType === 'ONE_OF') {
    return clusters.some(c => checkClusterPolarity(tokens, c));
  }

  // ALL_OF or CONCEPT_MATRIX: each cluster must have at least one match
  return clusters.every(c => checkClusterPolarity(tokens, c));
}

export function evaluateInhaltspunkte(bodySentences = [], criteria = []) {
  const items = criteria.map((crit, idx) => {
    const pointId = crit.id || `lp${idx + 1}`;
    const matched = [];

    for (const sentence of bodySentences) {
      if (evaluateSentenceForPoint(sentence, crit)) {
        matched.push(sentence);
      }
    }

    const score = matched.length > 0 ? (crit.rubricScore || 2) : 0;
    return {
      index: idx + 1,
      id: pointId,
      label: crit.label || `Punkt ${idx + 1}`,
      score,
      matchedSentences: matched,
      userSentence: matched.length > 0 ? matched.join(' ') : 'Kein Satz im Text gefunden'
    };
  });

  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  return { items, totalScore };
}
