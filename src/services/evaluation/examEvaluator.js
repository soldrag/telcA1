import { evaluateTeil1Answer } from '../schreiben/schreibenTeil1Evaluator.js';

function parseJsonSafely(jsonString, fallbackValue) {
  if (!jsonString) return fallbackValue;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallbackValue;
  }
}

function createDynamicBreakdown(questions = []) {
  const teils = [...new Set(questions.map((q) => q.teil).filter(Boolean))].sort((a, b) => a - b);
  const breakdown = {};
  for (const t of (teils.length > 0 ? teils : [1, 2, 3])) {
    breakdown[t] = { score: 0, total: 0 };
  }
  return breakdown;
}

async function determineQuestionGrading(question, userAnswer, parsedOptions, gradeEssay) {
  const isEssay = parsedOptions?.type === 'essay' || question.question_type === 'essay';
  if (isEssay) {
    return gradeEssay({ userText: userAnswer, question });
  }

  const isChoice = Array.isArray(parsedOptions) && parsedOptions.length > 0;
  const isBinary = question.correct_answer === 'richtig' || question.correct_answer === 'falsch';

  if (!isChoice && !isBinary) {
    const isCorrect = evaluateTeil1Answer(userAnswer, question);
    return { is_correct: isCorrect, points_earned: isCorrect ? 1 : 0, max_points: 1 };
  }

  const isCorrect = userAnswer !== '' && userAnswer === (question.correct_answer || '').trim().toLowerCase();
  return { is_correct: isCorrect, points_earned: isCorrect ? 1 : 0, max_points: 1 };
}

/**
 * @param {{ gradeEssay: (input: { userText: string, question: object }) => Promise<object> }} ports - the letter
 *   grader (schreiben/grading/essayGrader.gradeEssayWithActiveProvider in the app)
 */
async function gradeQuestion(question, answers = {}, { gradeEssay } = {}) {
  const userAnswer = (answers[question.id] || '').trim();
  const parsedOptions = parseJsonSafely(question.options_json, null);
  const grading = await determineQuestionGrading(question, userAnswer, parsedOptions, gradeEssay);

  return {
    id: question.id,
    teil: question.teil,
    level: question.level,
    question_number: question.question_number,
    title: question.title,
    situation: question.situation,
    context_header: question.context_header,
    context_body: question.context_body,
    options_json: parsedOptions,
    statement: question.statement,
    user_answer: userAnswer || null,
    correct_answer: question.correct_answer,
    is_correct: grading.is_correct,
    points_earned: grading.points_earned,
    max_points: grading.max_points,
    word_count: grading.word_count,
    criteria_breakdown: grading.criteria_breakdown || null,
    examiner_feedback: grading.examiner_feedback || null,
    grammar_errors: grading.grammar_errors || [],
    diff_summary: grading.diff_summary || [],
    provider_id: grading.provider_id || null,
    grading_mode: grading.grading_mode || null,
    clue_quote: question.clue_quote,
    explanation_ru: question.explanation_ru,
    explanation_en: question.explanation_en,
    explanation_de: question.explanation_de,
    vocabulary_notes: parseJsonSafely(question.vocabulary_notes, []),
  };
}

/** @param {{ gradeEssay: Function }} ports - see gradeQuestion */
export async function evaluateExamSubmission(questions = [], answers = {}, ports = {}) {
  if (typeof ports.gradeEssay !== 'function') throw new Error('evaluateExamSubmission: gradeEssay port is required');
  let score = 0;
  const teilBreakdown = createDynamicBreakdown(questions);
  const gradedItems = [];
  for (const question of questions) gradedItems.push(await gradeQuestion(question, answers, ports));

  const reviewItems = gradedItems.map((item, index) => {
    const question = questions[index];
    const itemPoints = item.points_earned !== undefined ? item.points_earned : (item.is_correct ? 1 : 0);
    const itemMaxPoints = item.max_points !== undefined ? item.max_points : 1;

    score += itemPoints;

    if (teilBreakdown[question.teil]) {
      teilBreakdown[question.teil].total += itemMaxPoints;
      teilBreakdown[question.teil].score += itemPoints;
    }
    return item;
  });

  return { score, reviewItems, teilBreakdown };
}
