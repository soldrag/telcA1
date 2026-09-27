/**
 * Facts about the content of a letter body that an exam regulation needs to decide whether Leitpunkte
 * can earn points at all. Level-agnostic detection: what the facts are worth is decided by the
 * regulation of the task level (regulations/), never here.
 */

import { parseSentenceTopology } from '../linguistic/topologicalFieldParser.js';
import { countMatchedConcepts } from '../linguistic/keywordConcepts.js';

/**
 * @typedef {Object} LetterContentFacts
 * @property {boolean} hasPredication - some body clause states something: a finite verb, a subject
 *   pronoun or a question. A list of bare nouns ("Ferienwohnung. Personen. Preis.") does not.
 * @property {boolean} hasTaskAnchor - the body names a task-specific rubric keyword of some Leitpunkt,
 *   so the letter is about this task and not another one.
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

// Keywords of a criterion or aspect that declares an evidence kind (a time, a number of persons, an
// occupation) name a dimension every letter can have: they support a Leitpunkt but do not tie the
// letter to this task. "am Samstag um 18 Uhr" is a time in any invitation.
function taskSpecificKeywords(criterion = {}) {
  if (criterion.evidence) return [];
  const aspects = Array.isArray(criterion.aspects) ? criterion.aspects : [];
  const generic = new Set(aspects.filter((a) => a.evidence).flatMap((a) => a.keywords || []));
  const specific = aspects.filter((a) => !a.evidence).flatMap((a) => a.keywords || []);
  const own = (criterion.keywords || []).filter((k) => !generic.has(k));
  return [...new Set([...own, ...specific])];
}

function hasTaskAnchor(words, criteria, lexicon) {
  return criteria.some((criterion) => countMatchedConcepts(taskSpecificKeywords(criterion), words, lexicon) > 0);
}

/**
 * @param {{ bodySentences: string[], criteria: object[], lexicon: { lookup: Function, tag: Function } }} input
 * @returns {LetterContentFacts}
 */
export function detectLetterContentFacts({ bodySentences = [], criteria = [], lexicon }) {
  if (!lexicon) throw new TypeError('detectLetterContentFacts needs a lexicon port');
  const words = bodySentences.join(' ').split(/\s+/).filter(Boolean);
  return {
    hasPredication: bodySentences.some((s) => sentenceHasPredication(s, lexicon)),
    hasTaskAnchor: hasTaskAnchor(words, criteria, lexicon),
  };
}
