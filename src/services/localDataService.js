import { seedData } from '../../server/seed-data.js';
import { evaluateExamSubmission } from '../../server/services/exam-evaluator.js';
import { TEST_TYPES, getTestTypeById } from '../../shared/testTypes.js';

export function getLocalTestTypes() {
  const testTypes = TEST_TYPES.map((type) => {
    const count = seedData.exams.filter(e => (e.test_type || 'lesen') === type.id).length;
    return {
      ...type,
      variantsCount: count > 0 ? count : (type.variantsCount ?? 0)
    };
  });
  return { testTypes };
}

export function getLocalExams(testType = 'lesen') {
  const exams = seedData.exams
    .filter(exam => (exam.test_type || 'lesen') === testType)
    .sort((a, b) => (a.sort_order || 1) - (b.sort_order || 1));
  return { exams };
}

export function getLocalExamDetails(examId) {
  const exam = seedData.exams.find(e => e.id === examId);
  if (!exam) {
    throw new Error(`Exam not found: ${examId}`);
  }
  const questions = seedData.questions
    .filter(q => q.exam_id === examId)
    .sort((a, b) => a.question_number - b.question_number);

  return {
    exam: {
      ...exam,
      test_type: exam.test_type || 'lesen'
    },
    questions
  };
}

export function submitLocalExamAnswers(examId, { answers = {}, timeSpentSeconds = 0 } = {}) {
  const exam = seedData.exams.find(e => e.id === examId);
  if (!exam) {
    throw new Error(`Exam not found: ${examId}`);
  }
  const questions = seedData.questions
    .filter(q => q.exam_id === examId)
    .sort((a, b) => a.question_number - b.question_number);

  const { score, reviewItems, teilBreakdown } = evaluateExamSubmission(questions, answers);
  const totalQuestions = questions.length;
  const maxScore = exam.max_score || getTestTypeById(exam.test_type || 'lesen').maxScore;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0;
  const passed = score >= exam.pass_score;

  const attemptId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    attemptId,
    exam: {
      ...exam,
      test_type: exam.test_type || 'lesen'
    },
    score,
    totalQuestions,
    maxScore,
    percentage,
    passed,
    teilBreakdown,
    reviewItems,
    timeSpentSeconds,
    passScore: exam.pass_score,
  };
}
