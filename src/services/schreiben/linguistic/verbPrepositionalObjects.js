/**
 * Prepositional objects of a clause: the noun phrases introduced by a preposition the clause's verb governs
 * (data/verbPrepositionalObjects.json: "fragen nach", "bitten um"). Other prepositional phrases are adjuncts
 * ("am Montag", "mit dem Bus") and are not returned.
 */
import valency from './data/verbPrepositionalObjects.json' with { type: 'json' };
import contractionData from './data/prepositionContractions.json' with { type: 'json' };

const prepositionOf = (lower = '') => contractionData.contractions[lower]?.preposition ?? lower;

function clauseVerbs({ finVerb, nonFinVerb, baseAction } = {}) {
  return [...new Set([baseAction, nonFinVerb?.lemma, finVerb?.lemma].filter(Boolean).map((v) => v.toLowerCase()))];
}

function governedBy(verbs, preposition) {
  for (const verb of verbs) {
    const entry = (valency.verbs[verb] || []).find((e) => e.preposition === preposition);
    if (entry) return { verb, wants: Boolean(entry.wants) };
  }
  return null;
}

function openPhrase(verbs, preposition) {
  const governor = governedBy(verbs, preposition);
  return governor ? { ...governor, preposition } : null;
}

/** @returns {Array<{ preposition: string, noun: string, verb: string, wants: boolean }>} */
export function readPrepositionalObjects(tokens = [], predicateCore = {}) {
  const verbs = clauseVerbs(predicateCore);
  const found = [];
  let open = null;
  for (const t of tokens) {
    if (t.pos === 'PREP') open = openPhrase(verbs, prepositionOf(t.lower));
    else if (t.pos === 'NOUN' && open) {
      found.push({ ...open, noun: (t.lemma || t.lower).toLowerCase() });
      open = null;
    }
  }
  return found;
}
