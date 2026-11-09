/**
 * The register a task expects of the letter's opening and closing formulas: rubric data
 * (`options_json.rubric.addresseeRegister`), never guessed from the situation text. A letter to a friend
 * ("Lieber Ingo … Viele Grüße") is appropriate to an informal task; the same formulas to an office are not.
 */

import { readTaskOptions } from './leitpunktCriteria.js';

export const ADDRESSEE_REGISTERS = Object.freeze({ FORMAL: 'formal', INFORMAL: 'informal' });

const KNOWN = new Set(Object.values(ADDRESSEE_REGISTERS));

/**
 * @param {object} question - a Schreiben Teil 2 task
 * @returns {'formal'|'informal'} formal for a task without a rubric (legacy data: every such task was formal)
 */
export function resolveAddresseeRegister(question = {}) {
  const rubric = readTaskOptions(question).rubric;
  if (!rubric?.addresseeRegister) return ADDRESSEE_REGISTERS.FORMAL;
  if (!KNOWN.has(rubric.addresseeRegister)) {
    throw new RangeError(`Unknown addresseeRegister "${rubric.addresseeRegister}"; expected ${[...KNOWN].join(' or ')}`);
  }
  return rubric.addresseeRegister;
}
