/**
 * Stage 1: Anrede & Gruß Scoring (Deterministic, Zero LLM).
 * Evaluates salutation and closing formulas using verified telc A1 rules/regex.
 */

import { DIAGNOSTIC_CODES } from '../feedback/feedbackContracts.js';

export function scoreSalutation(salutation = {}) {
  const score = Number(salutation?.score ?? 0);
  const recognized = Boolean(salutation?.recognized);
  const diagnosticCode = score >= 2
    ? DIAGNOSTIC_CODES.ANREDE_PERFECT
    : (score === 1 ? DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW : DIAGNOSTIC_CODES.ANREDE_MISSING);

  const feedback = salutation?.feedback || (score >= 2
    ? 'Die Anrede ist passend und formal korrekt.'
    : (score === 1
      ? 'Die Anrede ist vorhanden, weist jedoch kleinere Mängel auf.'
      : 'Es fehlt eine passende Anrede zu Beginn des Briefes.'));

  return {
    score: Math.min(2, Math.max(0, score)),
    recognized,
    text: salutation?.text || '',
    feedback,
    diagnosticCode
  };
}

export function scoreClosing(closing = {}) {
  const score = Number(closing?.score ?? 0);
  const recognized = Boolean(closing?.recognized);
  const diagnosticCode = score >= 2
    ? DIAGNOSTIC_CODES.GRUSS_PERFECT
    : (score === 1 ? DIAGNOSTIC_CODES.GRUSS_INCOMPLETE : DIAGNOSTIC_CODES.GRUSS_MISSING);

  const feedback = closing?.feedback || (score >= 2
    ? 'Passende Grußformel und Name am Schluss vorhanden.'
    : (score === 1
      ? 'Die Grußformel oder der Name am Schluss ist unvollständig.'
      : 'Es fehlt eine Grußformel oder ein Name am Ende des Briefes.'));

  return {
    score: Math.min(2, Math.max(0, score)),
    recognized,
    text: closing?.text || '',
    senderName: closing?.senderName || '',
    hasName: Boolean(closing?.hasName),
    grammarNote: closing?.grammarNote || null,
    feedback,
    diagnosticCode
  };
}

export function runStage1Scoring(stage0Result = {}) {
  const anrede = scoreSalutation(stage0Result.salutation);
  const gruss = scoreClosing(stage0Result.closing);

  return {
    anredeScore: anrede.score,
    grussScore: gruss.score,
    anrede,
    gruss
  };
}
