import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLinguisticAccuracy } from '../src/services/schreiben/scoring/linguisticAccuracyScorer.js';

describe('Linguistic Accuracy Scorer', () => {
  it('gives 10/10 for zero errors', () => {
    const res = calculateLinguisticAccuracy({ grammarErrors: [], wordCount: 35 });
    assert.equal(res.score, 10);
    assert.equal(res.percentage, 100);
    assert.equal(res.band, 'excellent');
  });

  it('deducts penalties for grammar defects (e.g. 3 errors -> ~7/10)', () => {
    const errors = [
      { code: 'DATIVE_ERROR', severity: 'medium' },
      { code: 'SATZKLAMMER_ERROR', severity: 'medium' },
      { code: 'DATIVE_PLURAL_ERROR', severity: 'medium' },
    ];
    const res = calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 50 });
    assert.equal(res.score, 7.0);
    assert.equal(res.percentage, 70);
    assert.equal(res.band, 'good');
    assert.equal(res.errorCount, 3);
  });

  it('deducts smaller penalty for minor flaws', () => {
    const errors = [
      { code: 'TYPO_MINOR', severity: 'minor' },
    ];
    const res = calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 30 });
    assert.equal(res.score, 9.5);
    assert.equal(res.band, 'excellent');
  });

  it('handles empty text or gibberish', () => {
    const res = calculateLinguisticAccuracy({ wordCount: 0 });
    assert.equal(res.score, 0);
    assert.equal(res.band, 'needs_practice');
  });
});
