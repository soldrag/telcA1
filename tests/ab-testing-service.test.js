import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareGradingResults,
  buildCriteriaComparison,
  getAbRunHistory,
  clearAbRunHistory,
  saveAbRunRecord,
  MAX_AB_HISTORY_RECORDS,
} from '../src/services/schreiben/grading/abTestingService.js';

describe('ABTestingService Tests', () => {
  beforeEach(() => {
    clearAbRunHistory();
  });

  const sampleResultA = {
    provider_id: 'client_webgpu',
    points_earned: 8,
    criteria_breakdown: {
      anrede: 1.5,
      lp1: 3,
      lp2: 1.5,
      lp3: 0.5,
      gruss: 1.5,
    },
  };

  const sampleResultB = {
    provider_id: 'micro_ranker',
    points_earned: 9,
    criteria_breakdown: {
      anrede: 1.5,
      lp1: 3,
      lp2: 3,
      lp3: 0,
      gruss: 1.5,
    },
  };

  it('buildCriteriaComparison computes correct matches and deltas', () => {
    const comp = buildCriteriaComparison(sampleResultA, sampleResultB);
    assert.equal(comp.length, 5);

    const anrede = comp.find((c) => c.id === 'anrede');
    assert.equal(anrede.isMatch, true);
    assert.equal(anrede.delta, 0);

    const lp2 = comp.find((c) => c.id === 'lp2');
    assert.equal(lp2.isMatch, false);
    assert.equal(lp2.scoreA, 1.5);
    assert.equal(lp2.scoreB, 3);
    assert.equal(lp2.delta, 1.5);
  });

  it('compareGradingResults computes speedup factor and agreement rate', () => {
    const comparison = compareGradingResults(sampleResultA, sampleResultB, {
      durationMsA: 2500,
      durationMsB: 50,
      providerAId: 'qwen3',
      providerBId: 'micro_ranker',
    });

    assert.equal(comparison.pointsA, 8);
    assert.equal(comparison.pointsB, 9);
    assert.equal(comparison.scoreDelta, 1);
    assert.equal(comparison.durationMsA, 2500);
    assert.equal(comparison.durationMsB, 50);
    assert.equal(comparison.speedupFactor, 50); // 2500 / 50 = 50x
    assert.equal(comparison.agreementRate, 60); // 3 of 5 match (anrede, lp1, gruss)
    assert.equal(comparison.providerA, 'qwen3');
    assert.equal(comparison.providerB, 'micro_ranker');
  });

  it('saveAbRunRecord rotates records respecting MAX_AB_HISTORY_RECORDS', () => {
    clearAbRunHistory();
    for (let i = 0; i < MAX_AB_HISTORY_RECORDS + 10; i++) {
      saveAbRunRecord({ id: `rec_${i}`, pointsA: i, pointsB: i });
    }
    const history = getAbRunHistory();
    assert.ok(history.length <= MAX_AB_HISTORY_RECORDS);
  });
});
