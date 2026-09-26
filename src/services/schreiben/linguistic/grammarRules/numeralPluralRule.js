/**
 * A cardinal above one needs the plural noun ("vier Personen"); under a dative preposition the plural
 * also takes the dative ending ("mit zwei Kindern").
 */
import { resolveRequiredCases } from '../analysis/caseGovernor.js';
import { generateNoun } from '../morphology/nounMorphology.js';

const SINGULAR_CARDINALS = new Set(['1', 'ein', 'eins', 'eine']);
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

function pluralNoun(phrase, required) {
  const plural = phrase.head.analysis.entry.plural;
  const pluralAnalysis = { slot: 'pl', entry: { number: 'pl' } };
  return required?.cases.length === 1 ? generateNoun(plural, pluralAnalysis, required.cases[0]) : plural;
}

function checkPhrase(analysis, phrase, context) {
  if (!phrase.quantifier || SINGULAR_CARDINALS.has(phrase.quantifier.lower)) return null;
  if (phrase.head?.analysis.slot === 'pl' || !phrase.head?.analysis.entry.plural || phrase.adjectives.length) return null;
  const required = resolveRequiredCases(phrase, { ...analysis, ...context });
  const original = analysis.tokens.slice(phrase.quantifier ? analysis.tokens.indexOf(phrase.quantifier) : phrase.start, phrase.end + 1)
    .map((t) => clean(t.raw)).join(' ');
  const correction = `${clean(phrase.quantifier.raw)} ${pluralNoun(phrase, required)}`;
  return {
    category: 'agreement',
    code: 'ERR_NUMERAL_PLURAL',
    original,
    correction,
    explanation: `Plural nach Zahlen: Nach „${clean(phrase.quantifier.raw)}“ steht der Plural: „${correction}“ (nicht „${original}“).`,
  };
}

export const numeralPluralRule = {
  id: 'numeralPlural',
  check(analysis, context) {
    return analysis.phrases.map((phrase) => checkPhrase(analysis, phrase, context)).filter(Boolean);
  },
};
