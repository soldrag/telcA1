import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveClosingDiagnostic({ score, hasName, register }) {
  if (score >= 2) return hasName ? DIAGNOSTIC_CODES.GRUSS_PERFECT : DIAGNOSTIC_CODES.GRUSS_NO_SENDER_NAME;
  if (score !== 1) return DIAGNOSTIC_CODES.GRUSS_MISSING;
  return register === 'formal' ? DIAGNOSTIC_CODES.GRUSS_TOO_FORMAL : DIAGNOSTIC_CODES.GRUSS_INCOMPLETE;
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
    diagnosticCode: resolveClosingDiagnostic(closing),
  };
}
