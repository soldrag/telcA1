/**
 * Sentence mood from clause topology: whether a sentence is addressed to the reader as a question
 * or a request. V1 covers yes/no questions and imperatives ("Haben Sie Zeit?", "Schicken Sie mir ..."),
 * an interrogative in the Vorfeld covers W-questions ("Wie viel kostet der Kurs?").
 */

import { parseSentenceTopology } from './topologicalFieldParser.js';

function isDirectiveClause(clause = {}) {
  if (clause.type === 'V1_QUESTION_OR_IMP') return true;
  return clause.type === 'V2_STATEMENT' && clause.vorfeld?.[0]?.pos === 'INTERROG';
}

/**
 * @param {string} sentence
 * @param {{ lexicon: object }} context - the level's lexicon port
 */
export function isAddresseeDirected(sentence = '', { lexicon } = {}) {
  const clean = String(sentence || '').trim();
  if (!clean) return false;
  if (clean.endsWith('?')) return true;
  const [firstClause] = parseSentenceTopology(clean, { lexicon }).clauses;
  return isDirectiveClause(firstClause);
}
