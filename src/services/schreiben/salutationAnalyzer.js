import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { requireLevelPort } from './grading/levelPorts.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveSalutationDiagnostic({ score = 0, error = null, isRegisterMismatch = false }) {
  if (score <= 0) return DIAGNOSTIC_CODES.ANREDE_MISSING;
  if (error) return DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW;
  if (score >= 2) return DIAGNOSTIC_CODES.ANREDE_PERFECT;
  if (isRegisterMismatch) return DIAGNOSTIC_CODES.ANREDE_REGISTER_MISMATCH;
  return DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW;
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
  const isRegisterMismatch = anrede.register === 'informal' && isFormalRequired;
  return {
    score: anrede.score,
    recognized: true,
    text: anrede.text,
    diagnosticCode: resolveSalutationDiagnostic({ score: anrede.score, error, isRegisterMismatch }),
    correction: error?.correction || null,
    error,
  };
}
