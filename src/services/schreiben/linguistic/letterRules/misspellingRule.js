/**
 * Misspelt words: a word of the letter body that neither the A1 lexicon nor the dictionaries know and that sounds like
 * exactly one A1 word ("krang" → "krank", "komen" → "kommen", "wonung" → "Wohnung", "fier" → "vier"), or is one
 * without its hyphen ("email" → "E-Mail"). Each finding is its own error, so the accuracy scale counts every
 * misspelling. Guards against reading a correct word as a mistake:
 * - the same sound only, not one edit: the lexicon lacks many adjectives and adverbs, and one edit turned correct words
 *   into others ("kalt" → "alt", "mehr" → "sehr", "hoch" → "noch"); a misspelling keeps the sound;
 * - a capitalised word inside a sentence is skipped: a name ("Rahim", "Berk") cannot be told from a misspelt noun;
 * - words of 4+ letters without digits only; umlaut spellings ("fur" → "für") are the umlaut rule's.
 */
import { splitLetterWords } from '../letter/letterFormulaMatcher.js';
import { foldUmlauts, hasUmlaut } from '../letter/umlautSpelling.js';
import { toGermanSoundKey } from '../germanSoundKey.js';
import { matchCapitalization } from './letterWording.js';

const MIN_LENGTH = 4;
// The sound key marks vowel length with ":" ("fi:ba" for Fieber); a learner who writes "fiber" still means it.
const soundOf = (word) => toGermanSoundKey(word).replaceAll(':', '');
const plain = (word) => word.toLowerCase().replaceAll('-', '');

function buildIndex(lexicon) {
  const forms = [...new Set(lexicon.findForms(() => true))].filter((form) => form.length >= MIN_LENGTH - 1);
  const byPlain = new Map(forms.map((form) => [plain(form), form]));
  const bySound = new Map();
  for (const form of forms) {
    const key = soundOf(form);
    bySound.set(key, [...(bySound.get(key) || []), form]);
  }
  return { forms, byPlain, bySound };
}

// The one A1 word the misspelling sounds like, or null when there is none or more than one.
function correctionOf(word, index) {
  const lower = word.toLowerCase();
  const hyphenless = index.byPlain.get(plain(word));
  if (hyphenless) return hyphenless;
  const bySound = [...new Set((index.bySound.get(soundOf(lower)) || []).map((form) => form.toLowerCase()))];
  return bySound.length === 1 ? index.bySound.get(soundOf(lower)).find((form) => form.toLowerCase() === bySound[0]) : null;
}

function isCandidate(word, position, lexicon, umlautForms) {
  if (word.length < MIN_LENGTH || /\d/.test(word) || !/^\p{L}[\p{L}-]*$/u.test(word)) return false;
  if (position > 0 && /^\p{Lu}/u.test(word)) return false;
  if (lexicon.lookup(word).length > 0) return false;
  return !umlautForms().has(foldUmlauts(word.toLowerCase()));
}

export const misspellingRule = {
  id: 'misspelling',
  check(letter, { lexicon }) {
    let index = null;
    let umlauts = null;
    const lazyIndex = () => (index ??= buildIndex(lexicon));
    const umlautForms = () => (umlauts ??= new Set(lazyIndex().forms.filter(hasUmlaut).map((form) => foldUmlauts(form.toLowerCase()))));
    const errors = [];
    for (const sentence of letter.bodySentences || []) {
      splitLetterWords(sentence).forEach(({ word }, position) => {
        if (!isCandidate(word, position, lexicon, umlautForms)) return;
        const known = correctionOf(word, lazyIndex());
        if (!known) return;
        // A noun keeps its capital whatever the learner wrote ("fiber" → "Fieber").
        const isNoun = lexicon.lookup(known).some((entry) => entry.pos === 'NOUN');
        const correction = isNoun ? known[0].toUpperCase() + known.slice(1) : matchCapitalization(known, word);
        errors.push({
          category: 'orthography',
          code: 'ERR_MISSPELLING',
          original: word,
          correction,
          explanation: `Rechtschreibung: „${correction}“.`,
        });
      });
    }
    return errors;
  },
};
