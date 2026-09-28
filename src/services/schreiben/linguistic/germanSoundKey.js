/**
 * Sound key of a German word: spellings that sound alike get one key (Donnerstag, donastag → donastak).
 * Unlike Kölner Phonetik it keeps the vowels, so Dienstag and Donnerstag stay apart.
 */
import sounds from './data/germanSpellingSounds.json' with { type: 'json' };
import spelling from './data/umlautSpelling.json' with { type: 'json' };

const VOWELS = new Set(sounds.vowels);

const isVowel = (ch) => VOWELS.has(ch);

const CONTEXT_CHECKS = Object.freeze({
  wordEnd: (word, end) => end === word.length,
  beforeConsonantOrEnd: (word, end) => end === word.length || !isVowel(word[end]),
  afterVowel: (word, _end, start) => start > 0 && isVowel(word[start - 1]),
  laterSyllable: (word, _end, start) => start > 1 && !isVowel(word[start - 1])
    && [...word.slice(0, start - 1)].some(isVowel),
});

function replaceInContext(word, { from, to, context = [] }) {
  const fits = (w, end, start) => context.every((name) => CONTEXT_CHECKS[name](w, end, start));
  let result = '';
  let i = 0;
  while (i < word.length) {
    const end = i + from.length;
    if (word.startsWith(from, i) && fits(word, end, i)) {
      result += to;
      i = end;
    } else {
      result += word[i];
      i += 1;
    }
  }
  return result;
}

const collapseRepeats = (word) => [...word].filter((ch, i) => ch !== word[i - 1]).join('');

const writeOutUmlauts = (word) => [...word].map((ch) => spelling.transliteration[ch] ?? ch).join('');

/** @returns {string} the sound key of one word; empty for an empty word */
export function toGermanSoundKey(word = '') {
  const start = writeOutUmlauts(String(word).trim().toLowerCase());
  return sounds.steps.reduce(
    (key, step) => (step.collapseRepeats ? collapseRepeats(key) : replaceInContext(key, step)),
    start,
  );
}
