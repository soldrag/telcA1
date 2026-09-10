/**
 * Exam submission evaluation and grading business logic.
 */

export function gradeQuestion(question, answers = {}) {
  const userAnswer = (answers[question.id] || '').trim().toLowerCase();
  const correctAnswer = (question.correct_answer || '').trim().toLowerCase();
  const isCorrect = userAnswer !== '' && userAnswer === correctAnswer;

  return {
    id: question.id,
    teil: question.teil,
    question_number: question.question_number,
    title: question.title,
    situation: question.situation,
    context_header: question.context_header,
    context_body: question.context_body,
    options_json: parseJsonSafely(question.options_json, null),
    statement: question.statement,
    user_answer: userAnswer || null,
    correct_answer: correctAnswer,
    is_correct: isCorrect,
    clue_quote: question.clue_quote,
    explanation_ru: question.explanation_ru,
    explanation_de: question.explanation_de,
    vocabulary_notes: parseJsonSafely(question.vocabulary_notes, []),
  };
}

function parseJsonSafely(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createEmptyBreakdown() {
  return {
    1: { score: 0, total: 0 },
    2: { score: 0, total: 0 },
    3: { score: 0, total: 0 },
  };
}

export function evaluateExamSubmission(questions = [], answers = {}) {
  let score = 0;
  const teilBreakdown = createEmptyBreakdown();

  const reviewItems = questions.map((q) => {
    const item = gradeQuestion(q, answers);
    if (item.is_correct) score++;

    if (teilBreakdown[q.teil]) {
      teilBreakdown[q.teil].total++;
      if (item.is_correct) teilBreakdown[q.teil].score++;
    }
    return item;
  });

  return { score, reviewItems, teilBreakdown };
}
