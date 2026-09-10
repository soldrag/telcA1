export function filterLeastAttemptedExams(exams = [], countsByExamId = {}, lastExamId = null) {
  if (!exams || exams.length === 0) return [];
  if (exams.length === 1) return exams;

  const examsWithCounts = exams.map(exam => ({
    exam,
    count: countsByExamId[exam.id] || 0
  }));

  const minCount = Math.min(...examsWithCounts.map(entry => entry.count));
  let candidates = examsWithCounts
    .filter(entry => entry.count === minCount)
    .map(entry => entry.exam);

  if (candidates.length > 1 && lastExamId) {
    const withoutLast = candidates.filter(candidateExam => candidateExam.id !== lastExamId);
    if (withoutLast.length > 0) {
      candidates = withoutLast;
    }
  }

  return candidates;
}

export function pickRandomExam(candidates = []) {
  if (!candidates || candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
