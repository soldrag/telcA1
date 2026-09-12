/**
 * Algorithmic Quality Evaluation Suite for Schreiben Teil 2.
 * Validates deterministic rules, scoring boundaries, edge cases and invariants.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTeil2Essay } from '../../src/services/schreiben/schreibenTeil2Evaluator.js';
import { gradeSchreibenTeil2 } from '../../src/services/schreiben/grading/gradingFacade.js';
import {
  allSchreibenEvaluationCases,
  getQuestionForCase
} from './fixtures/index.js';

function assertCaseExpectations(res, expected, caseId) {
  if (expected.anrede !== undefined) {
    assert.equal(res.breakdown.anrede, expected.anrede, `[${caseId}] Anrede score mismatch`);
  }
  if (expected.gruss !== undefined) {
    assert.equal(res.breakdown.gruss, expected.gruss, `[${caseId}] Gruß score mismatch`);
  }
  if (expected.leitpunkte !== undefined) {
    assert.equal(res.breakdown.leitpunkte, expected.leitpunkte, `[${caseId}] Leitpunkte score mismatch`);
  }
  if (expected.algorithmicLeitpunkte !== undefined) {
    assert.equal(res.breakdown.leitpunkte, expected.algorithmicLeitpunkte, `[${caseId}] Algorithmic Leitpunkte score mismatch`);
  }
  if (expected.minLeitpunkte !== undefined) {
    assert.ok(res.breakdown.leitpunkte >= expected.minLeitpunkte, `[${caseId}] Leitpunkte below minimum`);
  }
  if (expected.maxLeitpunkte !== undefined) {
    assert.ok(res.breakdown.leitpunkte <= expected.maxLeitpunkte, `[${caseId}] Leitpunkte exceeded maximum`);
  }
  if (expected.minScore !== undefined) {
    assert.ok(res.points_earned >= expected.minScore, `[${caseId}] Final score below minimum`);
  }
  if (expected.maxScore !== undefined) {
    assert.ok(res.points_earned <= expected.maxScore, `[${caseId}] Final score exceeded maximum`);
  }
  if (expected.pointsEarned !== undefined) {
    assert.equal(res.points_earned, expected.pointsEarned, `[${caseId}] Exact points mismatch`);
  }
  if (expected.minErrors !== undefined) {
    assert.ok(res.grammar_errors.length >= expected.minErrors, `[${caseId}] Grammar errors below expected`);
  }
  if (expected.maxErrors !== undefined) {
    assert.ok(res.grammar_errors.length <= expected.maxErrors, `[${caseId}] Grammar errors exceeded max`);
  }
  if (expected.isCorrect !== undefined) {
    assert.equal(res.is_correct, expected.isCorrect, `[${caseId}] is_correct pass flag mismatch`);
  }
}

describe('Schreiben Teil 2 Algorithmic Quality Suite (25 Edge Cases)', () => {
  const options = { forceLimitedMode: true };

  for (const tc of allSchreibenEvaluationCases) {
    it(`[${tc.category.toUpperCase()}] ${tc.id}: ${tc.title}`, async () => {
      const question = getQuestionForCase(tc);
      const resSync = evaluateTeil2Essay(tc.text, question);
      const resFacade = await gradeSchreibenTeil2({ userText: tc.text, question, options });

      assertCaseExpectations(resSync, tc.expected, `${tc.id}-sync`);
      assertCaseExpectations(resFacade, tc.expected, `${tc.id}-facade`);

      // Verify sync evaluator and facade match closely in limited mode
      assert.equal(resSync.points_earned, resFacade.points_earned);
      assert.equal(resSync.breakdown.anrede, resFacade.breakdown.anrede);
      assert.equal(resSync.breakdown.gruss, resFacade.breakdown.gruss);
    });
  }

  it('Invariance: 100% Determinism across repeated executions', async () => {
    const sample = allSchreibenEvaluationCases[0];
    const question = getQuestionForCase(sample);
    const run1 = await gradeSchreibenTeil2({ userText: sample.text, question, options });
    const run2 = await gradeSchreibenTeil2({ userText: sample.text, question, options });

    assert.equal(run1.points_earned, run2.points_earned);
    assert.deepEqual(run1.criteria_breakdown, run2.criteria_breakdown);
    assert.deepEqual(run1.grammar_errors, run2.grammar_errors);
  });
});
