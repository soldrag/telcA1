/**
 * telc A1 grammar checker binding (tests and tools): the grading paths take the checker of the
 * task's level from resolveLevelContext(question.level).
 */
import { resolveLevelContext } from './levelContext.js';

const a1GrammarChecker = resolveLevelContext('A1').grammar;

/** @returns {Array<{ original: string, correction: string, category: string, code?: string, explanation: string }>} */
export function checkGermanA1Grammar(text = '') {
  return a1GrammarChecker.checkLetter(text);
}

/** @returns {object|null} the declension error of a salutation line ("Sehr geehrte Herr"), if any */
export function findSalutationDeclensionError(salutationLine = '') {
  return a1GrammarChecker.findSalutationDeclensionError(salutationLine);
}
