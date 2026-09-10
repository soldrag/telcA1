/**
 * Filters candidates with strictly minimum attempts count and avoids repeating the last exam if possible.
 */
export function filterLeastAttemptedExams(exams, countsByExamId = {}, lastExamId = null) {
  if (!exams || exams.length === 0) return [];
  if (exams.length === 1) return exams;

  const examsWithCounts = exams.map(exam => ({
    exam,
    count: countsByExamId[exam.id] || 0
  }));

  const minCount = Math.min(...examsWithCounts.map(item => item.count));
  let candidates = examsWithCounts
    .filter(item => item.count === minCount)
    .map(item => item.exam);

  if (candidates.length > 1 && lastExamId) {
    const withoutLast = candidates.filter(exam => exam.id !== lastExamId);
    if (withoutLast.length > 0) {
      candidates = withoutLast;
    }
  }

  return candidates;
}

/**
 * Randomly selects one candidate from a pool.
 */
export function pickRandomExam(candidates) {
  if (!candidates || candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Selects next balanced random exam based on storage stats.
 */
export async function getNextBalancedExam({ exams, storage, testType = 'lesen' }) {
  if (!exams || exams.length === 0) return null;
  const counts = await storage.getExamAttemptCounts(testType);
  const lastAttempt = await storage.getLastAttempt(testType);
  const candidates = filterLeastAttemptedExams(exams, counts, lastAttempt?.exam_id || null);
  const selected = pickRandomExam(candidates);
  return selected || exams[0];
}
