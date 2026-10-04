/**
 * Hyphenated compounds are right-headed: the last part gives gender and number ("2-Zimmer-Wohnung" is a "Wohnung").
 * Only a capitalised alphabetic head counts, so numbers, abbreviations and double-barrelled names stay unknown.
 */

const HEAD_PATTERN = /^[A-ZÄÖÜ][a-zäöüß]{2,}$/;

/**
 * @param {string} word
 * @param {(part: string) => object[]} lookup - looks a single word up in the dictionaries
 * @returns {object[]} noun readings of the compound's head; empty when the word is not a hyphenated compound
 */
export function resolveHyphenCompoundNouns(word, lookup) {
  const head = word.slice(word.lastIndexOf('-') + 1);
  if (head === word || !HEAD_PATTERN.test(head)) return [];
  return lookup(head).filter((entry) => String(entry.pos).startsWith('NOUN'));
}
