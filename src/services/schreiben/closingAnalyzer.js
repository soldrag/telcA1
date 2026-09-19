import { evaluateClosing } from './analyzers/communicationRegister.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';
import { DIAGNOSTIC_CODES } from './feedback/feedbackContracts.js';

export function analyzeClosing(text = '', options = {}) {
  const trimmed = (text || '').trim();
  const macro = segmentMacroStructure(trimmed, { isFormalRequired: options.isFormal !== false });

  let res;
  if (macro.closing && macro.closing.recognized) {
    res = {
      score: macro.closing.score,
      maxScore: 2,
      recognized: true,
      text: macro.closing.text,
      senderName: macro.closing.senderName,
      hasName: macro.closing.hasName,
      feedback: macro.closing.hasName ? 'Grußformel mit Absendernamen vorhanden.' : 'Grußformel vorhanden, aber Absendername fehlt.'
    };
  } else {
    res = evaluateClosing(text, { isFormalRequired: options.isFormal !== false });
  }

  let grammarNote = null;
  if (/mit\s+freundlichen\s+gru(?:ß|ss)/i.test(res.text)) {
    grammarNote = 'Dativ-Hinweis: Es heißt „Mit freundlichem Gruß“ oder „Mit freundlichen Grüßen“.';
  } else if (/,\s*$/m.test(res.text) || /\b(liebe\s+grüße|mit\s+freundlichen\s+grüßen|viele\s+grüße|herzliche\s+grüße|schöne\s+grüße),/i.test(text)) {
    grammarNote = 'Zeichensetzung: Im Deutschen steht nach Grußformeln kein Komma (anders als im Englischen).';
  }

  const score = Number(res.score ?? 0);
  const diagnosticCode = score >= 2
    ? DIAGNOSTIC_CODES.GRUSS_PERFECT
    : (score === 1 ? DIAGNOSTIC_CODES.GRUSS_INCOMPLETE : DIAGNOSTIC_CODES.GRUSS_MISSING);

  return {
    ...res,
    grammarNote,
    diagnosticCode,
    recognized: res.score > 0
  };
}
