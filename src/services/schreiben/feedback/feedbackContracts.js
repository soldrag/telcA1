/**
 * Canonical Diagnostic Codes and Contract for Schreiben Criteria Tutor Feedback.
 * Clean Architecture & McConnell limits: <= 60 lines, immutable frozen constants.
 */

export const DIAGNOSTIC_CODES = Object.freeze({
  LP_FULFILLED: 'LP_FULFILLED',
  LP_PARTIAL: 'LP_PARTIAL',
  LP_MISSING: 'LP_MISSING',
  LP_INVERTED_DEFECT: 'LP_INVERTED_DEFECT',
  LP_INVERTED_REQUEST: 'LP_INVERTED_REQUEST',
  LP_INVERTED_CANCEL: 'LP_INVERTED_CANCEL',
  LP_INVERTED_GENERAL: 'LP_INVERTED_GENERAL',
  LP_FRAME_VIOLATION: 'LP_FRAME_VIOLATION',

  ANREDE_PERFECT: 'ANREDE_PERFECT',
  ANREDE_MINOR_FLAW: 'ANREDE_MINOR_FLAW',
  ANREDE_MISSING: 'ANREDE_MISSING',

  GRUSS_PERFECT: 'GRUSS_PERFECT',
  GRUSS_INCOMPLETE: 'GRUSS_INCOMPLETE',
  GRUSS_MISSING: 'GRUSS_MISSING',
});

export const DIAGNOSTIC_STATUSES = Object.freeze({
  FULFILLED: 'fulfilled',
  PARTIAL: 'partial',
  MISSING: 'missing',
  INVERTED: 'inverted',
  FRAME_VIOLATION: 'frame_violation',
});

export function resolveLpDiagnosticCode(score = 0, inversion = {}, frameValid = true) {
  if (inversion?.isInverted) {
    if (inversion.reason === 'inverted_problem') return DIAGNOSTIC_CODES.LP_INVERTED_DEFECT;
    if (['negated_entity', 'negated_action'].includes(inversion.reason)) {
      return DIAGNOSTIC_CODES.LP_INVERTED_REQUEST;
    }
    return DIAGNOSTIC_CODES.LP_INVERTED_GENERAL;
  }
  if (!frameValid) return DIAGNOSTIC_CODES.LP_FRAME_VIOLATION;
  if (score >= 2) return DIAGNOSTIC_CODES.LP_FULFILLED;
  if (score === 1) return DIAGNOSTIC_CODES.LP_PARTIAL;
  return DIAGNOSTIC_CODES.LP_MISSING;
}
