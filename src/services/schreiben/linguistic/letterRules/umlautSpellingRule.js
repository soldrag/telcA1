/**
 * Umlaut spelling: a word the lexicon does not know but that is a known word without its umlaut marks
 * ("fur" → "für", "Grusse" → "Grüße"). The ue/oe/ae/ss spellings are correct and not flagged.
 * Checks the body and the closing line; all findings are bundled into one hint.
 */
import { splitLetterWords } from '../letter/letterFormulaMatcher.js';
import { foldUmlauts, hasUmlaut, isAcceptedSpelling } from '../letter/umlautSpelling.js';
import { matchCapitalization } from './letterWording.js';

function indexByFoldedForm(lexicon) {
  const index = new Map();
  for (const form of lexicon.findForms(() => true)) {
    if (hasUmlaut(form)) index.set(foldUmlauts(form), form);
  }
  return index;
}

function correctSpelling(word, lexicon, index) {
  if (lexicon.lookup(word).length > 0) return null;
  const known = index().get(foldUmlauts(word));
  return known && !isAcceptedSpelling(word, known) ? matchCapitalization(known, word) : null;
}

function collectMisspellings(texts, lexicon) {
  let index = null;
  const lazyIndex = () => (index ??= indexByFoldedForm(lexicon));
  const found = new Map();
  for (const { word } of texts.flatMap((t) => splitLetterWords(t))) {
    const fixed = !found.has(word) && /\p{L}/u.test(word) ? correctSpelling(word, lexicon, lazyIndex) : null;
    if (fixed) found.set(word, fixed);
  }
  return found;
}

export const umlautSpellingRule = {
  id: 'umlautSpelling',
  check(letter, { lexicon }) {
    const found = collectMisspellings([...(letter.bodySentences || []), letter.closing?.text || ''], lexicon);
    if (found.size === 0) return [];
    const corrected = [...found.values()];
    return [{
      category: 'orthography',
      code: 'ERR_UMLAUT_SPELLING',
      original: [...found.keys()].join(', '),
      correction: corrected.join(', '),
      explanation: `Rechtschreibung: Im Deutschen mit Umlaut ${corrected.map((w) => `„${w}“`).join(', ')} (oder mit „ae/oe/ue/ss“ umschrieben).`,
    }];
  },
};
