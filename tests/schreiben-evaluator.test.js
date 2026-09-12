import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, matchTextAnswer, evaluateEssay } from '../server/services/schreiben-evaluator.js';
import { evaluateExamSubmission } from '../server/services/exam-evaluator.js';

describe('Schreiben Evaluator & Text Normalization', () => {
  it('normalizes answers by stripping punctuation, trimming and lowercasing', () => {
    assert.equal(normalizeAnswer('  Bauer,  '), 'bauer');
    assert.equal(normalizeAnswer('18. Juli!'), '18 juli');
    assert.equal(normalizeAnswer('  Doppelzimmer  '), 'doppelzimmer');
  });

  it('matches single and pipe-delimited acceptable answers', () => {
    const q1 = { correct_answer: 'bauer', options_json: { accepted_answers: ['bauer', 'familie bauer'] } };
    assert.equal(matchTextAnswer('Bauer', q1), true);
    assert.equal(matchTextAnswer('  familie bauer  ', q1), true);
    assert.equal(matchTextAnswer('Schmidt', q1), false);

    const qDate = { correct_answer: '18. juli|18.07' };
    assert.equal(matchTextAnswer('18. Juli', qDate), true);
    assert.equal(matchTextAnswer('18.07', qDate), true);
    assert.equal(matchTextAnswer('19. Juli', qDate), false);
  });

  it('rejects false positives from single characters or substring fragments', () => {
    const qName = { correct_answer: 'bauer', options_json: { accepted_answers: ['bauer'] } };
    assert.equal(matchTextAnswer('a', qName), false);
    assert.equal(matchTextAnswer('b', qName), false);
    assert.equal(matchTextAnswer('ba', qName), false);
    assert.equal(matchTextAnswer('Frau Bauer', qName), true);

    const qRoom = { correct_answer: 'doppelzimmer', options_json: { accepted_answers: ['doppelzimmer', 'dz'] } };
    assert.equal(matchTextAnswer('zimmer', qRoom), false);
    assert.equal(matchTextAnswer('d', qRoom), false);
    assert.equal(matchTextAnswer('ein Doppelzimmer', qRoom), true);

    const qNumber = { correct_answer: '3', options_json: { accepted_answers: ['3', 'drei'] } };
    assert.equal(matchTextAnswer('13', qNumber), false);
    assert.equal(matchTextAnswer('30', qNumber), false);
    assert.equal(matchTextAnswer('3 Personen', qNumber), true);
  });

  it('evaluates essay word count and points', () => {
    const qEssay = { max_points: 10 };
    
    // Empty text
    const emptyResult = evaluateEssay('', qEssay);
    assert.equal(emptyResult.word_count, 0);
    assert.equal(emptyResult.points_earned, 0);
    assert.equal(emptyResult.is_correct, false);

    // Short text (< 10 words)
    const shortResult = evaluateEssay('Sehr geehrte Damen und Herren, ich brauche ein Zimmer.', qEssay);
    assert.equal(shortResult.word_count, 9);
    assert.equal(shortResult.points_earned, 3);
    assert.equal(shortResult.is_correct, false);

    // Medium text (10-19 words)
    const mediumText = 'Sehr geehrte Damen und Herren, ich möchte Deutsch lernen. Bitte antworten Sie mir.';
    const medResult = evaluateEssay(mediumText, qEssay);
    assert.equal(medResult.word_count, 13);
    assert.equal(medResult.points_earned, 6);
    assert.equal(medResult.is_correct, true);

    // Full text (>= 20 words)
    const fullText = 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs? Mit freundlichen Grüßen, Anna';
    const fullResult = evaluateEssay(fullText, qEssay);
    assert.equal(fullResult.word_count >= 20, true);
    assert.equal(fullResult.points_earned, 10);
    assert.equal(fullResult.is_correct, true);
  });

  it('evaluates a complete Schreiben exam submission correctly up to 15 points', () => {
    const mockQuestions = [
      { id: 's1-q1', teil: 1, question_number: 1, correct_answer: 'bauer' },
      { id: 's1-q2', teil: 1, question_number: 2, correct_answer: '3' },
      { id: 's1-q3', teil: 1, question_number: 3, correct_answer: '18. juli|18.07' },
      { id: 's1-q4', teil: 1, question_number: 4, correct_answer: 'doppelzimmer' },
      { id: 's1-q5', teil: 1, question_number: 5, correct_answer: 'kreditkarte' },
      {
        id: 's1-q6',
        teil: 2,
        question_number: 6,
        options_json: { type: 'essay' },
        correct_answer: 'musterloesung',
      },
    ];

    const answers = {
      's1-q1': 'Bauer',
      's1-q2': '3',
      's1-q3': '18.07',
      's1-q4': 'Doppelzimmer',
      's1-q5': 'Kreditkarte',
      's1-q6': 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs? Mit freundlichen Grüßen, Anna',
    };

    const result = evaluateExamSubmission(mockQuestions, answers);
    assert.equal(result.score, 15);
    assert.equal(result.teilBreakdown[1].score, 5);
    assert.equal(result.teilBreakdown[1].total, 5);
    assert.equal(result.teilBreakdown[2].score, 10);
    assert.equal(result.teilBreakdown[2].total, 10);
  });
});
