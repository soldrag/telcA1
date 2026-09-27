/**
 * Kölner Phonetik: a phonetic key for German words. Words that sound alike share a key
 * ("vonung" and "Wohnung" → 3664), which is how learners misspell by ear.
 */

const VOWELS = new Set(['a', 'e', 'i', 'j', 'o', 'u', 'y', 'ä', 'ö', 'ü']);
const SIMPLE_CODES = {
  b: '1', f: '3', v: '3', w: '3', g: '4', k: '4', q: '4', l: '5', m: '6', n: '6', r: '7', s: '8', z: '8', ß: '8',
};
const C_HARD_INITIAL = new Set(['a', 'h', 'k', 'l', 'o', 'q', 'r', 'u', 'x']);
const C_HARD = new Set(['a', 'h', 'k', 'o', 'q', 'u', 'x']);
const SIBILANTS = new Set(['c', 's', 'z']);

function codeOfC(prev, next, isInitial) {
  if (isInitial) return C_HARD_INITIAL.has(next) ? '4' : '8';
  return C_HARD.has(next) && !['s', 'z'].includes(prev) ? '4' : '8';
}

function codeOfLetter(letters, i) {
  const [prev, ch, next] = [letters[i - 1], letters[i], letters[i + 1]];
  if (VOWELS.has(ch)) return '0';
  if (ch === 'h') return '';
  if (ch === 'p') return next === 'h' ? '3' : '1';
  if (ch === 'd' || ch === 't') return SIBILANTS.has(next) ? '8' : '2';
  if (ch === 'c') return codeOfC(prev, next, i === 0);
  if (ch === 'x') return ['c', 'k', 'q'].includes(prev) ? '8' : '48';
  return SIMPLE_CODES[ch] || '';
}

/** @returns {string} the phonetic key; empty for a word without letters */
export function germanPhoneticKey(word = '') {
  const letters = [...String(word).toLowerCase()].filter((ch) => /\p{L}/u.test(ch));
  const raw = letters.map((_, i) => codeOfLetter(letters, i)).join('');
  const collapsed = [...raw].filter((digit, i) => digit !== raw[i - 1]).join('');
  return collapsed.slice(0, 1) + collapsed.slice(1).replace(/0/g, '');
}
