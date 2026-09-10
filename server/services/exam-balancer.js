import { filterLeastAttemptedExams, pickRandomExam } from '../../shared/examBalancerCore.js';
import { AttemptRepository } from '../repositories/attempt.repository.js';
import { ExamRepository } from '../repositories/exam.repository.js';

export { filterLeastAttemptedExams, pickRandomExam };

export function selectBalancedRandomExam({ db, examRepository, attemptRepository, userId, testType = 'lesen' }) {
  const resolvedExamRepo = examRepository || new ExamRepository(db);
  const resolvedAttemptRepo = attemptRepository || new AttemptRepository(db);

  const exams = resolvedExamRepo.findExamsByTestType(testType);
  if (exams.length === 0) return null;

  const examIds = exams.map(exam => exam.id);
  const { counts, lastExamId } = resolvedAttemptRepo.fetchUserExamStats(userId, examIds);
  const candidates = filterLeastAttemptedExams(exams, counts, lastExamId);
  const selectedExam = pickRandomExam(candidates);

  return {
    exam: selectedExam,
    candidatePoolSize: candidates.length,
    totalAvailable: exams.length,
    userAttemptsForExam: counts[selectedExam?.id] || 0
  };
}
