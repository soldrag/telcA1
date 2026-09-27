import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeCandidateGrammarErrors } from '../src/services/schreiben/linguistic/grammarErrorDeduper.js';

describe('Grammar error merge', () => {
  it('merges candidate errors with baseline and deduplicates', () => {
    const baseline = [
      { original: 'vier Woche', correction: 'vier Wochen', explanation: 'Plural' }
    ];
    const candidates = [
      { original: 'vier woche', correction: 'vier Wochen', explanation: 'Duplicate' },
      { original: 'wie ich kann', correction: 'wie kann ich', explanation: 'W-Frage' }
    ];

    const merged = mergeCandidateGrammarErrors(baseline, candidates);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].original, 'vier Woche');
    assert.equal(merged[1].original, 'wie ich kann');
  });
});
