/**
 * Lightweight German stemmer for CEFR A1 text evaluation.
 * Strips inflectional suffixes while preserving core roots.
 */

export function stemGermanWord(rawWord = '') {
  const word = rawWord.trim().toLowerCase().replace(/[.,!?;:()«»"„“]/g, '');
  if (word.length <= 3) return word;

  // Domain-specific root normalizations for telc A1
  if (word.startsWith('kost')) return 'kost';
  if (word.startsWith('anmeld')) return 'anmeld';
  if (word.startsWith('termin')) return 'termin';
  if (word.startsWith('sprachschul')) return 'sprachschul';
  if (word.startsWith('deutschkur')) return 'deutschkur';
  if (word.startsWith('absag')) return 'absag';
  if (word.startsWith('überstund') || word.startsWith('ueberstund')) return 'überstund';
  if (word.startsWith('verschieb')) return 'verschieb';
  if (word.startsWith('vormittag')) return 'vormittag';
  if (word.startsWith('nachmittag')) return 'nachmittag';
  if (word.startsWith('dienstag')) return 'dienstag';
  if (word.startsWith('mittwoch')) return 'mittwoch';
  if (word.startsWith('montag')) return 'montag';
  if (word.startsWith('woche')) return 'woche';
  if (word.startsWith('arbeit')) return 'arbeit';
  if (word.startsWith('krank')) return 'krank';
  if (word.startsWith('fieber')) return 'fieber';
  if (word.startsWith('preis') || word.startsWith('gebühr') || word.startsWith('gebuehr')) return 'gebühr';

  const SUFFIX_PATTERNS = [
    /ungen$/i, /ung$/i, /heiten$/i, /keit$/i,
    /liche[nrsm]?$/i, /ende[nrsm]?$/i, /teste[nrsm]?$/i,
    /este[nrsm]?$/i, /te[nrsm]?$/i, /en$/i, /er$/i,
    /es$/i, /em$/i, /e$/i, /st$/i, /s$/i, /t$/i,
  ];

  let stemmed = word;
  for (const pattern of SUFFIX_PATTERNS) {
    if (pattern.test(stemmed)) {
      const candidate = stemmed.replace(pattern, '');
      if (candidate.length >= 3) {
        stemmed = candidate;
        break;
      }
    }
  }

  return stemmed;
}

export function extractStemSet(text = '') {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const stemSet = new Set();

  for (const w of words) {
    const s = stemGermanWord(w);
    if (s && s.length >= 3) {
      stemSet.add(s);
    }
  }
  return stemSet;
}
