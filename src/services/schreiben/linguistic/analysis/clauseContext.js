/**
 * Clause context for case government: clause spans inside a tagged sentence, the finite verb,
 * the lexical verb whose frame governs objects, and whether the clause has a pronoun subject.
 */
import { endsPhrase } from './nounPhraseChunker.js';

const CLAUSE_OPENERS = new Set(['KONJ_COORD', 'KONJ_SUB']);
const FINITE_POS = new Set(['VERB_FIN', 'VERB_MOD']);
const NON_FINITE_POS = new Set(['VERB_INF', 'VERB_PART']);

function segmentClauses(tokens = []) {
  const spans = [];
  let start = 0;
  tokens.forEach((token, i) => {
    if (i > start && CLAUSE_OPENERS.has(token.pos)) {
      spans.push({ start, end: i - 1 });
      start = i;
    }
    if (endsPhrase(token)) {
      spans.push({ start, end: i });
      start = i + 1;
    }
  });
  if (start < tokens.length) spans.push({ start, end: tokens.length - 1 });
  return spans;
}

/** Objects follow the frame of the verb that carries the meaning: the infinitive or participle if there is one. */
function resolveObjectCases(verb = {}) {
  const objectCase = verb.objCase || (verb.valency === 'TRANS' ? 'AKK' : verb.valency === 'DAT' ? 'DAT' : null);
  if (!objectCase) return null;
  return verb.ditransitive ? ['AKK', 'DAT'] : [objectCase];
}

function describeClause(tokens, span) {
  const indices = Array.from({ length: span.end - span.start + 1 }, (_, k) => span.start + k);
  const finiteIndex = indices.find((i) => FINITE_POS.has(tokens[i].pos)) ?? -1;
  const nonFiniteIndex = indices.filter((i) => NON_FINITE_POS.has(tokens[i].pos)).pop();
  const lexicalVerb = tokens[nonFiniteIndex ?? finiteIndex] || null;
  return {
    ...span,
    finiteIndex,
    isVerbFinal: tokens[span.start]?.pos === 'KONJ_SUB',
    objectCases: lexicalVerb ? resolveObjectCases(lexicalVerb) : null,
    lexicalVerb,
    hasPronounSubject: indices.some((i) => tokens[i].pos === 'PRON_SUBJ'),
  };
}

export function describeClauses(tokens = []) {
  return segmentClauses(tokens).map((span) => describeClause(tokens, span));
}

export function findClauseOf(clauses = [], index = 0) {
  return clauses.find((c) => index >= c.start && index <= c.end) || null;
}
