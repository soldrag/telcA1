/**
 * German nouns are capitalised. A lower-case body word is flagged only when every lexicon reading is a noun,
 * so "morgen" (adverb) or "essen" (verb) stay untouched. All findings are bundled into one hint.
 */
import { splitLetterWords } from '../letter/letterFormulaMatcher.js';
import { matchCapitalization } from './letterWording.js';

function isOnlyNoun(word, lexicon) {
  const entries = lexicon.lookup(word);
  return entries.length > 0 && entries.every((e) => e.pos === 'NOUN');
}

function collectLowercaseNouns(sentences, lexicon) {
  const nouns = new Map();
  for (const { word } of sentences.flatMap((s) => splitLetterWords(s))) {
    if (/^\p{Ll}/u.test(word) && !nouns.has(word) && isOnlyNoun(word, lexicon)) nouns.set(word, matchCapitalization(word, 'X'));
  }
  return nouns;
}

export const nounCapitalizationRule = {
  id: 'nounCapitalization',
  check(letter, { lexicon }) {
    const nouns = collectLowercaseNouns(letter.bodySentences || [], lexicon);
    if (nouns.size === 0) return [];
    const corrected = [...nouns.values()];
    return [{
      category: 'orthography',
      code: 'ERR_NOUN_CAPITALIZATION',
      original: [...nouns.keys()].join(', '),
      correction: corrected.join(', '),
      explanation: `Groß-/Kleinschreibung: Nomen im Deutschen werden großgeschrieben: ${corrected.map((n) => `„${n}“`).join(', ')}.`,
    }];
  },
};
