import { filterLeastAttemptedExams, pickRandomExam } from '../../shared/examBalancerCore.js';

export { filterLeastAttemptedExams, pickRandomExam };

export async function getNextBalancedExam({ exams = [], storage, testType = 'lesen' } = {}) {
  if (!exams || exams.length === 0) return null;
  const examCounts = await storage.getExamAttemptCounts(testType);
  const lastAttempt = await storage.getLastAttempt(testType);
  const candidates = filterLeastAttemptedExams(exams, examCounts, lastAttempt?.exam_id || null);
  const selectedExam = pickRandomExam(candidates);
  return selectedExam || exams[0];
}
