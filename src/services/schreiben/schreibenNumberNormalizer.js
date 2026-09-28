import numberWords from './linguistic/data/numberWords.json' with { type: 'json' };

const CARDINALS = numberWords.cardinals;
const ARTICLE_FORMS = new Set(numberWords.articleForms);

const cardinalOf = (word) => (Object.hasOwn(CARDINALS, word) ? String(CARDINALS[word]) : null);

const isDigits = (word) => /^\d+$/.test(word);

const splitWords = (str = '') => str.trim().toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);

// "zwei Kinder und ein Erwachsener" → { numbers: ['2', '1'], otherWords: ['kinder', 'und', 'erwachsener'] }.
function splitNumberPhrase(str = '') {
  const numbers = [];
  const otherWords = [];
  for (const word of splitWords(str)) {
    const number = isDigits(word) ? word : cardinalOf(word);
    if (number) numbers.push(number);
    else otherWords.push(word);
  }
  return numbers.length ? { numbers, otherWords } : null;
}

const includesAll = (words, others) => words.every((word) => others.includes(word));

export function normalizeGermanNumber(str = '') {
  return splitNumberPhrase(str)?.numbers[0] ?? null;
}

/** @returns {boolean} the text writes a number: a digit or a number word that is not also the article ("eine") */
export function writesNumber(str = '') {
  return splitWords(str).some((word) => /\d/.test(word) || (cardinalOf(word) && !ARTICLE_FORMS.has(word)));
}

// Every number must agree, and so must the words beside them: "ein Jahr" = "1 Jahr" and "drei Personen" = "3",
// but "ein Monat" ≠ "1 Jahr" and "zwei Kinder" ≠ "2 Kinder und 1 Erwachsener".
export function areNumbersEquivalent(first = '', second = '') {
  const a = splitNumberPhrase(first);
  const b = splitNumberPhrase(second);
  if (!a || !b || a.numbers.join() !== b.numbers.join()) return false;
  return includesAll(a.otherWords, b.otherWords) || includesAll(b.otherWords, a.otherWords);
}
