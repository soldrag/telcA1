/**
 * Facts about the content of a letter body that an exam regulation needs to decide whether Leitpunkte
 * can earn points at all. Level-agnostic detection: what the facts are worth is decided by the
 * regulation of the task level (regulations/), never here.
 */

import { parseSentenceTopology } from '../linguistic/topologicalFieldParser.js';

/**
 * @typedef {Object} LetterContentFacts
 * @property {boolean} hasPredication - some body clause states something: a finite verb, a subject
 *   pronoun or a question. A list of bare nouns ("Ferienwohnung. Personen. Preis.") does not.
 * @property {boolean|null} servesTaskPurpose - the Leitpunkt assessor's reading of the letter's purpose: false when
 *   the letter is written for another purpose; null when it could not read it (no model).
 */

const VERBLESS_CLAUSE_TYPES = new Set(['FRAGMENT', 'COORDINATED_PHRASE']);

// An elliptical clause keeps its predicate without the copula: "Krank." (ich bin krank), "Morgen leider
// nicht." An adjective before a noun is attributive ("Vier Personen."), so a noun phrase states nothing.
function hasEllipticalPredicate(tokens) {
  return tokens.some((t, i) => t.pos === 'ADV' || t.pos === 'PART_NEG'
    || (t.pos === 'ADJ' && tokens[i + 1]?.pos !== 'NOUN' && tokens[i + 1]?.pos !== 'ADJ'));
}

function isPredicatingClause(clause) {
  const tokens = clause.tokens || [];
  if (!VERBLESS_CLAUSE_TYPES.has(clause.type)) return true;
  return tokens.some((t) => t.pos === 'PRON_SUBJ') || hasEllipticalPredicate(tokens);
}

function isQuestion(sentence) {
  return String(sentence).trim().endsWith('?');
}

function sentenceHasPredication(sentence, lexicon) {
  if (isQuestion(sentence)) return true;
  return parseSentenceTopology(sentence, { lexicon }).clauses.some(isPredicatingClause);
}

/**
 * @param {{ bodySentences: string[], lexicon: { lookup: Function, tag: Function }, servesTaskPurpose?: boolean|null }} input
 * @returns {LetterContentFacts}
 */
export function detectLetterContentFacts({ bodySentences = [], lexicon, servesTaskPurpose = null }) {
  if (!lexicon) throw new TypeError('detectLetterContentFacts needs a lexicon port');
  return {
    hasPredication: bodySentences.some((s) => sentenceHasPredication(s, lexicon)),
    servesTaskPurpose,
  };
}
