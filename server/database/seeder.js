import { seedData } from '../seed-data.js';

export function seedDatabase(database) {
  const insertExam = database.prepare(`
    INSERT OR REPLACE INTO exams (
      id, title, subtitle, description, test_type, 
      time_limit_minutes, total_questions, pass_score, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = database.prepare(`
    INSERT OR REPLACE INTO questions (
      id, exam_id, teil, question_number, title, situation, 
      context_header, context_body, options_json, statement, 
      correct_answer, clue_quote, explanation_ru, explanation_en, explanation_de, vocabulary_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exam of seedData.exams) {
    insertExam.run(
      exam.id,
      exam.title,
      exam.subtitle,
      exam.description,
      exam.test_type || 'lesen',
      exam.time_limit_minutes,
      exam.total_questions,
      exam.pass_score,
      exam.sort_order || 1
    );
  }

  for (const question of seedData.questions) {
    insertQuestion.run(
      question.id,
      question.exam_id,
      question.teil,
      question.question_number,
      question.title || null,
      question.situation || null,
      question.context_header || null,
      question.context_body || null,
      question.options_json ? JSON.stringify(question.options_json) : null,
      question.statement || null,
      question.correct_answer,
      question.clue_quote,
      question.explanation_ru,
      question.explanation_en || null,
      question.explanation_de,
      question.vocabulary_notes ? JSON.stringify(question.vocabulary_notes) : null
    );
  }
}
