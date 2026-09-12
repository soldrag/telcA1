import { analyzeSalutation } from './salutationAnalyzer.js';
import { analyzeClosing } from './closingAnalyzer.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { matchSentenceToCriteria } from './analyzers/semanticTopicMatcher.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';

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
  const assignments = criteria.map(() => []);

  for (const sentence of sentences) {
    const { bestIdx, score } = matchSentenceToCriteria(sentence, criteria);
    if (bestIdx !== -1 && score > 0) {
      assignments[bestIdx].push(sentence);
    }
  }

  const leitpunkteMatches = criteria.map((crit, idx) => {
    const matchedSentences = assignments[idx] || [];
    return {
      index: idx + 1,
      id: crit.id || `lp${idx + 1}`,
      label: crit.label || `Punkt ${idx + 1}`,
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
