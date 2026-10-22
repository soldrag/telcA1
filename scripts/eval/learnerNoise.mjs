/**
 * Deterministic learner-error variants of a German sentence, without a language model: the misspellings A1
 * candidates make (umlauts dropped, nouns in lower case, doubled or single consonants, ß as s, a dropped article,
 * a lost final -e/-en). Used to widen the example bank and the calibration set towards error-heavy letters, so
 * a model-written bank does not only know model-clean German.
 */

const ARTICLES = new Set(['der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen', 'einem', 'einer']);

function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Small seeded generator: the same sentence and seed always give the same variant.
function createRandom(seed) {
  let state = seed >>> 0 || 1;
  for (let i = 0; i < 4; i++) state = (state * 1664525 + 1013904223) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const EDITS = [
  (word) => word.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/Ä/g, 'A').replace(/Ö/g, 'O').replace(/Ü/g, 'U'),
  (word) => (/^[A-ZÄÖÜ][a-zäöüß]/.test(word) ? word[0].toLowerCase() + word.slice(1) : word),
  (word) => word.replace(/([bdfglmnprt])\1/, '$1'),
  (word) => word.replace(/([aeiou])([lmnt])([aeiou])/, '$1$2$2$3'),
  (word) => word.replace(/ß/g, 's'),
  (word) => (word.length > 4 ? word.replace(/en$/, 'e').replace(/e$/, '') : word),
];

/**
 * @param {string} sentence
 * @param {{ seed?: number, rate?: number }} [options] - rate: share of words that get one edit
 * @returns {string}
 */
export function learnerVariant(sentence, { seed = 1, rate = 0.35 } = {}) {
  const random = createRandom(hash(sentence) ^ Math.imul(seed, 2654435761));
  const words = String(sentence).split(' ');
  const out = [];
  for (const token of words) {
    const bare = token.replace(/[.,!?;:]+$/, '');
    const tail = token.slice(bare.length);
    if (ARTICLES.has(bare.toLowerCase()) && random() < rate / 2) continue;
    if (bare.length > 2 && random() < rate) {
      const start = Math.floor(random() * EDITS.length);
      const edited = EDITS.map((_, i) => EDITS[(start + i) % EDITS.length](bare)).find((w) => w !== bare) ?? bare;
      out.push(edited + tail);
    } else {
      out.push(token);
    }
  }
  return out.join(' ');
}
