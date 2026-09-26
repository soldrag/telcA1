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

  it('weights defects by category (syntax 1.5, case 1.0, spelling 0.5)', () => {
    const errors = [
      { category: 'syntax', code: 'ERR_BROKEN_SATZKLAMMER_MODAL', original: 'möchten kommen von' },
      { category: 'rektion', code: 'ERR_PREP_CASE_DAT', original: 'mit meine Familie' },
      { category: 'orthography', original: 'Hallo Frau Hansen, Ich' },
    ];
    const res = calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 30 });
    assert.equal(res.score, 7.0);
    assert.equal(res.errorCount, 3);
  });

  it('counts one defect flagged by two analyzers once', () => {
    const errors = [
      { category: 'syntax', code: 'ERR_BROKEN_SATZKLAMMER_MODAL', original: 'kommen von 15. Juli bis 25. Juli' },
      { category: 'syntax', code: 'ERR_BROKEN_SATZKLAMMER_MODAL', original: 'möchten kommen von 15' },
    ];
    const res = calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 30 });
    assert.equal(res.errorCount, 1);
    assert.equal(res.score, 8.5);
  });

  it('normalises by body length, without inflating short texts', () => {
    const errors = [{ category: 'rektion', original: 'mit meine Familie' }, { category: 'rektion', original: 'ein kleiner Hund' }];
    assert.equal(calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 60 }).score, 9.0);
    assert.equal(calculateLinguisticAccuracy({ grammarErrors: errors, wordCount: 15 }).score, 8.0);
  });

  it('handles empty text or gibberish', () => {
    const res = calculateLinguisticAccuracy({ wordCount: 0 });
    assert.equal(res.score, 0);
    assert.equal(res.band, 'unreadable');
  });
});
