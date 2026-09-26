/**
 * Mass nouns (lexicon `isUncountable`) are not counted: "zu viel Arbeit", not "zu viele Arbeiten".
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };
import { analyzeAdjective } from '../morphology/adjectiveMorphology.js';

const MASS_QUANTIFIERS = new Set(paradigms.massQuantifierStems);
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

function findMassNoun(pluralForm, lexicon) {
  const [word] = lexicon.findForms((e) => e.isUncountable && e.plural?.toLowerCase() === pluralForm);
  return word ? lexicon.lookup(word).find((e) => e.isUncountable) : null;
}

function checkAt(tokens, i, lexicon) {
  const quantifier = analyzeAdjective(tokens[i].lower, lexicon);
  if (!quantifier?.ending || !MASS_QUANTIFIERS.has(quantifier.stem) || !tokens[i + 1]) return null;
  const massNoun = findMassNoun(tokens[i + 1].lower, lexicon);
  if (!massNoun) return null;
  const intensifier = tokens[i - 1]?.lower === 'zu' ? `${clean(tokens[i - 1].raw)} ` : '';
  const original = `${intensifier}${clean(tokens[i].raw)} ${clean(tokens[i + 1].raw)}`;
  const correction = `${intensifier}${quantifier.stem} ${massNoun.lemma}`;
  return {
    category: 'rektion',
    code: 'ERR_UNCOUNTABLE_MASS_NOUN',
    original,
    correction,
    explanation: `Nicht zählbares Nomen: „${massNoun.lemma}“ steht ohne Plural: „${correction}“ (nicht „${original}“).`,
  };
}

export const countabilityRule = {
  id: 'countability',
  check(analysis, context) {
    return analysis.tokens.map((_, i) => checkAt(analysis.tokens, i, context.lexicon)).filter(Boolean);
  },
};
