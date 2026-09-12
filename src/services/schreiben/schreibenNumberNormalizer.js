const GERMAN_NUMBERS = {
  null: '0',
  ein: '1',
  eine: '1',
  einen: '1',
  eins: '1',
  zwei: '2',
  drei: '3',
  vier: '4',
  fünf: '5',
  fuenf: '5',
  sechs: '6',
  sieben: '7',
  acht: '8',
  neun: '9',
  zehn: '10',
  elf: '11',
  zwölf: '12',
  zwoelf: '12',
};

export function normalizeGermanNumber(str = '') {
  const clean = str.trim().toLowerCase().replace(/[.,!?;:]/g, '');
  if (!clean) return null;

  if (/^\d+$/.test(clean)) {
    return clean;
  }

  if (GERMAN_NUMBERS[clean]) {
    return GERMAN_NUMBERS[clean];
  }

  const words = clean.split(/\s+/);
  for (const word of words) {
    if (/^\d+$/.test(word)) return word;
    if (GERMAN_NUMBERS[word]) return GERMAN_NUMBERS[word];
  }

  return null;
}

export function areNumbersEquivalent(first = '', second = '') {
  const normFirst = normalizeGermanNumber(first);
  const normSecond = normalizeGermanNumber(second);
  if (!normFirst || !normSecond) return false;
  return normFirst === normSecond;
}
