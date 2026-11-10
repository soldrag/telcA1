import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { requireLevelPort } from './grading/levelPorts.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveSalutationDiagnostic({ score = 0, error = null, register = 'none', atypicalFormula = false }) {
  if (score <= 0) return DIAGNOSTIC_CODES.ANREDE_MISSING;
  if (error) return DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW;
  if (score >= 2) return DIAGNOSTIC_CODES.ANREDE_PERFECT;
  if (atypicalFormula) return DIAGNOSTIC_CODES.ANREDE_ATYPICAL_FORMULA;
  // Only a formula that does not fit the task's register scores 1: too formal for a friend, or too informal otherwise.
  return register === 'formal' ? DIAGNOSTIC_CODES.ANREDE_TOO_FORMAL : DIAGNOSTIC_CODES.ANREDE_REGISTER_MISMATCH;
}

/**
 * A declension slip in an appropriate formula keeps the score (reglament §6 Teil 2) and is reported as a hint.
 * @param {string} text
 * @param {{ isFormal?: boolean, grammar: object }} options - grammar: the level's grammar checker
 */
export function analyzeSalutation(text = '', options = {}) {
  const grammar = requireLevelPort(options.grammar, 'analyzeSalutation: grammar');
  const trimmed = (text || '').trim();
  const isFormalRequired = options.isFormal !== false;
  const { anrede } = segmentMacroStructure(trimmed, { isFormalRequired });
  if (!anrede.recognized) {
    return { score: 0, recognized: false, text: '', diagnosticCode: DIAGNOSTIC_CODES.ANREDE_MISSING, correction: null, error: null };
  }

  const error = grammar.findSalutationDeclensionError(anrede.text);
  return {
    score: anrede.score,
    recognized: true,
    text: anrede.text,
    diagnosticCode: resolveSalutationDiagnostic({ score: anrede.score, error, register: anrede.register, atypicalFormula: anrede.atypicalFormula }),
    correction: error?.correction || null,
    error,
  };
}
