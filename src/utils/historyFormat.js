/**
 * Pure formatting and aggregation utilities for attempt history.
 */

export function cleanExamTitle(title = '') {
  if (!title) return 'Modellsatz';
  return String(title).replace('telc Deutsch A1 — ', '');
}

export function formatAttemptDuration(seconds = 0) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSecs = safeSeconds % 60;
  return { minutes, seconds: remainingSecs };
}

export function formatAttemptDate(isoString, lang = 'ru') {
  if (!isoString) return '';
  const dateValue = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
  const locale = lang === 'en' ? 'en-US' : 'ru-RU';
  return new Date(dateValue).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAttemptDateShort(isoString, lang = 'ru') {
  if (!isoString) return '';
  const dateValue = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
  const locale = lang === 'en' ? 'en-US' : 'ru-RU';
  return new Date(dateValue).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function pluralizeAttempts(count = 0, lang = 'en') {
  const safeCount = Math.max(0, count || 0);
  return `${safeCount} ${safeCount === 1 ? 'attempt' : 'attempts'}`;
}

export function calculateHistoryStats(attempts = []) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return { count: 0, passRate: 0, avgScore: 0, avgMinutes: 0 };
  }

  const count = attempts.length;
  const passedCount = attempts.filter((attempt) => attempt.passed).length;
  const passRate = Math.round((passedCount / count) * 100);

  const totalPercentage = attempts.reduce(
    (totalScore, attemptRecord) => totalScore + (attemptRecord.percentage || 0),
    0
  );
  const avgScore = Math.round(totalPercentage / count);

  const totalTimeSeconds = attempts.reduce(
    (accumulatedSeconds, attemptRecord) => accumulatedSeconds + (attemptRecord.time_spent_seconds || 0),
    0
  );
  const avgMinutes = Math.round(totalTimeSeconds / count / 60);

  return { count, passRate, avgScore, avgMinutes };
}
