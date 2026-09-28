/**
 * Facts about a Schreiben Teil 1 form answer compared with one expected answer. Whether the answer counts is
 * decided by the regulation of the task level (ISchreibenRegulation.acceptsTeil1Answer), not here.
 */
import { areDatesEquivalent, writesDate } from './schreibenDateNormalizer.js';
import { areNumbersEquivalent, areDigitSequencesEqual, writesDigitSequence } from './schreibenNumberNormalizer.js';
import { areTimesEquivalent, writesTime } from './schreibenTimeNormalizer.js';
import { writesNumber } from './schreibenNumberTokens.js';
import abbreviationData from './linguistic/data/abbreviations.json' with { type: 'json' };
import { toGermanSoundKey } from './linguistic/germanSoundKey.js';
import spelling from './linguistic/data/umlautSpelling.json' with { type: 'json' };
import calendarWords from './linguistic/data/calendarWords.json' with { type: 'json' };
import wordClasses from './linguistic/data/clauseWordClasses.json' with { type: 'json' };

/**
 * @typedef {Object} FormAnswerFacts
 * @property {boolean} sameText - equal after case and punctuation are normalised, or an umlaut transliteration (ue for ü)
 * @property {boolean} sameNumberOrDate - both write the same number or date (drei = 3, 18. Juli = 18.07)
 * @property {boolean} numberAnswer - the answer or the expected answer writes a number or a date; a word beside a number keeps its tolerance
 * @property {boolean} rivalWords - the expected word is in a closed class (months, weekdays) and the answer is, or sounds like, or is
 *   nearer to another member of it (Juni, "Sontag" for Juli, Montag): a typo there names another answer
 * @property {boolean} abbreviation - the answer is a usual abbreviation of the expected word ("Poststr.", "Mo."; linguistic/data/abbreviations.json)
 * @property {boolean} singleWord - both sides are one word; a typo or sound tolerance is meant for a word, not a phrase
 * @property {number} shorterLength - characters in the shorter of the two normalised texts
 * @property {number} editDistance - Damerau-Levenshtein distance (optimal string alignment), the smaller of the plain and the umlaut-folded one
 * @property {boolean} sameSound - one German pronunciation (Donnerstag, donastag); see linguistic/germanSoundKey.js
 */

export function normalizeGermanText(str = '') {
  return str
    .trim()
    .toLowerCase()
    .replace(/(\d)[.,/:-](?=\d)/g, '$1 ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»""'']/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeUmlauts(str = '') {
  return [...str].map((ch) => spelling.transliteration[ch] ?? ch).join('');
}

function calculateDamerauDistance(a = '', b = '') {
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

// Closed classes whose members are each a valid answer: word → its meaning within the class.
const CLOSED_CLASSES = [
  calendarWords.months,
  Object.fromEntries(wordClasses.weekdays.map((day, index) => [day, index])),
];

function isNearerToAnotherMember(word, expected, members) {
  const toExpected = calculateDamerauDistance(word, expected);
  const soundKey = toGermanSoundKey(word);
  return Object.keys(members).some((member) => members[member] !== members[expected]
    && (toGermanSoundKey(member) === soundKey || calculateDamerauDistance(word, member) < toExpected));
}

function areRivalWords(answer, expected) {
  return CLOSED_CLASSES.some((members) => Object.hasOwn(members, expected) && (Object.hasOwn(members, answer)
    ? members[answer] !== members[expected]
    : isNearerToAnotherMember(answer, expected, members)));
}

const monthNamesOf = (number) => Object.keys(calendarWords.months).filter((name) => calendarWords.months[name] === number);

// Word abbreviations and month abbreviations ("Jul." for Juli): short form → the words it stands for.
const ABBREVIATIONS = {
  ...abbreviationData.abbreviations,
  ...Object.fromEntries(Object.entries(calendarWords.monthAbbreviations).map(([short, number]) => [short, monthNamesOf(number)])),
};

// "Poststr." for Poststraße, "Mo." for Montag: a usual abbreviation, a compound keeping its first part.
function isAbbreviationOf(rawAnswer, expected) {
  const written = rawAnswer.trim().toLowerCase().replace(/[,;:]+$/, '');
  if (!/^\p{L}+\.$/u.test(written)) return false;
  const word = written.slice(0, -1);
  return Object.entries(ABBREVIATIONS).some(([short, fullForms]) => word.endsWith(short)
    && fullForms.some((full) => word.slice(0, -short.length) + full === expected));
}

// The expected answer decides how its numbers are read: a date, a time, a digit sequence, or an amount.
function isSameNumberOrDate(answer, expected) {
  if (writesDate(expected)) return areDatesEquivalent(answer, expected);
  if (writesTime(expected)) return areTimesEquivalent(answer, expected);
  if (writesDigitSequence(expected)) return areDigitSequencesEqual(answer, expected);
  return areNumbersEquivalent(answer, expected);
}

/**
 * @param {string} answer - the answer, or one word of it
 * @param {string} expected - the expected answer, or the word of it compared with the answer
 * @returns {FormAnswerFacts}
 */
export function compareFormAnswer(answer = '', expected = '') {
  const normAnswer = normalizeGermanText(answer);
  const normExpected = normalizeGermanText(expected);
  const foldedAnswer = normalizeUmlauts(normAnswer);
  const foldedExpected = normalizeUmlauts(normExpected);
  return {
    sameText: normAnswer === normExpected || foldedAnswer === foldedExpected,
    sameNumberOrDate: isSameNumberOrDate(answer, expected),
    numberAnswer: writesNumber(normAnswer) || writesNumber(normExpected),
    rivalWords: areRivalWords(normAnswer, normExpected),
    abbreviation: isAbbreviationOf(answer, foldedExpected) || isAbbreviationOf(answer, normExpected),
    singleWord: !normAnswer.includes(' ') && !normExpected.includes(' '),
    shorterLength: Math.min(normAnswer.length, normExpected.length),
    editDistance: Math.min(calculateDamerauDistance(normAnswer, normExpected), calculateDamerauDistance(foldedAnswer, foldedExpected)),
    sameSound: toGermanSoundKey(normAnswer) === toGermanSoundKey(normExpected),
  };
}
