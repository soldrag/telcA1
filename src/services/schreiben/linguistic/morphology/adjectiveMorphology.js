/**
 * Attributive adjective morphology: splits a form into stem + ending and maps the ending to the
 * case/gender slots it can express after a given determiner type (weak / mixed / strong).
 * Level-independent: the vocabulary comes from the injected lexicon port ({ lookup(word) → entries }).
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };

const ENDINGS = paradigms.adjectiveEndingCandidates;

function isAdjectiveBase(word, lexicon) {
  return lexicon.lookup(word).some((e) => e.pos === 'ADJ' || e.pos === 'ADV');
}

/**
 * @returns {{ stem: string, ending: string } | null} null when the form cannot be analysed safely
 *   (irregular stems such as "teuer" / "teure" are left alone rather than guessed).
 */
export function analyzeAdjective(lowerForm, lexicon) {
  const ending = ENDINGS.find((e) => lowerForm.endsWith(e) && isAdjectiveBase(lowerForm.slice(0, -e.length), lexicon));
  if (ending) return { stem: lowerForm.slice(0, -ending.length), ending };
  const endsLikeInflected = ENDINGS.some((e) => lowerForm.endsWith(e));
  return !endsLikeInflected && isAdjectiveBase(lowerForm, lexicon) ? { stem: lowerForm, ending: '' } : null;
}

/** @returns {Set<string>} 'CASE:slot' keys the ending can express */
export function adjectiveSlots(ending, declension) {
  const table = paradigms.adjectiveEndings[declension];
  const slots = new Set();
  for (const [grammaticalCase, bySlot] of Object.entries(table)) {
    for (const [slot, expected] of Object.entries(bySlot)) {
      if (expected === ending) slots.add(`${grammaticalCase}:${slot}`);
    }
  }
  return slots;
}

export function generateAdjective(stem, declension, grammaticalCase, slot) {
  return `${stem}${paradigms.adjectiveEndings[declension][grammaticalCase][slot]}`;
}
