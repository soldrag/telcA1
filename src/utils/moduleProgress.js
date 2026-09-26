import { getTestTypeById } from '../../shared/testTypes.js';
import { getAttemptMaxScore } from './attemptStats.js';

const TEIL_WINDOW = 5;
const CHART_WINDOW = 10;

function newestFirst(attempts) {
  return [...attempts].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

function averageTeil(teil, attempts) {
  const entries = attempts
    .map((attempt) => attempt.results?.teilBreakdown?.[teil])
    .filter((entry) => entry && Number(entry.total) > 0);
  if (entries.length === 0) return null;
  const score = entries.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / entries.length;
  const total = entries.reduce((sum, entry) => sum + Number(entry.total), 0) / entries.length;
  return { teil, score, total, ratio: score / total };
}

// A Teil is «weakest» only when it is really behind another one; equal Teile flag nothing.
function findWeakest(teils) {
  if (teils.length < 2) return null;
  const low = teils.reduce((min, entry) => (entry.ratio < min.ratio ? entry : min));
  const high = teils.reduce((max, entry) => (entry.ratio > max.ratio ? entry : max));
  return low.ratio < high.ratio ? low.teil : null;
}

/**
 * What to train next in one module: the average per Teil over the last attempts (the weakest one
 * flagged) and the latest totals, oldest first, for a small trend chart. Null without attempts.
 */
export function summarizeModuleProgress(attempts = [], testType = 'lesen') {
  const moduleAttempts = newestFirst(attempts.filter((attempt) => (attempt.test_type || 'lesen') === testType));
  if (moduleAttempts.length === 0) return null;

  const { partsCount = 3, passScore, maxScore } = getTestTypeById(testType);
  const recent = moduleAttempts.slice(0, TEIL_WINDOW);
  const teils = Array.from({ length: partsCount }, (_, i) => averageTeil(i + 1, recent)).filter(Boolean);
  const weakest = findWeakest(teils);
  const trend = moduleAttempts.slice(0, CHART_WINDOW).reverse()
    .map((attempt) => ({ id: attempt.id, score: Number(attempt.score) || 0, max: getAttemptMaxScore(attempt) }));

  return { teils, weakest, trend, window: recent.length, passRatio: passScore / maxScore };
}
