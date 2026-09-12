import { evaluateSalutation } from './analyzers/communicationRegister.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';

export function analyzeSalutation(text = '', options = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { score: 0, maxScore: 2, recognized: false, text: '', feedback: 'Keine Anrede gefunden.' };
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

  return res;
}
