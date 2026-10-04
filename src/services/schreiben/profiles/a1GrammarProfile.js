/**
 * telc A1 grammar profile: the A1 vocabulary, the rules checked at this level and its tolerances.
 * Other levels add their own profile; the grammar engine stays unchanged.
 */
import { lookupWord, findWordForms, tagTokens, loadLexiconData } from '../linguistic/a1LexiconService.js';

export const A1_GRAMMAR_PROFILE = Object.freeze({
  level: 'A1',
  lexicon: Object.freeze({ load: loadLexiconData, lookup: lookupWord, findForms: findWordForms, tag: tagTokens }),
  rules: Object.freeze(['nounPhraseCase', 'calendarArticle', 'numeralPlural', 'countability', 'subjectVerbAgreement', 'measurePhraseOrder',
    'verbFrame', 'determinerlessCountNoun']),
  letterRules: Object.freeze(['salutationAgreement', 'salutationCommaCase', 'closingFormula', 'nounCapitalization', 'umlautSpelling']),
  // Learning-scale weights per error category: word order breaks the sentence frame and hinders reading most,
  // spelling slips least. A1 is graded on communication; this scale prepares for A2, where such errors cost points,
  // so a defect weighs more here than it would on the exam. They never touch the telc score.
  accuracyWeights: Object.freeze({ syntax: 2.0, rektion: 1.5, agreement: 1.5, grammar: 1.5, lexik: 1.5, orthography: 0.5 }),
  policy: Object.freeze({
    // Everyday A1 German uses the dative after genitive prepositions ("wegen dem Termin"); not an error here.
    acceptedPrepositionCases: Object.freeze({ GEN: ['DAT'] }),
    // A prepositional phrase after the infinitive is accepted German ("ein Zimmer reservieren für zwei Nächte"),
    // so only an object or other non-prepositional part there is flagged ("einen Termin machen", not "machen einen
    // Termin"). Hints are shown only where the rule is reliable; strict bracket teaching flagged correct sentences.
    strictSatzklammer: false,
  }),
});
