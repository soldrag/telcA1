import { evaluateSalutation } from './analyzers/communicationRegister.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

function resolveSalutationDiagnostic({ score = 0, error = null, isRegisterMismatch = false }) {
  if (score <= 0) return DIAGNOSTIC_CODES.ANREDE_MISSING;
  if (error) return DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW;
  if (score >= 2) return DIAGNOSTIC_CODES.ANREDE_PERFECT;
  if (isRegisterMismatch) return DIAGNOSTIC_CODES.ANREDE_REGISTER_MISMATCH;
  return DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW;
}

export function analyzeSalutation(text = '', options = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { score: 0, maxScore: 2, recognized: false, text: '', feedback: 'Keine Anrede gefunden.', diagnosticCode: DIAGNOSTIC_CODES.ANREDE_MISSING };
  }

  const isFormalRequired = options.isFormal !== false;
  const macro = segmentMacroStructure(trimmed, { isFormalRequired });
  if (macro.anrede && macro.anrede.recognized) {
    const score = macro.anrede.score;
    const error = macro.anrede.error || null;
    const isRegisterMismatch = macro.anrede.register === 'informal' && isFormalRequired;
    const diagnosticCode = resolveSalutationDiagnostic({ score, error, isRegisterMismatch });

    const feedback = error
      ? `Anrede passend, aber mit Deklinationsfehler: korrekt wäre „${error.correction}“.`
      : (score >= 2
        ? 'Die Anrede ist passend und formal korrekt.'
        : 'Die Anrede ist vorhanden, weist jedoch stilistische oder formale Mängel auf.');

    return {
      score,
      maxScore: 2,
      recognized: true,
      text: macro.anrede.text,
      feedback,
      diagnosticCode,
      correction: error?.correction || null,
      error
    };
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';

  let res = evaluateSalutation(firstLine, { isFormalRequired });
  if (!res.recognized) {
    const commaMatch = trimmed.match(/^([^,\n]+,)/);
    if (commaMatch) {
      const clause = commaMatch[1].trim();
      const clauseRes = evaluateSalutation(clause, { isFormalRequired });
      if (clauseRes.recognized) {
        res = clauseRes;
      }
    }
  }

  const finalScore = res.score ?? 0;
  const error = res.error || null;
  const isRegisterMismatch = Boolean(res.isRegisterMismatch);
  const diagnosticCode = resolveSalutationDiagnostic({ score: finalScore, error, isRegisterMismatch });

  return {
    ...res,
    diagnosticCode,
    correction: error?.correction || null
  };
}
