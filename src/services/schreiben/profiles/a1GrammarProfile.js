/**
 * telc A1 grammar profile: the A1 vocabulary, the rules checked at this level and its tolerances.
 * Other levels add their own profile; the grammar engine stays unchanged.
 */
import { lookupWord, findWordForms, tagTokens } from '../linguistic/a1LexiconService.js';

export const A1_GRAMMAR_PROFILE = Object.freeze({
  level: 'A1',
  lexicon: Object.freeze({ lookup: lookupWord, findForms: findWordForms, tag: tagTokens }),
  rules: Object.freeze(['nounPhraseCase', 'calendarArticle', 'numeralPlural', 'countability', 'subjectVerbAgreement', 'measurePhraseOrder',
    'verbFrame', 'determinerlessCountNoun']),
  letterRules: Object.freeze(['salutationAgreement', 'salutationCommaCase', 'closingFormula', 'nounCapitalization', 'umlautSpelling']),
  // Learning-scale weights per error category: word order breaks the sentence frame and hinders reading most,
  // spelling slips least. They never touch the telc score.
  accuracyWeights: Object.freeze({ syntax: 1.5, rektion: 1.0, agreement: 1.0, grammar: 1.0, lexik: 1.0, orthography: 0.5 }),
  policy: Object.freeze({
    // Everyday A1 German uses the dative after genitive prepositions ("wegen dem Termin"); not an error here.
    acceptedPrepositionCases: Object.freeze({ GEN: ['DAT'] }),
    // A1 courses teach the sentence bracket strictly: nothing follows the infinitive ("an der Ostsee machen").
    strictSatzklammer: true,
  }),
});
