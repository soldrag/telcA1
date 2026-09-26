/**
 * Transitive call verbs used with a preposition: "rufen Sie an mich zurück" → "rufen Sie mich zurück".
 * Case and valency of noun phrases moved to the grammar engine (grammarRules/nounPhraseCaseRule.js);
 * this check moves to the verb-frame rule in the next refactoring step.
 */

const CALL_VERB_LEMMAS = new Set(['rufen', 'anrufen', 'zurückrufen']);

function checkTransitivePreposition(tokens, i) {
  const anIdx = tokens.findIndex((tok, idx) => idx > i && tok.lower === 'an');
  if (anIdx === -1 || tokens[anIdx + 1]?.pos !== 'PRON_OBJ') return null;
  const objToken = tokens[anIdx + 1];
  const hasZurueck = tokens[anIdx + 2]?.lower === 'zurück';
  const orig = `an ${objToken.raw}${hasZurueck ? ' zurück' : ''}`;
  const corr = `${objToken.raw}${hasZurueck ? ' zurück' : ' an'}`;
  return {
    category: 'rektion',
    code: 'ERR_TRANSITIVE_VERB_PREPOSITION',
    original: orig,
    correction: corr,
    explanation: `Das Verb „${hasZurueck ? 'zurückrufen' : 'anrufen'}“ ist transitiv und wird ohne die Präposition „an“ verwendet: „${corr}“ (nicht „${orig}“).`
  };
}

export function validateCaseAndValency(tokens = []) {
  return tokens
    .map((t, i) => (CALL_VERB_LEMMAS.has(t.lemma) ? checkTransitivePreposition(tokens, i) : null))
    .filter(Boolean);
}
