/**
 * Stage 1: Anrede & Gruß scores.
 * Takes the salutation and closing ratings of stage 0 as they are; the diagnostic codes come with them.
 */

export function runStage1Scoring({ salutation = {}, closing = {} } = {}) {
  const anrede = {
    score: salutation.score ?? 0,
    recognized: Boolean(salutation.recognized),
    text: salutation.text || '',
    diagnosticCode: salutation.diagnosticCode,
    correction: salutation.correction || null,
  };
  const gruss = {
    score: closing.score ?? 0,
    recognized: Boolean(closing.recognized),
    text: closing.text || '',
    senderName: closing.senderName || '',
    hasName: Boolean(closing.hasName),
    diagnosticCode: closing.diagnosticCode,
  };
  return { anredeScore: anrede.score, grussScore: gruss.score, anrede, gruss };
}
