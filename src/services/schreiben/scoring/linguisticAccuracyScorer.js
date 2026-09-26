/**
 * Linguistic Accuracy Scorer (Sprachliche Genauigkeit / A1 -> A2 Transition).
 * Calculates pedagogical language correctness (0–10) based on grammar and syntax defects.
 * Strictly adheres to McConnell limits (<= 65 lines, <= 25 lines per function).
 * Zero interference with official telc A1 regulation points.
 */

const DEFAULT_PENALTY_PER_ERROR = 1.0;
const MINOR_PENALTY = 0.5;

function resolveErrorPenalty(error = {}) {
  const code = String(error.code || error.ruleId || '').toLowerCase();
  const severity = String(error.severity || '').toLowerCase();
  if (severity === 'minor' || severity === 'low' || code.includes('minor') || code.includes('typo')) {
    return MINOR_PENALTY;
  }
  return DEFAULT_PENALTY_PER_ERROR;
}

function resolveAccuracyBand(score = 0) {
  if (score >= 9.0) return { band: 'excellent', ru: 'Отличная точность (готов к A2)', de: 'Sehr gut (bereit für A2)' };
  if (score >= 7.0) return { band: 'good', ru: 'Хорошая точность, мелкие недочеты', de: 'Gut mit leichten Mängeln' };
  if (score >= 5.0) return { band: 'satisfactory', ru: 'Удовлетворительно, частые дефекты', de: 'Befriedigend' };
  return { band: 'needs_practice', ru: 'Требуется тренировка грамматики', de: 'Übungsbedarf' };
}

/**
 * @param {{ grammarErrors?: Array, wordCount?: number, isGibberish?: boolean }} params
 * @returns {{ score: number, maxScore: number, errorCount: number, percentage: number, band: string, bandRu: string, bandDe: string }}
 */
export function calculateLinguisticAccuracy({ grammarErrors = [], wordCount = 0, isGibberish = false } = {}) {
  if (isGibberish || wordCount === 0) {
    return { score: 0, maxScore: 10, errorCount: 0, percentage: 0, band: 'needs_practice', bandRu: 'Текст не распознан', bandDe: 'Nicht bewertbar' };
  }

  const errors = Array.isArray(grammarErrors) ? grammarErrors : [];
  const totalPenalty = errors.reduce((sum, err) => sum + resolveErrorPenalty(err), 0);
  const rawScore = Math.max(0, 10 - totalPenalty);
  const score = Number(rawScore.toFixed(1));
  const percentage = Math.round((score / 10) * 100);
  const { band, ru: bandRu, de: bandDe } = resolveAccuracyBand(score);

  return {
    score,
    maxScore: 10,
    errorCount: errors.length,
    percentage,
    band,
    bandRu,
    bandDe,
  };
}
