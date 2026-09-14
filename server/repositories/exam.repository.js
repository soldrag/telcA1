function parseQuestionOptions(question) {
  return {
    ...question,
    options_json: question.options_json ? JSON.parse(question.options_json) : null,
  };
}

export class ExamRepository {
  constructor(database) {
    this.database = database;
  }

  findExamsByTestType(testType = 'lesen') {
    return this.database.prepare(`
      SELECT * FROM exams 
      WHERE test_type = ?
      ORDER BY sort_order ASC, id ASC
    `).all(testType);
  }

  findExamById(examId) {
    return this.database.prepare('SELECT * FROM exams WHERE id = ?').get(examId);
  }

  findSanitizedQuestionsByExamId(examId, parseOptions = true) {
    const questions = this.database.prepare(`
      SELECT id, exam_id, teil, question_number, title, situation, 
             context_header, context_body, options_json, statement
      FROM questions 
      WHERE exam_id = ? 
      ORDER BY question_number ASC
    `).all(examId);

    return parseOptions ? questions.map(parseQuestionOptions) : questions;
  }

  findQuestionsByExamId(examId, parseOptions = true) {
    const questions = this.database.prepare(`
      SELECT id, exam_id, teil, question_number, title, situation, 
             context_header, context_body, options_json, statement,
             correct_answer, clue_quote, explanation_ru, explanation_en, explanation_de, vocabulary_notes
      FROM questions 
      WHERE exam_id = ? 
      ORDER BY question_number ASC
    `).all(examId);

    return parseOptions ? questions.map(parseQuestionOptions) : questions;
  }

  findQuestionsForGrading(examId) {
    return this.findQuestionsByExamId(examId, false);
  }
}
