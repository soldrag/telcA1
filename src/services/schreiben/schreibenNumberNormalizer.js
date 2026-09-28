/**
 * Compares the numbers of two form answers: an amount with the words it counts ("2 Kinder und 1 Erwachsener"),
 * or a digit sequence such as a phone number or a postcode ("0176 123 45 67").
 */
import { splitNumberWords, numberOf } from './schreibenNumberTokens.js';
import { stemGermanWord } from './linguistic/germanStemmer.js';
import functionWords from './linguistic/data/functionWords.json' with { type: 'json' };

const FILLERS = new Set(functionWords.quantityFillers);
// Groups of digits, or one long number: a phone number or a postcode, not an amount.
const DIGIT_SEQUENCE = /^\d+(?:[\s\-/]+\d+)+$|^\d{5,}$/;

// A counted word compares by its stem, so its grammatical form does not matter: "4 Person" = "4 Personen".
const toTokens = (str) => splitNumberWords(str)
  .filter((word) => !FILLERS.has(word))
  .map((word) => ({ word: stemGermanWord(word), number: numberOf(word) }));

function bindForward(tokens) {
  const binding = { leadWords: [], segments: [] };
  for (const { word, number } of tokens) {
    if (number) binding.segments.push({ number, words: [] });
    else (binding.segments.at(-1)?.words ?? binding.leadWords).push(word);
  }
  return binding;
}

// null when words follow the last number: then they belong after their numbers.
function bindBackward(tokens) {
  const binding = { leadWords: [], segments: [] };
  let pending = [];
  for (const { word, number } of tokens) {
    if (!number) pending.push(word);
    else { binding.segments.push({ number, words: pending }); pending = []; }
  }
  return pending.length ? null : binding;
}

// Each number with its words: after it ("2 Kinder und 1 Erwachsener") or, with no word after the last number,
// before it ("Erwachsene: 2, Kind: 1").
function bindNumberWords(tokens) {
  if (!tokens.some((t) => t.number)) return [];
  return [bindForward(tokens), bindBackward(tokens)].filter(Boolean);
}

const includesAll = (words, others) => words.every((word) => others.includes(word));

const wordsAgree = (a, b) => includesAll(a, b) || includesAll(b, a);

const segmentsAgree = (a, b) => a.number === b.number && wordsAgree(a.words, b.words);

// Numbers with words pair in any order ("ein Erwachsener und zwei Kinder" = "2 Kinder und 1 Erwachsener");
// bare numbers keep their order.
function matchSegments(segments, others) {
  if (!segments.length) return !others.length;
  const [first, ...rest] = segments;
  if (!first.words.length) return Boolean(others[0]) && segmentsAgree(first, others[0]) && matchSegments(rest, others.slice(1));
  return others.some((other, i) => segmentsAgree(first, other) && matchSegments(rest, others.filter((_, j) => j !== i)));
}

const bindingsAgree = (a, b) => wordsAgree(a.leadWords, b.leadWords) && matchSegments(a.segments, b.segments);

// Whichever number a word is bound to, no word may be lost: "Post 14" ≠ "Poststraße 14".
const wordsOf = (tokens) => tokens.filter((t) => !t.number).map((t) => t.word);

// Every number must agree, and so must the words it counts: "ein Jahr" = "1 Jahr" and "drei Personen" = "3",
// but "ein Monat" ≠ "1 Jahr", "zwei Kinder" ≠ "2 Kinder und 1 Erwachsener", "3 Erwachsene und 2 Kinder" ≠ "2 Erwachsene und 3 Kinder".
export function areNumbersEquivalent(first = '', second = '') {
  const a = toTokens(first);
  const b = toTokens(second);
  if (!wordsAgree(wordsOf(a), wordsOf(b))) return false;
  const bBindings = bindNumberWords(b);
  return bindNumberWords(a).some((binding) => bBindings.some((other) => bindingsAgree(binding, other)));
}

/** @returns {boolean} the text is only groups of digits, as a phone number ("0176 1234567") */
export function writesDigitSequence(str = '') {
  return DIGIT_SEQUENCE.test(String(str).trim());
}

const digitsOf = (str) => String(str).replace(/\D/g, '');

/** @returns {boolean} both write the same digits in the same order, however grouped ("0176 123 45 67") */
export function areDigitSequencesEqual(first = '', second = '') {
  const digits = digitsOf(first);
  return Boolean(digits) && digits === digitsOf(second);
}
