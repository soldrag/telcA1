import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveClosingDiagnostic(score) {
  if (score >= 2) return DIAGNOSTIC_CODES.GRUSS_PERFECT;
  return score === 1 ? DIAGNOSTIC_CODES.GRUSS_INCOMPLETE : DIAGNOSTIC_CODES.GRUSS_MISSING;
}

/** Grammar and spelling inside the closing formula are grammar hints (closingFormula letter rule), not part of this rating. */
export function analyzeClosing(text = '', options = {}) {
  const { closing } = segmentMacroStructure((text || '').trim(), { isFormalRequired: options.isFormal !== false });
  if (!closing.recognized) {
    return { score: 0, maxScore: 2, recognized: false, text: '', senderName: '', hasName: false, feedback: 'Fehlende Grußformel am Ende des Schreibens.', diagnosticCode: DIAGNOSTIC_CODES.GRUSS_MISSING };
  }
  return {
    score: closing.score,
    maxScore: 2,
    recognized: true,
    text: closing.text,
    senderName: closing.senderName,
    hasName: closing.hasName,
    feedback: closing.hasName ? 'Grußformel mit Absendernamen vorhanden.' : 'Grußformel vorhanden, aber Absendername fehlt.',
    diagnosticCode: resolveClosingDiagnostic(closing.score),
  };
}
