/**
 * Finds the opening and closing formulas of a letter by word sequence (data/letterFormulas.json),
 * tolerant of inflection endings and umlaut spellings ("Mit freundliche Grusse" is still a closing).
 */
import formulas from '../data/letterFormulas.json' with { type: 'json' };
import { foldUmlauts } from './umlautSpelling.js';

const INFLECTION_ENDINGS = ['', 'e', 'en', 'em', 'er', 'es', 'n'];
const POLITE_FORMS = new Set(formulas.politeAddressForms);

const cleanWord = (raw = '') => raw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');

/** @returns {Array<{ raw: string, word: string, start: number }>} words with their offsets in the text */
export function splitLetterWords(text = '') {
  return [...String(text).matchAll(/\S+/g)]
    .map((m) => ({ raw: m[0], word: cleanWord(m[0]), start: m.index }))
    .filter((w) => w.word);
}

function matchesPattern(word, pattern) {
  const inflects = pattern.endsWith('*');
  const stem = foldUmlauts(inflects ? pattern.slice(0, -1) : pattern);
  const folded = foldUmlauts(word);
  if (!inflects) return folded === stem;
  return folded.startsWith(stem) && INFLECTION_ENDINGS.includes(folded.slice(stem.length));
}

// A one-word closing ("Grüße", "Tschüss") is a formula only when it opens a sentence; inside one it is
// content: "Ich sende Grüße an Ihre Familie".
function opensSentence(words, index) {
  return index === 0 || /[.!?]$/.test(words[index - 1].raw);
}

function matchAt(words, index, formula) {
  if (formula.words.length === 1 && !opensSentence(words, index)) return false;
  return formula.words.every((pattern, k) => words[index + k] && matchesPattern(words[index + k].word, pattern));
}

function toMatch(words, index, formula) {
  const end = index + formula.words.length;
  return { ...formula, words: words.slice(index, end), following: words.slice(end) };
}

/** @returns {object|null} the salutation formula the line opens with, with its matched words */
export function matchSalutation(line = '') {
  const words = splitLetterWords(line);
  const formula = formulas.salutations.find((f) => matchAt(words, 0, f));
  return formula ? toMatch(words, 0, formula) : null;
}

/** @returns {object|null} the first closing formula inside the line, with its matched words */
export function matchClosing(line = '') {
  const words = splitLetterWords(line);
  for (let i = 0; i < words.length; i += 1) {
    const formula = formulas.closings.find((f) => matchAt(words, i, f));
    if (formula) return toMatch(words, i, formula);
  }
  return null;
}

/** @returns {number} offset of the last closing formula that does not open the text, or -1 */
export function findLastClosingOffset(text = '') {
  const words = splitLetterWords(text);
  let offset = -1;
  for (let i = 1; i < words.length; i += 1) {
    const formula = formulas.closings.find((f) => matchAt(words, i, f));
    if (formula) {
      offset = words[i].start;
      i += formula.words.length - 1;
    }
  }
  return offset;
}

export function isPoliteAddressForm(word = '') {
  return POLITE_FORMS.has(word.toLowerCase());
}
