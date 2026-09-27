/**
 * Stem of a word through its lemma in the lexicon port: "kostet" → kosten → "kost", "Kurse" → Kurs.
 * Two forms of one word get one stem even where the stemming algorithm alone cannot fold them.
 * A word the lexicon does not know, or reads as lemmas with different stems, keeps the plain stem of its
 * own form.
 */

import { cleanGermanWord, stemGermanWord } from './germanStemmer.js';

function lemmaStems(word, lexicon) {
  const lemmas = (lexicon.lookup(word) || []).map((e) => e.lemma).filter(Boolean);
  return new Set(lemmas.map((lemma) => stemGermanWord(lemma)));
}

/**
 * @param {string} rawWord
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 * @returns {string}
 */
export function stemByLemma(rawWord, lexicon) {
  if (!lexicon) throw new TypeError('stemByLemma needs a lexicon port');
  const word = cleanGermanWord(rawWord);
  if (!word) return '';
  const stems = lemmaStems(word, lexicon);
  return stems.size === 1 ? [...stems][0] : stemGermanWord(word);
}
