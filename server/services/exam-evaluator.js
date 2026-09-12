import { matchTextAnswer, evaluateEssay } from './schreiben-evaluator.js';

function parseJsonSafely(jsonString, fallbackValue) {
  if (!jsonString) return fallbackValue;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallbackValue;
  }
}

function createEmptyBreakdown() {
  return {
    1: { score: 0, total: 0 },
    2: { score: 0, total: 0 },
    3: { score: 0, total: 0 },
  };
}

function determineQuestionGrading(question, userAnswer, parsedOptions) {
  const isEssay = parsedOptions?.type === 'essay' || (question.teil === 2 && question.exam_id?.includes('schreiben'));
  if (isEssay) {
    return evaluateEssay(userAnswer, question);
  }

  const isChoice = Array.isArray(parsedOptions) && parsedOptions.length > 0;
  const isBinary = question.correct_answer === 'richtig' || question.correct_answer === 'falsch';

  if (!isChoice && !isBinary) {
    const isCorrect = matchTextAnswer(userAnswer, question);
    return { is_correct: isCorrect, points_earned: isCorrect ? 1 : 0, max_points: 1 };
  }

  const isCorrect = userAnswer !== '' && userAnswer === (question.correct_answer || '').trim().toLowerCase();
  return { is_correct: isCorrect, points_earned: isCorrect ? 1 : 0, max_points: 1 };
}

export function gradeQuestion(question, answers = {}) {
  const userAnswer = (answers[question.id] || '').trim();
  const parsedOptions = parseJsonSafely(question.options_json, null);
  const grading = determineQuestionGrading(question, userAnswer, parsedOptions);

  return {
    id: question.id,
    teil: question.teil,
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
    clue_quote: question.clue_quote,
    explanation_ru: question.explanation_ru,
    explanation_en: question.explanation_en,
    explanation_de: question.explanation_de,
    vocabulary_notes: parseJsonSafely(question.vocabulary_notes, []),
  };
}

export function evaluateExamSubmission(questions = [], answers = {}) {
  let score = 0;
  const teilBreakdown = createEmptyBreakdown();

  const reviewItems = questions.map((question) => {
    const item = gradeQuestion(question, answers);
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
