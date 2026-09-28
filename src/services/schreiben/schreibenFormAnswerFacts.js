/**
 * Facts about a Schreiben Teil 1 form answer compared with one expected answer. Whether the answer counts is
 * decided by the regulation of the task level (ISchreibenRegulation.acceptsTeil1Answer), not here.
 */
import { areDatesEquivalent } from './schreibenDateNormalizer.js';
import { areNumbersEquivalent } from './schreibenNumberNormalizer.js';
import { toGermanSoundKey } from './linguistic/germanSoundKey.js';
import spelling from './linguistic/data/umlautSpelling.json' with { type: 'json' };

/**
 * @typedef {Object} FormAnswerFacts
 * @property {boolean} sameText - equal after case and punctuation are normalised, or an umlaut transliteration (ue for ü)
 * @property {boolean} sameNumberOrDate - both write the same number or date (drei = 3, 18. Juli = 18.07)
 * @property {boolean} hasDigits - either side contains a digit (the evaluator also sets it for a word of a number or date answer)
 * @property {boolean} singleWord - both sides are one word; a typo or sound tolerance is meant for a word, not a phrase
 * @property {number} shorterLength - characters in the shorter of the two normalised texts
 * @property {number} editDistance - Damerau-Levenshtein distance, the smaller of the plain and the umlaut-folded one
 * @property {boolean} sameSound - one German pronunciation (Donnerstag, donastag); see linguistic/germanSoundKey.js
 */

export function normalizeGermanText(str = '') {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»""'']/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeUmlauts(str = '') {
  return [...str].map((ch) => spelling.transliteration[ch] ?? ch).join('');
}

function calculateLevenshtein(a = '', b = '') {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const d = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/** @returns {FormAnswerFacts} */
export function compareFormAnswer(answer = '', expected = '') {
  const normAnswer = normalizeGermanText(answer);
  const normExpected = normalizeGermanText(expected);
  const foldedAnswer = normalizeUmlauts(normAnswer);
  const foldedExpected = normalizeUmlauts(normExpected);
  return {
    sameText: normAnswer === normExpected || foldedAnswer === foldedExpected,
    sameNumberOrDate: areDatesEquivalent(answer, expected) || areNumbersEquivalent(answer, expected),
    hasDigits: /\d/.test(normAnswer) || /\d/.test(normExpected),
    singleWord: !normAnswer.includes(' ') && !normExpected.includes(' '),
    shorterLength: Math.min(normAnswer.length, normExpected.length),
    editDistance: Math.min(calculateLevenshtein(normAnswer, normExpected), calculateLevenshtein(foldedAnswer, foldedExpected)),
    sameSound: toGermanSoundKey(normAnswer) === toGermanSoundKey(normExpected),
  };
}
