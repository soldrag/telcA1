/**
 * Topological field parser (Topologisches Feldermodell), level-independent: the vocabulary comes from the
 * injected lexicon port, tolerances from the level policy.
 * Validates V2 word order, subject-verb inversion, and Satzklammer brackets.
 * Strictly complies with McConnell limits (<= 180 lines, <= 25 lines per function).
 */

import { estimateVorfeldConstituents } from './vorfeldChunker.js';
import { checkVerblessClause } from './verblessClauseChecker.js';
import { checkVorfeldOrder } from './vorfeldOrderChecker.js';
import { checkSubordinateVerbFinal } from './subordinateClauseChecker.js';

function splitIntoWords(clauseStr = '') {
  return clauseStr
    .trim()
    .replace(/[.,!?;:]+$/, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Ausklammerung: prepositional phrases after the right bracket are colloquially accepted; a level policy
 * with `strictSatzklammer` flags anything after it, as beginner courses teach the bracket.
 */
function isIllegalNachfeld(afterTokens = [], policy = {}) {
  if (afterTokens.length === 0) return false;
  if (policy.strictSatzklammer) return true;
  return estimateVorfeldConstituents(afterTokens).some((c) => c.type !== 'PP');
}

/** The whole bracket is quoted, from the finite verb to the clause end, so the learner sees both parts. */
function buildBracketError({ finVerb, mittelfeld, closerIdx, code, explanation }) {
  const words = mittelfeld.map((t) => t.raw);
  const closer = words[closerIdx];
  const reordered = [...words.slice(0, closerIdx), ...words.slice(closerIdx + 1), closer];
  return {
    category: 'syntax',
    code,
    original: [finVerb.raw, ...words].join(' '),
    correction: [finVerb.raw, ...reordered].join(' '),
    explanation: explanation(closer, reordered.slice(0, -1).join(' ')),
  };
}

function findBracketCloser(finVerb, mittelfeld) {
  if (finVerb.valency === 'MODAL') return { pos: 'VERB_INF', code: 'ERR_BROKEN_SATZKLAMMER_MODAL' };
  if (finVerb.valency === 'SEP' && finVerb.baseVerb) return { pos: 'VERB_PREFIX', code: 'ERR_BROKEN_SATZKLAMMER_PREFIX' };
  return null;
}

const BRACKET_EXPLANATIONS = {
  ERR_BROKEN_SATZKLAMMER_MODAL: (finVerb) => (closer, rest) => `Satzklammer verletzt: Bei Modalverben („${finVerb.raw}“) steht der Infinitiv am Satzende: „... ${rest} ${closer}“`,
  ERR_BROKEN_SATZKLAMMER_PREFIX: () => (closer, rest) => `Satzklammer verletzt: Die trennbare Vorsilbe „${closer}“ gehört ans Satzende: „... ${rest} ${closer}“`,
};

function checkSatzklammer(finVerb = {}, mittelfeld = [], policy = {}) {
  const closer = findBracketCloser(finVerb, mittelfeld);
  if (!closer || mittelfeld.length === 0) return [];
  const closerIdx = mittelfeld.findIndex((t, i) => t.pos === closer.pos && i < mittelfeld.length - 1);
  if (closerIdx === -1 || !isIllegalNachfeld(mittelfeld.slice(closerIdx + 1), policy)) return [];
  return [buildBracketError({ finVerb, mittelfeld, closerIdx, code: closer.code, explanation: BRACKET_EXPLANATIONS[closer.code](finVerb) })];
}

/**
 * @param {Array} tokens - tagged clause tokens
 * @param {{ isCoordinated: boolean, followsComma: boolean, precedingSubject: object|null, rawText: string, inSubordinateScope: boolean, lexicon: object, policy: object }} ctx
 */
function parseClause(tokens = [], { isCoordinated = false, followsComma = false, precedingSubject = null, rawText = '', inSubordinateScope = false, lexicon, policy = {} } = {}) {
  if (tokens[0]?.pos === 'KONJ_SUB' || /^(weil|dass|wenn|ob)$/i.test(tokens[0]?.raw || '')) {
    return { type: 'SUBORDINATE_CLAUSE', tokens, errors: checkSubordinateVerbFinal(tokens, { lookup: lexicon.lookup }) };
  }

  const finVerbIdx = tokens.findIndex(t => t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD');
  // After a comma, a clause opened by a W-word or a relative pronoun (article form) that ends in its finite verb is
  // subordinate: an indirect question ("…, wann ich kommen kann") or a relative clause ("…, die gut Deutsch spricht").
  // With the verb second ("…, wann beginnt der Kurs?") it stays a main clause.
  const endsInFiniteVerb = ['VERB_FIN', 'VERB_MOD'].includes(tokens[tokens.length - 1]?.pos);
  if (followsComma && ['INTERROG', 'DET'].includes(tokens[0]?.pos) && endsInFiniteVerb) {
    return { type: 'SUBORDINATE_CLAUSE', tokens, errors: checkSubordinateVerbFinal(tokens, { lookup: lexicon.lookup }) };
  }
  if (finVerbIdx === -1) {
    if (isCoordinated) {
      return { type: 'COORDINATED_PHRASE', tokens, errors: [] };
    }
    const fragmentError = checkVerblessClause(tokens, rawText);
    return { type: 'FRAGMENT', tokens, errors: fragmentError ? [fragmentError] : [] };
  }

  // Coordinated subordinate clause (e.g. "..., weil A und B ist")
  if (isCoordinated && inSubordinateScope) {
    const isVerbFinal = finVerbIdx >= tokens.length - 2;
    if (isVerbFinal) {
      return { type: 'COORDINATED_SUBORDINATE_CLAUSE', tokens, errors: [] };
    }
  }

  const finVerb = tokens[finVerbIdx];
  const vorfeldTokens = tokens.slice(0, finVerbIdx);
  const mittelfeldTokens = tokens.slice(finVerbIdx + 1);

  // Coordinated subject-ellipsis check ("und kann nicht kommen")
  if (isCoordinated && vorfeldTokens.length === 0 && precedingSubject) {
    const agreesPerson = !finVerb.person || finVerb.person.includes(precedingSubject.person?.[0] ?? 0);
    if (agreesPerson) {
      const skErrors = checkSatzklammer(finVerb, mittelfeldTokens, policy);
      return { type: 'V2_COORDINATED_ELLIPSIS', finVerb, vorfeld: [], mittelfeld: mittelfeldTokens, errors: skErrors };
    }
  }

  if (finVerbIdx === 0) {
    const skErrors = checkSatzklammer(finVerb, mittelfeldTokens, policy);
    return { type: 'V1_QUESTION_OR_IMP', finVerb, vorfeld: [], mittelfeld: mittelfeldTokens, errors: skErrors };
  }

  const constituents = estimateVorfeldConstituents(vorfeldTokens);
  const v2Errors = checkVorfeldOrder(constituents, finVerb, mittelfeldTokens);
  const skErrors = checkSatzklammer(finVerb, mittelfeldTokens, policy);

  return {
    type: 'V2_STATEMENT',
    finVerb,
    constituents,
    vorfeld: vorfeldTokens,
    mittelfeld: mittelfeldTokens,
    errors: [...v2Errors, ...skErrors]
  };
}

/**
 * @param {string} sentenceStr
 * @param {{ strictSatzklammer?: boolean }} [policy] - level policy from the grammar profile
 */
/**
 * @param {string} sentenceStr
 * @param {{ lexicon: { tag: Function, lookup: Function }, policy?: object }} context - the level profile's lexicon port and policy
 */
export function parseSentenceTopology(sentenceStr = '', { lexicon, policy = {} } = {}) {
  if (!lexicon) throw new TypeError('parseSentenceTopology needs a lexicon port');
  const clean = sentenceStr.trim();
  if (!clean) return { clauses: [], errors: [] };

  // Split on commas and coordinate conjunctions
  const rawClauses = clean.split(/,\s*|\b(?=und\s+|aber\s+|oder\s+|denn\s+)/i);
  const parsedClauses = [];
  const allErrors = [];
  let lastSubject = null;
  let inSubordinateScope = false;

  for (let i = 0; i < rawClauses.length; i++) {
    const clauseText = rawClauses[i].trim();
    if (!clauseText) continue;

    const words = splitIntoWords(clauseText);
    const isCoordinated = /^(und|aber|oder|denn|sondern)$/i.test(words[0] || '');
    const coordWord = isCoordinated ? words[0].toLowerCase() : '';
    const activeWords = isCoordinated ? words.slice(1) : words;

    if (coordWord === 'aber' || coordWord === 'denn') {
      inSubordinateScope = false;
    }

    const tagged = lexicon.tag(activeWords);
    const followsComma = i > 0 && !isCoordinated;
    const parsed = parseClause(tagged, { isCoordinated, followsComma, precedingSubject: lastSubject, rawText: clauseText, inSubordinateScope, lexicon, policy });

    if (parsed.type === 'SUBORDINATE_CLAUSE') {
      inSubordinateScope = true;
    }

    if (parsed.vorfeld) {
      const subj = tagged.find(t => t.pos === 'PRON_SUBJ');
      if (subj) lastSubject = subj;
    }

    parsedClauses.push(parsed);
    if (parsed.errors && parsed.errors.length > 0) {
      allErrors.push(...parsed.errors);
    }
  }

  return { clauses: parsedClauses, errors: allErrors };
}
