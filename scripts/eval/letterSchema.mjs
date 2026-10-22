/**
 * Shape of an evaluation letter (hidden and open sets alike).
 * expected: the examiner's verdict per telc A1 — Leitpunkt levels 0/1/2 (0 / 1.5 / 3 points)
 * and Kommunikative Gestaltung 0 / 0.5 / 1.
 */

export const TASK_IDS = Object.freeze(['s1-q6', 's2-q6', 's3-q6', 's4-q6', 's5-q6', 's6-q6', 's7-q6']);

export const CATEGORIES = Object.freeze([
  'complete',
  'paraphrase',
  'missing_point',
  'partial_point',
  'negation',
  'off_topic',
  'heavy_errors',
  'telegraphic',
  'frame_issue',
  'borderline',
]);

/** @returns {string[]} problems, named by index and field only (never quoting the letter) */
export function validateLetters(letters) {
  if (!Array.isArray(letters) || letters.length === 0) return ['expected a non-empty JSON array'];
  const problems = [];
  letters.forEach((l, i) => {
    if (!TASK_IDS.includes(l?.seedQuestionId)) problems.push(`#${i}: seedQuestionId must be one of ${TASK_IDS.join(', ')}`);
    if (!CATEGORIES.includes(l?.category)) problems.push(`#${i}: category must be one of ${CATEGORIES.join(', ')}`);
    if (typeof l?.text !== 'string' || l.text.trim().length < 15) problems.push(`#${i}: text must be the letter`);
    const lp = l?.expected?.lp;
    if (!Array.isArray(lp) || lp.length !== 3 || !lp.every((v) => [0, 1, 2].includes(v))) problems.push(`#${i}: expected.lp must be three levels of 0/1/2`);
    if (![0, 0.5, 1].includes(l?.expected?.kg)) problems.push(`#${i}: expected.kg must be 0, 0.5 or 1`);
  });
  return problems;
}

export function expectedTotal({ lp, kg }) {
  return lp.reduce((sum, level) => sum + [0, 1.5, 3][level], 0) + kg;
}
