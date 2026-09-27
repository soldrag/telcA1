/**
 * Noun morphology for case checks: the slot (gender or plural) a noun form fills, the cases its form allows,
 * and the form a case requires. Rules come from the paradigm data: dative plural takes -n unless the plural
 * already ends in -n/-s; weak masculine nouns (n-Deklination, lexicon `obliqueForm`) change outside the nominative.
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };

const CASES = ['NOM', 'AKK', 'DAT', 'GEN'];
const { dativePluralSuffix, dativePluralExemptEndings } = paradigms.noun;

function allowedCases(lowerForm, entry) {
  if (entry.number === 'pl') {
    const hasDativeForm = dativePluralExemptEndings.some((e) => lowerForm.endsWith(e));
    return hasDativeForm ? CASES : CASES.filter((c) => c !== 'DAT');
  }
  if (!entry.weakMasculine) return CASES;
  const isBaseForm = lowerForm === entry.lemma.toLowerCase();
  return isBaseForm ? ['NOM'] : ['AKK', 'DAT', 'GEN'];
}

const slotsOf = (entry) => (entry.number === 'pl' ? ['pl'] : entry.gender ? [entry.gender] : entry.genders || []);

/**
 * @param {string} form - the noun as written (capitalisation decides dictionary noun readings)
 * @param {{ lookup: Function }} lexicon - level vocabulary port
 * @param {{ bare?: boolean }} [options] - `bare`: the noun stands without determiner, numeral or adjective. Proper
 *   names do ("Maria kommt", "mit Maria"), so a general-dictionary reading ("Maria", plural of "Mare") is not
 *   taken for a bare word; the level vocabulary still is.
 * @returns {{ slot: string, cases: string[], entry: object, readings: Array<{ slot, cases, entry }> } | null}
 *   every slot the form can fill ("Kollegen": m sg oblique or plural, "Joghurt": m or n); the phrase decides
 *   between them. The top-level fields repeat the first reading. null for unknown nouns and for adjectival
 *   declension ("Erwachsene"), whose slot the determiner alone decides.
 */
export function analyzeNoun(form, lexicon, { bare = false } = {}) {
  const nouns = lexicon.lookup(form || '').filter((e) => e.pos === 'NOUN' && !(bare && e.source === 'dictionary'));
  if (nouns.length === 0 || nouns.some((e) => e.adjectivalDeclension)) return null;
  const lowerForm = String(form).toLowerCase().replace(/[.,!?;:]+$/, '');
  const readings = nouns.flatMap((entry) => slotsOf(entry).map((slot) => ({ slot, cases: allowedCases(lowerForm, entry), entry })));
  return readings.length ? withReadings(readings) : null;
}

/** The analysis narrowed to some of its readings; the top-level fields follow the first one. */
export function withReadings(readings) {
  return { ...readings[0], readings };
}

export function generateNoun(rawForm, analysis, grammaticalCase) {
  const { entry } = analysis;
  if (entry.number === 'pl') {
    const needsSuffix = grammaticalCase === 'DAT' && !dativePluralExemptEndings.some((e) => rawForm.toLowerCase().endsWith(e));
    return needsSuffix ? `${rawForm}${dativePluralSuffix}` : rawForm;
  }
  if (!entry.weakMasculine) return rawForm;
  return grammaticalCase === 'NOM' ? entry.lemma : entry.obliqueForm;
}
