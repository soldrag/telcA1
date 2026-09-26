/**
 * Noun phrase case and agreement: the case a phrase expresses must be one its governor (preposition or verb)
 * requires, and determiner, adjectives and noun must agree. Corrections are generated from the paradigms.
 */
import { resolveRequiredCases } from '../analysis/caseGovernor.js';
import { realizedFeatures, inflectPhrase, inflectPronoun } from '../analysis/nounPhraseFeatures.js';

const CASE_NAMES = { NOM: 'Nominativ', AKK: 'Akkusativ', DAT: 'Dativ', GEN: 'Genitiv' };
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

function phraseText(tokens, phrase) {
  return tokens.slice(phrase.start, phrase.end + 1).map((t) => clean(t.raw)).join(' ');
}

function withGovernor(phrase, words) {
  return phrase.governor ? `${clean(phrase.governor.token.raw)} ${words}` : words;
}

function buildError({ phrase, required, original, correction }) {
  const governorWord = required.kind === 'preposition' ? phrase.governor.token.raw : required.governor.lemma;
  const target = CASE_NAMES[required.cases[0]];
  const subject = required.kind === 'preposition' ? `Die Präposition „${clean(governorWord)}“` : `Das Verb „${governorWord}“`;
  return {
    category: 'rektion',
    code: `ERR_${required.kind === 'preposition' ? 'PREP_CASE' : 'VERB_VALENCY'}_${required.cases[0]}`,
    original,
    correction,
    explanation: `${subject} verlangt den ${target}: „${correction}“ (nicht „${original}“).`,
  };
}

function checkPronoun(tokens, phrase, required, lexicon) {
  if (phrase.pronoun.pos !== 'PRON_OBJ' || phrase.pronoun.case?.some((c) => required.cases.includes(c))) return null;
  const form = inflectPronoun(phrase.pronoun, required.cases[0], lexicon);
  if (!form) return null;
  const verb = tokens.slice(0, phrase.start).map((t) => clean(t.raw)).slice(-2).join(' ');
  return buildError({ phrase, required, original: `${verb} ${clean(phrase.pronoun.raw)}`, correction: `${verb} ${form}` });
}

function checkNounPhrase(tokens, phrase, required) {
  if (phrase.determiner?.implicit) return null;
  const features = realizedFeatures(phrase);
  if (features.some((f) => required.cases.includes(f.case))) return null;
  const words = inflectPhrase(phrase, required.cases[0]);
  const original = withGovernor(phrase, phraseText(tokens, phrase));
  if (!words || withGovernor(phrase, words) === original) return null;
  return buildError({ phrase, required, original, correction: withGovernor(phrase, words) });
}

function checkPhrase(analysis, phrase, context) {
  if (phrase.isCalendar || (phrase.quantifier && phrase.head?.analysis.slot !== 'pl')) return null;
  const required = resolveRequiredCases(phrase, { ...analysis, ...context });
  if (!required) return null;
  return phrase.pronoun
    ? checkPronoun(analysis.tokens, phrase, required, context.lexicon)
    : checkNounPhrase(analysis.tokens, phrase, required);
}

export const nounPhraseCaseRule = {
  id: 'nounPhraseCase',
  check(analysis, context) {
    return analysis.phrases.map((phrase) => checkPhrase(analysis, phrase, context)).filter(Boolean);
  },
};
