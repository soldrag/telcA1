import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveClosingDiagnostic(score, hasName) {
  if (score >= 2) return hasName ? DIAGNOSTIC_CODES.GRUSS_PERFECT : DIAGNOSTIC_CODES.GRUSS_NO_SENDER_NAME;
  return score === 1 ? DIAGNOSTIC_CODES.GRUSS_INCOMPLETE : DIAGNOSTIC_CODES.GRUSS_MISSING;
}

/** Grammar and spelling inside the closing formula are grammar hints (closingFormula letter rule), not part of this rating. */
export function analyzeClosing(text = '', options = {}) {
  const { closing } = segmentMacroStructure((text || '').trim(), { isFormalRequired: options.isFormal !== false });
  if (!closing.recognized) {
    return { score: 0, recognized: false, text: '', senderName: '', hasName: false, diagnosticCode: DIAGNOSTIC_CODES.GRUSS_MISSING };
  }
  return {
    score: closing.score,
    recognized: true,
    text: closing.text,
    senderName: closing.senderName,
    hasName: closing.hasName,
    diagnosticCode: resolveClosingDiagnostic(closing.score, closing.hasName),
  };
}
