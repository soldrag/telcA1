/**
 * telc A1 grammar checker: the level-independent orchestrator bound to the A1 grammar profile.
 */
import { createGrammarChecker } from './linguistic/grammarCheckOrchestrator.js';
import { A1_GRAMMAR_PROFILE } from './profiles/a1GrammarProfile.js';

const a1GrammarChecker = createGrammarChecker(A1_GRAMMAR_PROFILE);

/** @returns {Array<{ original: string, correction: string, category: string, code?: string, explanation: string }>} */
export function checkGermanA1Grammar(text = '') {
  return a1GrammarChecker.checkLetter(text);
}

/** @returns {object|null} the declension error of a salutation line ("Sehr geehrte Herr"), if any */
export function findSalutationDeclensionError(salutationLine = '') {
  return a1GrammarChecker.findSalutationDeclensionError(salutationLine);
}
