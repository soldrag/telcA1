import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedData } from '../server/seed-data.js';
import { validateAllSeeds, validateExamSeed } from '../server/database/validate-seeds.js';

describe('Exam Seeds Schema & Integrity Validator', () => {
  it('validates all registered seed exams and questions with zero fatal errors', () => {
    const summary = validateAllSeeds(seedData);
    assert.equal(
      summary.errors.length, 
      0, 
      `Seed validation failed with errors:\n${summary.errors.join('\n')}`
    );
    assert.ok(summary.examsCount >= 12, 'Must have at least 12 exams configured');
    assert.ok(summary.questionsCount >= 150, 'Must have at least 150 questions configured');
  });

  it('detects missing required fields in invalid exam', () => {
    const brokenExam = { id: 'invalid-exam' };
    const result = validateExamSeed(brokenExam, []);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it('detects invalid correct_answer in Lesen questions', () => {
    const fakeExam = {
      id: 'fake-exam',
      title: 'Fake',
      subtitle: 'Fake Sub',
      description: 'Fake Desc',
      time_limit_minutes: 25,
      total_questions: 1,
      pass_score: 1,
      test_type: 'lesen'
    };
    const badQuestion = {
      id: 'fake-q1',
      exam_id: 'fake-exam',
      teil: 1,
      question_number: 1,
      statement: 'Some statement',
      context_body: 'Some text',
      correct_answer: 'invalid_answer', // must be 'richtig' or 'falsch'
      clue_quote: 'Some text',
      explanation_ru: 'Объяснение',
      explanation_en: 'Explanation',
      explanation_de: 'Erklärung',
      vocabulary_notes: [{ word: 'test' }]
    };

    const result = validateExamSeed(fakeExam, [badQuestion]);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes("correct_answer must be 'richtig' or 'falsch'")));
  });
});
