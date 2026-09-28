import numberWords from './linguistic/data/numberWords.json' with { type: 'json' };

const CARDINALS = numberWords.cardinals;

const cardinalOf = (word) => (Object.hasOwn(CARDINALS, word) ? String(CARDINALS[word]) : null);

export function normalizeGermanNumber(str = '') {
  const clean = str.trim().toLowerCase().replace(/[.,!?;:]/g, '');
  if (!clean) return null;

  if (/^\d+$/.test(clean)) {
    return clean;
  }

  if (cardinalOf(clean)) {
    return cardinalOf(clean);
  }

  const words = clean.split(/\s+/);
  for (const word of words) {
    if (/^\d+$/.test(word)) return word;
    if (cardinalOf(word)) return cardinalOf(word);
  }

  return null;
}

export function areNumbersEquivalent(first = '', second = '') {
  const normFirst = normalizeGermanNumber(first);
  const normSecond = normalizeGermanNumber(second);
  if (!normFirst || !normSecond) return false;
  return normFirst === normSecond;
}
