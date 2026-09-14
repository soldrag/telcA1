import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalTestTypes,
  getLocalExams,
  getLocalExamDetails,
  submitLocalExamAnswers,
} from '../src/services/localDataService.js';

describe('Local Data Service (Client-Side & GitHub Pages Mode)', () => {
  it('returns all test types including lesen', () => {
    const { testTypes } = getLocalTestTypes();
    assert.ok(Array.isArray(testTypes));
    assert.ok(testTypes.some(t => t.id === 'lesen'));
  });

  it('returns lesen exams sorted by order', () => {
    const { exams } = getLocalExams('lesen');
    assert.ok(exams.length >= 10);
    assert.equal(exams[0].id, 'modellsatz-1');
  });

  it('loads exam details and its questions', () => {
    const details = getLocalExamDetails('modellsatz-1');
    assert.ok(details.exam);
    assert.equal(details.exam.id, 'modellsatz-1');
    assert.equal(details.questions.length, 15);
    assert.equal(details.questions[0].question_number, 1);
  });

  it('evaluates answers and calculates correct score', () => {
    const submission = submitLocalExamAnswers('modellsatz-1', {
      answers: {
        'm1-q1': 'falsch', // correct
        'm1-q2': 'falsch', // check against seed
      },
      timeSpentSeconds: 120,
    });

    assert.ok(submission.attemptId);
    assert.equal(submission.totalQuestions, 15);
    assert.ok(typeof submission.score === 'number');
    assert.ok(submission.reviewItems.length === 15);
    assert.equal(submission.reviewItems[0].is_correct, true);
    assert.equal(submission.reviewItems[0].user_answer, 'falsch');
  });
});
