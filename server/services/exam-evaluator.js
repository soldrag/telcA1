function parseJsonSafely(jsonString, fallbackValue) {
  if (!jsonString) return fallbackValue;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
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

export function evaluateExamSubmission(questions = [], answers = {}) {
  let score = 0;
  const teilBreakdown = createEmptyBreakdown();

  const reviewItems = questions.map((question) => {
    const item = gradeQuestion(question, answers);
    if (item.is_correct) score++;

    if (teilBreakdown[question.teil]) {
      teilBreakdown[question.teil].total++;
      if (item.is_correct) teilBreakdown[question.teil].score++;
    }
    return item;
  });

  return { score, reviewItems, teilBreakdown };
}
