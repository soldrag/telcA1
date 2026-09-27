/**
 * German word stem: the Snowball German algorithm (@orama/stemmers) on a word cleaned of punctuation.
 * General German, no task or level vocabulary. Snowball folds inflection endings of nouns and adjectives
 * ("Termine"/"Termin", "freundlichen"/"freundlich") but not every verb ending ("kostet" stays "kostet"):
 * inflected forms known to a lexicon are folded through their lemma, see lemmaStem.js.
 */

import { stemmer } from '@orama/stemmers/german';

export function cleanGermanWord(rawWord = '') {
  return String(rawWord || '').trim().toLowerCase().replace(/[.,!?;:()«»"„“]/g, '');
}

export function stemGermanWord(rawWord = '') {
  const word = cleanGermanWord(rawWord);
  return word ? stemmer(word) : '';
}
