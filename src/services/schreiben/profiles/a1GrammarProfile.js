/**
 * telc A1 grammar profile: the A1 vocabulary, the rules checked at this level and its tolerances.
 * Other levels add their own profile; the grammar engine stays unchanged.
 */
import { lookupWord, findWordForms, tagTokens } from '../linguistic/a1LexiconService.js';

export const A1_GRAMMAR_PROFILE = Object.freeze({
  level: 'A1',
  lexicon: Object.freeze({ lookup: lookupWord, findForms: findWordForms, tag: tagTokens }),
  rules: Object.freeze(['nounPhraseCase', 'calendarArticle', 'numeralPlural', 'countability']),
  policy: Object.freeze({
    // Everyday A1 German uses the dative after genitive prepositions ("wegen dem Termin"); not an error here.
    acceptedPrepositionCases: Object.freeze({ GEN: ['DAT'] }),
  }),
});
