import { getTestTypeById } from '../../shared/testTypes.js';

function isBetter(candidate, current) {
  return !current || candidate.score > current.score;
}

// Scores are points against the module maximum (Schreiben: 15 points over 6 tasks), never the task count.
export function getAttemptMaxScore(attempt = {}) {
  return getTestTypeById(attempt.test_type || 'lesen').maxScore;
}

function toScore(attempt) {
  return { score: Number(attempt.score) || 0, total: getAttemptMaxScore(attempt) };
}

/**
 * Best score per exam variant for one module, plus the module-wide best and attempt count.
 * activityByExamId: how often each variant was taken and when last, for the variant cards.
 */
export function summarizeVariantScores(attempts = [], testType = 'lesen') {
  const moduleAttempts = attempts.filter((attempt) => (attempt.test_type || 'lesen') === testType);
  const bestByExamId = {};
  const activityByExamId = {};
  let best = null;

  moduleAttempts.forEach((attempt) => {
    const score = toScore(attempt);
    if (isBetter(score, bestByExamId[attempt.exam_id])) bestByExamId[attempt.exam_id] = score;
    if (isBetter(score, best)) best = score;
    const activity = activityByExamId[attempt.exam_id] || { count: 0, lastAt: '' };
    const createdAt = String(attempt.created_at || '');
    activityByExamId[attempt.exam_id] = { count: activity.count + 1, lastAt: createdAt > activity.lastAt ? createdAt : activity.lastAt };
  });

  return { bestByExamId, activityByExamId, best, attemptsCount: moduleAttempts.length };
}
