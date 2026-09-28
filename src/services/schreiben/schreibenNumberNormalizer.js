import numberWords from './linguistic/data/numberWords.json' with { type: 'json' };

const CARDINALS = numberWords.cardinals;

const cardinalOf = (word) => (Object.hasOwn(CARDINALS, word) ? String(CARDINALS[word]) : null);

const isDigits = (word) => /^\d+$/.test(word);

// "drei Personen" → { number: '3', otherWords: ['personen'] }; the first number word is the number.
function splitNumberPhrase(str = '') {
  const words = str.trim().toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  const index = words.findIndex((word) => isDigits(word) || cardinalOf(word));
  if (index < 0) return null;
  const word = words[index];
  return { number: isDigits(word) ? word : cardinalOf(word), otherWords: words.filter((_, i) => i !== index) };
}

const includesAll = (words, others) => words.every((word) => others.includes(word));

export function normalizeGermanNumber(str = '') {
  return splitNumberPhrase(str)?.number ?? null;
}

// The words beside the number must agree too: "ein Jahr" = "1 Jahr" and "drei Personen" = "3",
// but "ein Monat" ≠ "1 Jahr" and "18. Juni" ≠ "18. Juli".
export function areNumbersEquivalent(first = '', second = '') {
  const a = splitNumberPhrase(first);
  const b = splitNumberPhrase(second);
  if (!a || !b || a.number !== b.number) return false;
  return includesAll(a.otherWords, b.otherWords) || includesAll(b.otherWords, a.otherWords);
}
