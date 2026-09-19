import { analyzeSalutation } from './salutationAnalyzer.js';
import { analyzeClosing } from './closingAnalyzer.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { matchSentenceToCriteria } from './analyzers/semanticTopicMatcher.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';

function assignSentencesToCriteria(sentences = [], criteria = []) {
  const assignments = criteria.map(() => []);
  if (sentences.length === 0 || criteria.length === 0) return assignments;

  const rawMatches = sentences.map(s => matchSentenceToCriteria(s, criteria));
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

export function segmentUserEssay(rawText = '', criteria = []) {
  const text = (rawText || '').trim();
  if (!text) {
    return { anrede: '', closing: '', senderName: '', leitpunkte: [] };
  }

  const salutation = analyzeSalutation(text);
  const closing = analyzeClosing(text);
  const macro = segmentMacroStructure(text);

  let body = macro.bodyText || text;
  if (!macro.bodyText) {
    if (salutation.recognized && salutation.text) {
      body = body.replace(salutation.text, '').trim();
    }
    if (closing.recognized && closing.text) {
      body = body.replace(closing.text, '').trim();
    }
    if (closing.senderName) {
      body = body.replace(closing.senderName, '').trim();
    }
  }

  const sentences = splitGermanSentences(body);
  const assignments = assignSentencesToCriteria(sentences, criteria);

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

  return {
    anrede: salutation.recognized ? salutation.text : '',
    closing: closing.recognized ? closing.text : '',
    senderName: closing.senderName || '',
    leitpunkte: leitpunkteMatches
  };
}
