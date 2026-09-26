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

/**
 * @param {string} lowerForm
 * @param {{ lookup: Function }} lexicon - level vocabulary port
 * @returns {{ slot: string, cases: string[], entry: object } | null} null for unknown nouns
 */
export function analyzeNoun(lowerForm, lexicon) {
  const entry = lexicon.lookup(lowerForm || '').find((e) => e.pos === 'NOUN' && (e.number === 'pl' || e.gender));
  if (!entry) return null;
  const slot = entry.number === 'pl' ? 'pl' : entry.gender;
  return { slot, cases: allowedCases(lowerForm, entry), entry };
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
