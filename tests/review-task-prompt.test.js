import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExamSubmission } from '../server/services/exam-evaluator.js';
import { questions as sQuestions1 } from '../server/seeds/schreiben-modellsatz-1.js';
import { questions as mQuestions1 } from '../server/seeds/modellsatz-1.js';

describe('Review Task Context & Prompt Invariants', () => {
  it('preserves full task context (situation, leitpunkte, statement) for Schreiben Teil 2', () => {
    const essayQuestion = sQuestions1.find(q => q.teil === 2);
    assert.ok(essayQuestion, 'Schreiben Teil 2 question must exist');

    const { reviewItems } = evaluateExamSubmission([essayQuestion], {
      [essayQuestion.id]: 'Sehr geehrte Damen und Herren, ich möchte einen Deutschkurs machen. Mit freundlichen Grüßen'
    });

    const item = reviewItems[0];
    assert.ok(item.situation, 'Item must retain situation');
    assert.ok(item.situation.includes('Sprachschule'), 'Situation must contain target context');

    const options = item.options_json;
    assert.equal(options.type, 'essay');
    assert.ok(Array.isArray(options.leitpunkte));
    assert.equal(options.leitpunkte.length, 3, 'Must have 3 guide points');
    assert.ok(item.statement, 'Must retain statement instruction');
  });

  it('preserves situation, form label, and context body for Schreiben Teil 1', () => {
    const formQuestion = sQuestions1.find(q => q.teil === 1 && q.question_number === 1);
    assert.ok(formQuestion, 'Schreiben Teil 1 question must exist');

    const { reviewItems } = evaluateExamSubmission([formQuestion], {
      [formQuestion.id]: 'Bauer'
    });

    const item = reviewItems[0];
    assert.ok(item.situation, 'Must retain situation context');
    assert.ok(item.context_body, 'Must retain hotel background text');
    assert.equal(item.options_json.form_label, 'Familienname');
    assert.ok(item.statement.includes('Familienname'));
  });

  it('preserves situation and multiple choice web options for Lesen Teil 2', () => {
    const lesenTeil2Question = mQuestions1.find(q => q.teil === 2 && q.question_number === 6);
    assert.ok(lesenTeil2Question, 'Lesen Teil 2 question must exist');

    const { reviewItems } = evaluateExamSubmission([lesenTeil2Question], {
      [lesenTeil2Question.id]: 'b'
    });

    const item = reviewItems[0];
    assert.ok(item.situation, 'Must retain search goal situation');
    assert.ok(item.situation.includes('vegetarischem Essen'));
    assert.ok(Array.isArray(item.options_json), 'Must retain options array');
    assert.equal(item.options_json.length, 2);
    assert.equal(item.correct_answer, 'b');
  });

  it('preserves context header and statement for Lesen Teil 1 and Teil 3', () => {
    const lesenTeil1 = mQuestions1.find(q => q.teil === 1 && q.question_number === 1);
    const lesenTeil3 = mQuestions1.find(q => q.teil === 3 && q.question_number === 11);

    const { reviewItems } = evaluateExamSubmission([lesenTeil1, lesenTeil3], {
      [lesenTeil1.id]: 'falsch',
      [lesenTeil3.id]: 'richtig'
    });

    assert.ok(reviewItems[0].context_header.includes('Betreff'), 'Teil 1 must retain email header');
    assert.ok(reviewItems[0].statement, 'Teil 1 must retain statement to verify');
    assert.ok(reviewItems[1].context_body, 'Teil 3 must retain notice body');
    assert.ok(reviewItems[1].statement, 'Teil 3 must retain statement to verify');
  });
});
