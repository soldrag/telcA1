import { matchSentenceToCriteria } from './analyzers/semanticTopicMatcher.js';
import { requireLevelPort } from './grading/levelPorts.js';

function assignSentencesToCriteria(sentences = [], { criteria = [], lexicon, policy }) {
  const assignments = criteria.map(() => []);
  if (sentences.length === 0 || criteria.length === 0) return assignments;

  const rawMatches = sentences.map(s => matchSentenceToCriteria(s, criteria, { lexicon, policy }));
  const hasAnyMatch = rawMatches.some(m => m.bestIdx !== -1 && m.score > 0);

  if (!hasAnyMatch) {
    return assignments;
  }

  let currentIdx = -1;

  for (let i = 0; i < sentences.length; i++) {
    const match = rawMatches[i];
    if (match.bestIdx !== -1 && match.score > 0) {
      currentIdx = match.bestIdx;
    }
    if (currentIdx >= 0 && currentIdx < criteria.length) {
      assignments[currentIdx].push(sentences[i]);
    }
  }
  return assignments;
}

/**
 * Assigns the body sentences to the Leitpunkte; the body is stage 0's (`bodySentences`), the same sentences the ranker scores.
 * @param {string[]} sentences - stage 0 body sentences
 * @param {{ lexicon: object, policy: object }} levelContext - the level's lexicon port and ranker policy
 */
export function segmentUserEssay(sentences = [], criteria = [], { lexicon, policy } = {}) {
  requireLevelPort(lexicon, 'segmentUserEssay: lexicon');
  if (sentences.length === 0) return { leitpunkte: [] };

  const assignments = assignSentencesToCriteria(sentences, { criteria, lexicon, policy });

  const leitpunkteMatches = criteria.map((crit, idx) => {
    const matchedSentences = assignments[idx] || [];
    return {
      index: idx + 1,
      id: crit.id || `lp${idx + 1}`,
      label: crit.label || `Punkt ${idx + 1}`,
      sentences: matchedSentences,
      userSentence: matchedSentences.length > 0 ? matchedSentences.join(' ') : 'Kein Satz im Text gefunden'
    };
  });

  return { leitpunkte: leitpunkteMatches };
}
