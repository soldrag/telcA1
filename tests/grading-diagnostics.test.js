import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectUnassignedSentences } from '../src/services/schreiben/grading/unassignedSentences.js';

describe('Unassigned sentences diagnostic', () => {
  const body = ['Ich möchte mieten.', 'Wir sind vier.', 'Ist sie frei?', 'Was kostet sie?'];

  it('lists sentences no credited Leitpunkt was read from: a span may be a clause or two adjacent sentences', () => {
    const items = [
      { score: 2, matchedSentence: 'Ich möchte mieten.' },
      { score: 1, matchedSentence: 'Wir sind vier' },
      { score: 2, matchedSentence: 'Was kostet sie?', rankerDetails: { units: [{ span: 'Was kostet sie?' }, { level: 0, span: 'Ist sie frei?' }] } },
    ];
    assert.deepEqual(collectUnassignedSentences(body, items), ['Ist sie frei?']);
  });

  it('ignores spans of Leitpunkte that scored 0', () => {
    const items = [{ score: 0, matchedSentence: 'Ist sie frei?' }];
    assert.deepEqual(collectUnassignedSentences(body, items), body);
  });

  it('a span of two sentences uses both', () => {
    const items = [{ score: 2, matchedSentence: 'Ist sie frei? Was kostet sie?' }];
    assert.deepEqual(collectUnassignedSentences(body, items), ['Ich möchte mieten.', 'Wir sind vier.']);
  });
});
