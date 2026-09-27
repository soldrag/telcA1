import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { matchSentenceToCriteria } from './analyzers/semanticTopicMatcher.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
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

function extractLetterBody(text) {
  const { bodyText, anrede, closing } = segmentMacroStructure(text);
  if (bodyText) return bodyText;
  const frame = [anrede.recognized && anrede.text, closing.recognized && closing.text, closing.recognized && closing.senderName];
  return frame.filter(Boolean).reduce((body, part) => body.replace(part, '').trim(), text);
}

/**
 * Assigns the body sentences to the Leitpunkte; Anrede and Gruß are stage 0's.
 * @param {{ lexicon: object, policy: object }} levelContext - the level's lexicon port and ranker policy
 */
export function segmentUserEssay(rawText = '', criteria = [], { lexicon, policy } = {}) {
  requireLevelPort(lexicon, 'segmentUserEssay: lexicon');
  const text = (rawText || '').trim();
  if (!text) return { leitpunkte: [] };

  const sentences = splitGermanSentences(extractLetterBody(text));
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
