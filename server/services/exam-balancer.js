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

export function pickRandomExam(candidates) {
  if (!candidates || candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

function fetchUserExamStats(db, userId, examIds) {
  const placeholders = examIds.map(() => '?').join(',');
  const countRows = db.prepare(`
    SELECT exam_id, COUNT(*) as count 
    FROM attempts 
    WHERE user_id = ? AND exam_id IN (${placeholders})
    GROUP BY exam_id
  `).all(userId, ...examIds);

  const counts = {};
  for (const row of countRows) {
    counts[row.exam_id] = Number(row.count);
  }

  const lastAttempt = db.prepare(`
    SELECT exam_id 
    FROM attempts 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `).get(userId);

  return {
    counts,
    lastExamId: lastAttempt?.exam_id || null
  };
}

export function selectBalancedRandomExam({ db, userId, testType = 'lesen' }) {
  const exams = db.prepare(`
    SELECT * FROM exams 
    WHERE test_type = ? 
    ORDER BY sort_order ASC, id ASC
  `).all(testType);

  if (exams.length === 0) return null;

  const examIds = exams.map(e => e.id);
  const { counts, lastExamId } = fetchUserExamStats(db, userId, examIds);
  const candidates = filterLeastAttemptedExams(exams, counts, lastExamId);
  const selected = pickRandomExam(candidates);

  return {
    exam: selected,
    candidatePoolSize: candidates.length,
    totalAvailable: exams.length,
    userAttemptsForExam: counts[selected?.id] || 0
  };
}
