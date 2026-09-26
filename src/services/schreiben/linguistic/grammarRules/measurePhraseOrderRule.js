/**
 * A measure phrase precedes the mass noun it measures: "vier Wochen Zeit", not "Zeit vier Wochen".
 */
const MEASURE_CATEGORIES = new Set(['duration']);
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

function isBareMassNoun(phrase) {
  return phrase.head && !phrase.governor && !phrase.determiner && !phrase.quantifier && phrase.head.analysis.entry.isUncountable;
}

function isMeasurePhrase(phrase) {
  return phrase.head && !phrase.governor && phrase.quantifier && MEASURE_CATEGORIES.has(phrase.head.analysis.entry.category);
}

function checkPair(tokens, noun, measure) {
  if (!isBareMassNoun(noun) || !isMeasurePhrase(measure) || measure.start !== noun.end + 1) return null;
  const text = (p) => tokens.slice(p.start, p.end + 1).map((t) => clean(t.raw)).join(' ');
  const original = `${text(noun)} ${text(measure)}`;
  const correction = `${text(measure)} ${text(noun)}`;
  return {
    category: 'syntax',
    code: 'ERR_QUANTITY_ORDER',
    original,
    correction,
    explanation: `Wortstellung: Die Mengenangabe steht vor dem Nomen: „${correction}“ (nicht „${original}“).`,
  };
}

export const measurePhraseOrderRule = {
  id: 'measurePhraseOrder',
  check(analysis) {
    return analysis.phrases.slice(0, -1).map((p, i) => checkPair(analysis.tokens, p, analysis.phrases[i + 1])).filter(Boolean);
  },
};
