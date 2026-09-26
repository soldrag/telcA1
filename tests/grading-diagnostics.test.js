import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectUnassignedSentences } from '../src/services/schreiben/grading/unassignedSentences.js';
import { mergeArbitrationVerdict } from '../src/services/schreiben/grading/leitpunktArbitration.js';

describe('Unassigned sentences diagnostic', () => {
  const body = ['Ich möchte mieten.', 'Wir sind vier.', 'Ist sie frei?', 'Was kostet sie?'];

  it('lists sentences no credited Leitpunkt used as evidence', () => {
    const items = [
      { score: 2, matchedSentence: 'Ich möchte mieten.', keywordSentences: [] },
      { score: 1, matchedSentence: '', keywordSentences: ['Wir sind vier.'] },
      { score: 2, rankerDetails: { aspects: [{ coverage: 'full', matchedSentence: 'Was kostet sie?' }, { coverage: 'no', matchedSentence: 'Ist sie frei?' }] } },
    ];
    assert.deepEqual(collectUnassignedSentences(body, items), ['Ist sie frei?']);
  });

  it('ignores evidence of Leitpunkte that scored 0', () => {
    const items = [{ score: 0, matchedSentence: 'Ist sie frei?', keywordSentences: ['Ist sie frei?'] }];
    assert.deepEqual(collectUnassignedSentences(body, items), body);
  });
});

describe('Arbitration protection flag', () => {
  it('marks protection only when the provider verdict is below the baseline', () => {
    const lowered = mergeArbitrationVerdict(2, { coverage: 'partial' });
    assert.deepEqual([lowered.score, lowered.rankerScore, lowered.isProtected], [2, 1, true]);

    const agreed = mergeArbitrationVerdict(2, { coverage: 'full' });
    assert.deepEqual([agreed.isProtected, agreed.arbitrated], [false, false]);
  });

  it('a missing compound aspect still caps the score at the partial level', () => {
    const res = mergeArbitrationVerdict(2, { coverage: 'partial', isCompound: true, missingAspects: ['Haustiere'] });
    assert.equal(res.score, 1);
  });
});
