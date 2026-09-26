/**
 * Determiner morphology from the declension paradigms (data/declensionParadigms.json):
 * which case/gender slots a determiner form can express, and which form a slot requires.
 * A slot is 'm' | 'f' | 'n' | 'pl'.
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };

const CASES = ['NOM', 'AKK', 'DAT', 'GEN'];
const SLOTS = ['m', 'f', 'n', 'pl'];

function buildFormIndex() {
  const index = new Map();
  for (const [family, spec] of Object.entries(paradigms.determiners)) {
    for (const [lemma, stem] of Object.entries(spec.stems)) {
      for (const grammaticalCase of CASES) {
        for (const slot of SLOTS) {
          if (slot === 'pl' && spec.singularOnly?.includes(lemma)) continue;
          const ending = spec.forms[grammaticalCase][slot];
          const form = ending ? `${stem}${ending}` : lemma;
          const readings = index.get(form) || [];
          index.set(form, [...readings, { family, lemma, case: grammaticalCase, slot }]);
        }
      }
    }
  }
  return index;
}

const FORM_INDEX = buildFormIndex();

/** @returns {Array<{ family: string, lemma: string, case: string, slot: string }>} empty when not a determiner */
export function analyzeDeterminer(lowerForm = '') {
  return FORM_INDEX.get(lowerForm) || [];
}

export function adjectiveDeclensionAfter(family = '') {
  return paradigms.determiners[family]?.adjectiveDeclension || 'strong';
}

export function generateDeterminer({ family, lemma }, grammaticalCase, slot) {
  const spec = paradigms.determiners[family];
  if (!spec || (slot === 'pl' && spec.singularOnly?.includes(lemma))) return null;
  const ending = spec.forms[grammaticalCase]?.[slot];
  if (ending === undefined) return null;
  return ending ? `${spec.stems[lemma]}${ending}` : lemma;
}
