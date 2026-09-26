/**
 * Umlaut and eszett spelling variants: "Grüße" may be written "Gruesse" or "Grüsse", but "Grusse" drops the umlaut.
 */
import spelling from '../data/umlautSpelling.json' with { type: 'json' };

function replaceLetters(word, table) {
  return [...word].map((ch) => table[ch] ?? ch).join('');
}

/** Lower-case form with umlaut marks removed, also from their transliterations: grüße, gruesse, grusse → grusse. */
export function foldUmlauts(word = '') {
  const lower = word.toLowerCase();
  const untransliterated = Object.entries(spelling.transliteration)
    .filter(([letter]) => letter !== 'ß')
    .reduce((w, [, digraph]) => w.replaceAll(digraph, digraph[0]), lower);
  return replaceLetters(untransliterated, spelling.base);
}

export function hasUmlaut(word = '') {
  return [...word.toLowerCase()].some((ch) => ch in spelling.base);
}

/** @returns {boolean} true when the variant spells the word correctly (itself, ue/oe/ae/ss, or Swiss ss) */
export function isAcceptedSpelling(variant = '', word = '') {
  const lower = variant.toLowerCase();
  return [word, replaceLetters(word, spelling.transliteration), replaceLetters(word, spelling.swissEszett)].includes(lower);
}
