/**
 * Finds the opening and closing formulas of a letter by word sequence (data/letterFormulas.json),
 * tolerant of inflection endings and umlaut spellings ("Mit freundliche Grusse" is still a closing), and of a
 * learner's misspelling of a formula word ("Sehr geerte", "Mit freundlichen Gruse", "Grus"): the regulation keeps
 * the score for a slip in an appropriate formula (reglament §6 Teil 2). The vocabulary is closed, so a misspelt
 * formula word cannot be mistaken for content the way a misspelt keyword can.
 */
import formulas from '../data/letterFormulas.json' with { type: 'json' };
import { foldUmlauts } from './umlautSpelling.js';
import { toGermanSoundKey } from '../germanSoundKey.js';
import { calculateDamerauDistance } from '../editDistance.js';

const INFLECTION_ENDINGS = ['', 'e', 'en', 'em', 'er', 'es', 'n'];
const POLITE_FORMS = new Set(formulas.politeAddressForms);

const cleanWord = (raw = '') => raw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');

/** @returns {Array<{ raw: string, word: string, start: number }>} words with their offsets in the text */
export function splitLetterWords(text = '') {
  return [...String(text).matchAll(/\S+/g)]
    .map((m) => ({ raw: m[0], word: cleanWord(m[0]), start: m.index }))
    .filter((w) => w.word);
}

// A misspelling is read only for formula words of this length: shorter ones ("mit", "bis") have near neighbours.
const MIN_FUZZY_LENGTH = 4;

const formsOf = (pattern) => {
  const inflects = pattern.endsWith('*');
  const stem = foldUmlauts(inflects ? pattern.slice(0, -1) : pattern);
  return inflects ? INFLECTION_ENDINGS.map((ending) => stem + ending) : [stem];
};

/** @returns {'exact'|'misspelt'|null} how the word matches the formula's pattern word */
function matchesPattern(word, pattern) {
  const folded = foldUmlauts(word);
  const forms = formsOf(pattern);
  if (forms.includes(folded)) return 'exact';
  if (forms[0].length < MIN_FUZZY_LENGTH || folded.length < MIN_FUZZY_LENGTH) return null;
  const sound = toGermanSoundKey(folded);
  return forms.some((form) => toGermanSoundKey(form) === sound || calculateDamerauDistance(folded, form) <= 1) ? 'misspelt' : null;
}

// A one-word closing ("Grüße", "Tschüss") is a formula only when it opens a sentence; inside one it is
// content: "Ich sende Grüße an Ihre Familie".
function opensSentence(words, index) {
  return index === 0 || /[.!?]$/.test(words[index - 1].raw);
}

// A formula of several words needs at least half of them spelt right ("Sehr" carries "Sehr geerte").
function matchAt(words, index, formula) {
  if (formula.words.length === 1 && !opensSentence(words, index)) return null;
  const kinds = formula.words.map((pattern, k) => (words[index + k] ? matchesPattern(words[index + k].word, pattern) : null));
  if (kinds.some((kind) => !kind)) return null;
  const exact = kinds.filter((kind) => kind === 'exact').length;
  if (formula.words.length > 1 && exact * 2 < formula.words.length) return null;
  return { misspelt: exact < formula.words.length };
}

function toMatch(words, index, formula, { misspelt }) {
  const end = index + formula.words.length;
  return { ...formula, words: words.slice(index, end), following: words.slice(end), misspelt };
}

/** @returns {object|null} the salutation formula the line opens with, with its matched words */
export function matchSalutation(line = '') {
  const words = splitLetterWords(line);
  for (const formula of formulas.salutations) {
    const match = matchAt(words, 0, formula);
    if (match) return toMatch(words, 0, formula, match);
  }
  return null;
}

/** @returns {object|null} the first closing formula inside the line, with its matched words */
export function matchClosing(line = '') {
  const words = splitLetterWords(line);
  for (let i = 0; i < words.length; i += 1) {
    for (const formula of formulas.closings) {
      const match = matchAt(words, i, formula);
      if (match) return toMatch(words, i, formula, match);
    }
  }
  return null;
}

// A misspelt closing ends the body only when at most a name follows it, so it cannot cut the letter short.
const MAX_WORDS_AFTER_MISSPELT_CLOSING = 3;

/** @returns {number} offset of the last closing formula that does not open the text, or -1 */
export function findLastClosingOffset(text = '') {
  const words = splitLetterWords(text);
  let offset = -1;
  for (let i = 1; i < words.length; i += 1) {
    for (const formula of formulas.closings) {
      const match = matchAt(words, i, formula);
      const end = i + formula.words.length;
      if (!match || (match.misspelt && words.length - end > MAX_WORDS_AFTER_MISSPELT_CLOSING)) continue;
      offset = words[i].start;
      i = end - 1;
      break;
    }
  }
  return offset;
}

export function isPoliteAddressForm(word = '') {
  return POLITE_FORMS.has(word.toLowerCase());
}
