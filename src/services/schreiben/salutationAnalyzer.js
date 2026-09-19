import { evaluateSalutation } from './analyzers/communicationRegister.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

export function analyzeSalutation(text = '', options = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { score: 0, maxScore: 2, recognized: false, text: '', feedback: 'Keine Anrede gefunden.', diagnosticCode: DIAGNOSTIC_CODES.ANREDE_MISSING };
  }

  const macro = segmentMacroStructure(trimmed, { isFormalRequired: options.isFormal !== false });
  if (macro.anrede && macro.anrede.recognized) {
    const score = macro.anrede.score;
    const feedback = score >= 2
      ? 'Die Anrede ist passend und formal korrekt.'
      : (macro.anrede.error
        ? `Anrede erkannt, aber Deklinationsfehler: korrekt wäre „${macro.anrede.error.correction}“.`
        : 'Die Anrede ist vorhanden, weist jedoch stilistische oder formale Mängel auf.');

    return {
      score,
      maxScore: 2,
      recognized: true,
      text: macro.anrede.text,
      feedback,
      diagnosticCode: score >= 2 ? DIAGNOSTIC_CODES.ANREDE_PERFECT : DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW,
      error: macro.anrede.error || null
    };
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';

  let res = evaluateSalutation(firstLine, { isFormalRequired: options.isFormal !== false });
  if (!res.recognized) {
    const commaMatch = trimmed.match(/^([^,\n]+,)/);
    if (commaMatch) {
      const clause = commaMatch[1].trim();
      const clauseRes = evaluateSalutation(clause, { isFormalRequired: options.isFormal !== false });
      if (clauseRes.recognized) {
        res = clauseRes;
      }
    }
  }

  const finalScore = res.score ?? 0;
  const diagnosticCode = finalScore >= 2
    ? DIAGNOSTIC_CODES.ANREDE_PERFECT
    : (finalScore === 1 ? DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW : DIAGNOSTIC_CODES.ANREDE_MISSING);

  return {
    ...res,
    diagnosticCode
  };
}
