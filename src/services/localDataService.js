import { seedData } from '../../src/data/exams/seedData.js';
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

function sanitizeQuestion(question) {
  const {
    correct_answer: _ca,
    clue_quote: _cq,
    explanation_ru: _eru,
    explanation_en: _een,
    explanation_de: _ede,
    vocabulary_notes: _vn,
    ...sanitized
  } = question;
  return sanitized;
}

export function getLocalExamDetails(examId) {
  const exam = seedData.exams.find(e => e.id === examId);
  if (!exam) {
    throw new Error(`Exam not found: ${examId}`);
  }
  const questions = seedData.questions
    .filter(q => q.exam_id === examId)
    .sort((a, b) => a.question_number - b.question_number)
    .map(sanitizeQuestion);

  return {
    exam: {
      ...exam,
      test_type: exam.test_type || 'lesen'
    },
    questions
  };
}

/**
 * The grading engine and the lexicon stay out of the main bundle: they are needed only on submit. The exam
 * screen preloads them so the chunk is in the service worker cache before the user may go offline.
 */
function importLocalGrading(isSchreiben = true) {
  if (!isSchreiben) {
    return Promise.all([
      null,
      import('../../src/services/evaluation/examEvaluator.js'),
      null,
    ]);
  }
  return Promise.all([
    import('./schreiben/linguistic/a1LexiconService.js'),
    import('../../src/services/evaluation/examEvaluator.js'),
    import('./schreiben/grading/essayGrader.js'),
  ]);
}

export async function preloadLocalGrading(testType = 'schreiben') {
  if (testType !== 'schreiben') return;
  const [{ loadLexiconData }] = await importLocalGrading(true);
  await loadLexiconData();
}

/**
 * Grades in the browser (static hosting, offline). Schreiben answers read the lexicon data, loaded first;
 * the letter is graded by the Micro-Ranker in the grading worker whenever it is available.
 * onProgress receives the letter grading's progress ({ stage, fraction, loadedBytes? }, GRADING_STAGES).
 */
export async function submitLocalExamAnswers(examId, { answers = {}, timeSpentSeconds = 0, onProgress = null } = {}) {
  const exam = seedData.exams.find(e => e.id === examId);
  if (!exam) {
    throw new Error(`Exam not found: ${examId}`);
  }
  const isSchreiben = (exam.test_type || 'lesen') === 'schreiben';
  const [lexiconModule, { evaluateExamSubmission }, essayGraderModule] = await importLocalGrading(isSchreiben);
  if (isSchreiben && lexiconModule?.loadLexiconData) {
    await lexiconModule.loadLexiconData();
  }
  const questions = seedData.questions
    .filter(q => q.exam_id === examId)
    .sort((a, b) => a.question_number - b.question_number);

  const gradeEssay = isSchreiben && essayGraderModule?.gradeEssayWithActiveProvider
    ? (input) => essayGraderModule.gradeEssayWithActiveProvider({ ...input, onProgress })
    : () => ({ is_correct: false, points_earned: 0, max_points: 0 });

  const { score, reviewItems, teilBreakdown } = await evaluateExamSubmission(questions, answers, {
    gradeEssay,
  });
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
