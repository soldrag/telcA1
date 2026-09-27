/**
 * Salutation agreement: the adjective of "Sehr geehrte… / Liebe…" takes the strong nominative ending of the
 * addressee's gender ("Sehr geehrter Herr", "Sehr geehrte Frau", "Liebes Team", "Sehr geehrte Damen und Herren").
 */
import { matchSalutation } from '../letter/letterFormulaMatcher.js';
import { analyzeAdjective, generateAdjective } from '../morphology/adjectiveMorphology.js';
import { matchCapitalization, joinWords } from './letterWording.js';

const SLOT_NAMES = { m: 'maskulin', f: 'feminin', n: 'neutral', pl: 'Plural' };

// The addressee is a title, a group ("Team") or a name. Names are not vocabulary: a general-dictionary noun
// spelled like a name ("Anna", a coin) must not decide the gender.
function addresseeSlot(word, lexicon) {
  for (const form of [word.replace(/-/g, ''), word.split('-').at(-1)]) {
    const noun = lexicon.lookup(form).find((e) => e.pos === 'NOUN' && e.source !== 'dictionary' && (e.number === 'pl' || e.gender));
    if (noun) return noun.number === 'pl' ? 'pl' : noun.gender;
  }
  return null;
}

function expectedAdjective(adjective, slot, lexicon) {
  const analysis = analyzeAdjective(adjective.toLowerCase(), lexicon);
  return analysis ? generateAdjective(analysis.stem, 'strong', 'NOM', slot) : null;
}

export const salutationAgreementRule = {
  id: 'salutationAgreement',
  check(letter, { lexicon }) {
    const formula = matchSalutation(letter.salutation?.text);
    const addressee = formula?.following[0];
    if (!formula?.agreesWithAddressee || !addressee) return [];
    const slot = addresseeSlot(addressee.word, lexicon);
    const adjective = formula.words.at(-1).word;
    const expected = slot && expectedAdjective(adjective, slot, lexicon);
    if (!expected || expected === adjective.toLowerCase()) return [];
    const lead = joinWords(formula.words.slice(0, -1));
    const fixed = matchCapitalization(expected, adjective);
    const withLead = (adj) => [lead, adj, addressee.word].filter(Boolean).join(' ');
    return [{
      category: 'agreement',
      code: 'ERR_SALUTATION_AGREEMENT',
      original: withLead(adjective),
      correction: withLead(fixed),
      explanation: `Deklination in der Anrede: „${addressee.word}“ ist ${SLOT_NAMES[slot]}, daher „${fixed}“ (nicht „${adjective}“).`,
    }];
  },
};
