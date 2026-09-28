/**
 * Case/gender/number a noun phrase actually expresses (intersection of determiner, adjective and noun
 * morphology) and the phrase re-inflected for a required case.
 */
import { adjectiveSlots, generateAdjective } from '../morphology/adjectiveMorphology.js';
import { adjectiveDeclensionAfter, generateDeterminer } from '../morphology/determinerMorphology.js';
import { generateNoun } from '../morphology/nounMorphology.js';

function adjectivesAgree(phrase, declension, key) {
  return phrase.adjectives.every(({ analysis }) => adjectiveSlots(analysis.ending, declension).has(key));
}

function readingFeatures(phrase, noun) {
  const { slot, cases } = noun;
  if (phrase.quantifier && slot !== 'pl') return [];
  const readings = phrase.determiner ? phrase.determiner.readings : [null];
  return readings
    .filter((r) => !r || r.slot === slot)
    .flatMap((r) => (r ? [r.case] : cases).map((c) => ({ case: c, slot, reading: r, noun })))
    .filter((f) => cases.includes(f.case))
    .filter((f) => adjectivesAgree(phrase, f.reading ? adjectiveDeclensionAfter(f.reading.family) : 'strong', `${f.case}:${f.slot}`));
}

/**
 * @returns {Array<{ case: string, slot: string, reading: object|null, noun: object }>} over every reading of the
 *   head noun ("den Kollegen": AKK m or DAT pl); empty when the parts disagree
 */
export function realizedFeatures(phrase) {
  return phrase.head.analysis.readings.flatMap((noun) => readingFeatures(phrase, noun));
}

/** The head noun readings the determiner, numeral and adjectives agree with; all of them when none does. */
export function agreeingNounReadings(phrase) {
  const nouns = phrase.head.analysis.readings;
  const agreeing = nouns.filter((noun) => readingFeatures(phrase, noun).length > 0);
  return agreeing.length ? agreeing : nouns;
}

function inflectDeterminer(phrase, grammaticalCase, slot) {
  if (!phrase.determiner) return null;
  const form = generateDeterminer(phrase.determiner.readings[0], grammaticalCase, slot);
  return form && /^[A-ZÄÖÜ]/.test(phrase.determiner.token.raw) ? form[0].toUpperCase() + form.slice(1) : form;
}

/** @returns {string|null} the phrase words (without preposition) inflected for the case, null if not generable */
export function inflectPhrase(phrase, grammaticalCase) {
  const { slot } = phrase.head.analysis;
  const declension = phrase.determiner ? adjectiveDeclensionAfter(phrase.determiner.readings[0].family) : 'strong';
  const determiner = inflectDeterminer(phrase, grammaticalCase, slot);
  if (phrase.determiner && !determiner) return null;
  const words = [
    phrase.determiner?.implicit ? null : determiner,
    phrase.quantifier ? phrase.quantifier.raw : null,
    ...phrase.adjectives.map(({ analysis }) => generateAdjective(analysis.stem, declension, grammaticalCase, slot)),
    generateNoun(phrase.head.token.raw.replace(/[.,;:!?]+$/, ''), phrase.head.analysis, grammaticalCase),
  ];
  return words.every((w) => w !== undefined) ? words.filter(Boolean).join(' ') : null;
}

/**
 * @param {object} pronoun - tagged pronoun token
 * @param {string} grammaticalCase
 * @param {{ findForms: Function }} lexicon - level vocabulary port
 */
export function inflectPronoun(pronoun, grammaticalCase, lexicon) {
  const person = pronoun.person?.[0];
  const [form] = lexicon.findForms((e) => e.pos === 'PRON_OBJ' && e.lemma === pronoun.lemma && e.person?.[0] === person
    && (!pronoun.number || !e.number || e.number === pronoun.number) && e.case?.length === 1 && e.case[0] === grammaticalCase);
  return form || null;
}
