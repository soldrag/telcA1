/**
 * Topological field parser (Topologisches Feldermodell), level-independent: the vocabulary comes from the
 * injected lexicon port, tolerances from the level policy.
 * Validates V2 word order, subject-verb inversion, and Satzklammer brackets.
 */

import { estimateVorfeldConstituents } from './vorfeldChunker.js';
import { checkVerblessClause } from './verblessClauseChecker.js';
import { checkVorfeldOrder } from './vorfeldOrderChecker.js';
import { checkSubordinateVerbFinal } from './subordinateClauseChecker.js';

const FINITE_VERB_POS = new Set(['VERB_FIN', 'VERB_MOD']);
const SUBORDINATE_OPENER_POS = new Set(['INTERROG', 'DET']);
const SUBORDINATE_CONJUNCTION = /^(weil|dass|wenn|ob)$/i;
const COORDINATOR = /^(und|aber|oder|denn|sondern)$/i;
const SCOPE_CLOSING_COORDINATORS = new Set(['aber', 'denn']);
const CLAUSE_BOUNDARY = /,\s*|\b(?=und\s+|aber\s+|oder\s+|denn\s+)/i;

const isFiniteVerb = (token) => FINITE_VERB_POS.has(token?.pos);
const isSubjectPronoun = (token) => token.pos === 'PRON_SUBJ';

/** The verb part that closes the bracket, by the valency of the finite verb. */
const BRACKET_CLOSERS = new Map([
  ['MODAL', {
    pos: 'VERB_INF',
    code: 'ERR_BROKEN_SATZKLAMMER_MODAL',
    explain: (closer, rest, finVerb) => `Satzklammer verletzt: Bei Modalverben („${finVerb.raw}“) steht der Infinitiv am Satzende: „... ${rest} ${closer}“`,
  }],
  ['SEP', {
    pos: 'VERB_PREFIX',
    code: 'ERR_BROKEN_SATZKLAMMER_PREFIX',
    explain: (closer, rest) => `Satzklammer verletzt: Die trennbare Vorsilbe „${closer}“ gehört ans Satzende: „... ${rest} ${closer}“`,
  }],
]);

function splitIntoWords(clauseStr) {
  return clauseStr.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
}

function splitCoordinator(words) {
  const [first = '', ...rest] = words;
  return COORDINATOR.test(first) ? { coordinator: first.toLowerCase(), words: rest } : { coordinator: '', words };
}

/**
 * Ausklammerung: prepositional phrases after the right bracket are colloquially accepted; a level policy
 * with `strictSatzklammer` flags anything after it, as beginner courses teach the bracket.
 */
function isIllegalNachfeld(afterTokens, policy) {
  return Boolean(policy.strictSatzklammer) || estimateVorfeldConstituents(afterTokens).some((c) => c.type !== 'PP');
}

function findBracketCloser(finVerb) {
  if (finVerb.valency === 'SEP' && !finVerb.baseVerb) return undefined;
  return BRACKET_CLOSERS.get(finVerb.valency);
}

/** The whole bracket is quoted, from the finite verb to the clause end, so the learner sees both parts. */
function buildBracketError(finVerb, mittelfeld, { closerIdx, rule }) {
  const words = mittelfeld.map((t) => t.raw);
  const closer = words[closerIdx];
  const rest = words.toSpliced(closerIdx, 1);
  return {
    category: 'syntax',
    code: rule.code,
    original: [finVerb.raw, ...words].join(' '),
    correction: [finVerb.raw, ...rest, closer].join(' '),
    explanation: rule.explain(closer, rest.join(' '), finVerb),
  };
}

function checkSatzklammer(finVerb, mittelfeld, policy) {
  const rule = findBracketCloser(finVerb);
  if (!rule) return [];
  const closerIdx = mittelfeld.findIndex((t, i) => t.pos === rule.pos && i < mittelfeld.length - 1);
  if (closerIdx === -1 || !isIllegalNachfeld(mittelfeld.slice(closerIdx + 1), policy)) return [];
  return [buildBracketError(finVerb, mittelfeld, { closerIdx, rule })];
}

/**
 * After a comma, a clause opened by a W-word or a relative pronoun (article form, also after a preposition) that
 * ends in its finite verb is subordinate: an indirect question ("…, wann ich kommen kann") or a relative clause
 * ("…, die gut Deutsch spricht", "…, mit dem ich arbeite").
 * With the verb second ("…, wann beginnt der Kurs?") it stays a main clause.
 */
function opensSubordinateClause(tokens, followsComma) {
  const [first, second] = tokens;
  if (first?.pos === 'KONJ_SUB' || SUBORDINATE_CONJUNCTION.test(first?.raw ?? '')) return true;
  const opener = first?.pos === 'PREP' ? second : first;
  return followsComma && SUBORDINATE_OPENER_POS.has(opener?.pos) && isFiniteVerb(tokens.at(-1));
}

function parseVerblessClause(tokens, { isCoordinated, followsComma, rawText }) {
  if (isCoordinated) return { type: 'COORDINATED_PHRASE', tokens, errors: [] };
  // A verbless piece after a comma belongs to the sentence before it ("Wo ist die Kasse, bitte?").
  const fragmentError = followsComma ? null : checkVerblessClause(tokens, rawText);
  return { type: 'FRAGMENT', tokens, errors: fragmentError ? [fragmentError] : [] };
}

/** Coordinated subject ellipsis: "…, und kann nicht kommen" reuses the subject of the clause before. */
function isSubjectEllipsis(finVerb, vorfeld, { isCoordinated, precedingSubject }) {
  if (!isCoordinated || vorfeld.length > 0 || !precedingSubject) return false;
  return !finVerb.person || finVerb.person.includes(precedingSubject.person?.[0] ?? 0);
}

function parseMainClause(tokens, finVerbIdx, ctx) {
  const finVerb = tokens[finVerbIdx];
  const vorfeld = tokens.slice(0, finVerbIdx);
  const mittelfeld = tokens.slice(finVerbIdx + 1);
  const bracketErrors = checkSatzklammer(finVerb, mittelfeld, ctx.policy);
  const fields = { finVerb, vorfeld, mittelfeld };
  if (isSubjectEllipsis(finVerb, vorfeld, ctx)) return { type: 'V2_COORDINATED_ELLIPSIS', ...fields, errors: bracketErrors };
  if (finVerbIdx === 0) return { type: 'V1_QUESTION_OR_IMP', ...fields, errors: bracketErrors };
  const constituents = estimateVorfeldConstituents(vorfeld);
  const orderErrors = checkVorfeldOrder(constituents, finVerb, mittelfeld);
  return { type: 'V2_STATEMENT', ...fields, constituents, errors: [...orderErrors, ...bracketErrors] };
}

/**
 * @param {Array} tokens - tagged clause tokens
 * @param {{ isCoordinated: boolean, followsComma: boolean, precedingSubject: object|null, rawText: string, inSubordinateScope: boolean, lexicon: object, policy: object }} ctx
 */
function parseClause(tokens, ctx) {
  if (opensSubordinateClause(tokens, ctx.followsComma)) {
    return { type: 'SUBORDINATE_CLAUSE', tokens, errors: checkSubordinateVerbFinal(tokens, { lookup: ctx.lexicon.lookup }) };
  }
  const finVerbIdx = tokens.findIndex(isFiniteVerb);
  if (finVerbIdx === -1) return parseVerblessClause(tokens, ctx);
  // Coordinated subordinate clause: "…, weil A und B ist"
  if (ctx.isCoordinated && ctx.inSubordinateScope && finVerbIdx >= tokens.length - 2) {
    return { type: 'COORDINATED_SUBORDINATE_CLAUSE', tokens, errors: [] };
  }
  return parseMainClause(tokens, finVerbIdx, ctx);
}

/**
 * @param {string} sentenceStr
 * @param {{ lexicon: { tag: Function, lookup: Function }, policy?: object }} context - the level profile's lexicon port and policy
 */
export function parseSentenceTopology(sentenceStr = '', { lexicon, policy = {} } = {}) {
  if (!lexicon) throw new TypeError('parseSentenceTopology needs a lexicon port');
  const clean = sentenceStr.trim();
  if (!clean) return { clauses: [], errors: [] };

  const clauses = [];
  let precedingSubject = null;
  let inSubordinateScope = false;
  // The index counts every split piece, empty ones included: only the first piece cannot follow a comma.
  for (const [i, piece] of clean.split(CLAUSE_BOUNDARY).entries()) {
    const rawText = piece.trim();
    if (!rawText) continue;
    const { coordinator, words } = splitCoordinator(splitIntoWords(rawText));
    const isCoordinated = coordinator !== '';
    if (SCOPE_CLOSING_COORDINATORS.has(coordinator)) inSubordinateScope = false;

    const tagged = lexicon.tag(words);
    const ctx = { isCoordinated, followsComma: i > 0 && !isCoordinated, precedingSubject, rawText, inSubordinateScope, lexicon, policy };
    const clause = parseClause(tagged, ctx);
    clauses.push(clause);
    inSubordinateScope ||= clause.type === 'SUBORDINATE_CLAUSE';
    if (clause.vorfeld) precedingSubject = tagged.find(isSubjectPronoun) ?? precedingSubject;
  }
  return { clauses, errors: clauses.flatMap((c) => c.errors) };
}
