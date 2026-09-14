import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';

const question = {
  options_json: {
    rubric: {
      leitpunkte_criteria: [
        { id: 'lp1', label: 'Termin absagen', keywords: ['Nicht Kommen'], requiredMatches: 1 }
      ]
    }
  }
};

function scoreFor(text) {
  return evaluateTeil2Essay(text, question).breakdown.items[0].score;
}

describe('Leitpunkte keyword normalization', () => {
  it('matches case-insensitive multi-word keywords', () => {
    assert.equal(scoreFor('Ich kann nicht kommen.'), 2);
  });

  it('does not match words separated by an unrelated token', () => {
    assert.equal(scoreFor('Ich kann nicht heute kommen.'), 0);
  });
});
