export function normalizeGermanText(str = '') {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»""'']/g, '')
    .replace(/\s+/g, ' ');
}

export function normalizeUmlauts(str = '') {
  return str
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

export function calculateLevenshtein(a = '', b = '') {
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

export function isFuzzyWordMatch(wordA = '', wordB = '', maxDistance = 1) {
  const normA = normalizeGermanText(wordA);
  const normB = normalizeGermanText(wordB);

  if (normA === normB) return true;
  if (normalizeUmlauts(normA) === normalizeUmlauts(normB)) return true;

  const minLen = Math.min(normA.length, normB.length);
  if (minLen < 4) return false;

  const allowedDist = minLen >= 8 ? Math.max(maxDistance, 2) : maxDistance;
  const dist = calculateLevenshtein(normA, normB);
  if (dist <= allowedDist) return true;

  return calculateLevenshtein(normalizeUmlauts(normA), normalizeUmlauts(normB)) <= allowedDist;
}
