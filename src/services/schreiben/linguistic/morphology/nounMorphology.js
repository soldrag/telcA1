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

const slotOf = (entry) => (entry.number === 'pl' ? 'pl' : entry.gender);

/**
 * @param {string} form - the noun as written (capitalisation decides dictionary noun readings)
 * @param {{ lookup: Function }} lexicon - level vocabulary port
 * @returns {{ slot: string, cases: string[], entry: object } | null} null for unknown nouns and for forms whose
 *   gender/number the word alone does not fix ("der/die Lehrer", "der/das Joghurt", adjectival "Erwachsene")
 */
export function analyzeNoun(form, lexicon) {
  const nouns = lexicon.lookup(form || '').filter((e) => e.pos === 'NOUN');
  const slots = new Set(nouns.map(slotOf));
  if (nouns.length === 0 || slots.size !== 1 || slots.has(undefined) || nouns.some((e) => e.adjectivalDeclension)) return null;
  const entry = nouns[0];
  return { slot: slotOf(entry), cases: allowedCases(String(form).toLowerCase().replace(/[.,!?;:]+$/, ''), entry), entry };
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
