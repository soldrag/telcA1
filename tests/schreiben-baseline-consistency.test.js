import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEssay } from '../src/services/evaluation/schreibenEvaluator.js';
import { runSchreibenMicroPipeline } from '../src/services/schreiben/schreibenMicroPipeline.js';
import { toCriteriaBreakdown } from '../src/services/schreiben/deterministicBaseline.js';

describe('Deterministic baseline: rules-only evaluator vs micro-pipeline', () => {
  const question = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'a1', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit/Dauer', keywords: ['wochen', 'zeit', 'vormittags'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'anmelden'], requiredMatches: 2 }
        ]
      }
    }
  };

  const fullEssay = `Sehr geehrte Damen und Herren,

ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Was kostet der Kurs und wie kann ich mich anmelden?

Mit freundlichen Grüßen
Maria Ivanova`;

  it('defaults missing Leitpunkte to 0 in criteria_breakdown', () => {
    const breakdown = toCriteriaBreakdown({ salutationScore: 2, leitpunkteItems: [{ score: 1 }], closingScore: 1 });
    assert.equal(breakdown.anrede, 2);
    assert.equal(breakdown.lp1, 1);
    assert.equal(breakdown.lp2, 0);
    assert.equal(breakdown.lp3, 0);
    assert.equal(breakdown.gruss, 1);
  });

  it('rules-only evaluator and micro-pipeline agree on final points', async () => {
    const rulesOnlyResult = evaluateEssay(fullEssay, question);
    const clientResult = await runSchreibenMicroPipeline({
      userText: fullEssay,
      question,
      llmCaller: null
    });

    assert.equal(clientResult.final_points, rulesOnlyResult.points_earned);
    assert.equal(clientResult.word_count, rulesOnlyResult.word_count);
    assert.equal(clientResult.criteria_breakdown.anrede, rulesOnlyResult.breakdown.anrede);
    assert.equal(clientResult.criteria_breakdown.gruss, rulesOnlyResult.breakdown.gruss);
    assert.equal(clientResult.criteria_breakdown.lp1, rulesOnlyResult.breakdown.items[0].score);
    assert.equal(clientResult.criteria_breakdown.lp2, rulesOnlyResult.breakdown.items[1].score);
    assert.equal(clientResult.criteria_breakdown.lp3, rulesOnlyResult.breakdown.items[2].score);
    assert.equal(clientResult.grammar_errors.length, rulesOnlyResult.grammar_errors.length);
  });

  it('both paths give 0 points for gibberish text', async () => {
    const spam = 'test test test test test test test test test test';
    assert.equal(evaluateEssay(spam, question).points_earned, 0);
    const clientResult = await runSchreibenMicroPipeline({
      userText: spam,
      question,
      llmCaller: null
    });
    assert.equal(clientResult.final_points, 0);
  });
});
