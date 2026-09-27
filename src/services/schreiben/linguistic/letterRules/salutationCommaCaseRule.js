/**
 * After a salutation ending in a comma the letter continues in lower case ("Hallo Anna, ich …").
 * Nouns and the polite "Sie" forms keep their capital; words the lexicon does not know (names) are left alone.
 */
import { splitLetterWords, isPoliteAddressForm } from '../letter/letterFormulaMatcher.js';

// A text that is only the salutation has no body: its first "body sentence" is the salutation itself.
function firstBodyWord(bodySentences = [], greeting = '') {
  const first = bodySentences[0]?.trim() || '';
  if (!first || (greeting && first.startsWith(greeting))) return null;
  return splitLetterWords(first)[0]?.word || null;
}

function keepsCapital(word, lexicon) {
  if (!/^\p{Lu}/u.test(word) || isPoliteAddressForm(word)) return true;
  const entries = lexicon.lookup(word);
  return entries.length === 0 || entries.some((e) => e.pos === 'NOUN');
}

export const salutationCommaCaseRule = {
  id: 'salutationCommaCase',
  check(letter, { lexicon }) {
    const salutation = letter.salutation?.text?.trim() || '';
    const greeting = salutation.slice(0, -1).trim();
    const word = firstBodyWord(letter.bodySentences, greeting);
    if (!salutation.endsWith(',') || !word || keepsCapital(word, lexicon)) return [];
    const lower = word.toLowerCase();
    return [{
      category: 'orthography',
      code: 'ERR_CAPITAL_AFTER_SALUTATION_COMMA',
      original: `${greeting}, ${word}`,
      correction: `${greeting}, ${lower}`,
      explanation: `Groß-/Kleinschreibung nach der Anrede: Nach einem Komma in der Anrede schreibt man klein weiter: „${lower}“ (nicht „${word}“)`,
    }];
  },
};
