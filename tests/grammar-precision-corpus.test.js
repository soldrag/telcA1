/**
 * Hints are shown only where the checker is reliable: no hint at all on the independent corpus of correct
 * A1 sentences (tests/fixtures/grammar/precision/correct.txt, written without the checker). Per-rule precision
 * and recall: `npm run measure:grammar`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';

const read = (name) => readFileSync(new URL(`./fixtures/grammar/precision/${name}`, import.meta.url), 'utf8').split('\n');
const correct = [...read('correct.txt').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')),
  ...read('errors.tsv').filter(Boolean).map((l) => l.split('\t')[2])];

describe('Grammar hints on correct sentences', () => {
  it(`no hint on ${correct.length} correct sentences`, () => {
    const hinted = correct.flatMap((text) => checkGermanA1Grammar(text).map((e) => `${e.code}: ${text} ⇒ ${e.correction}`));
    assert.deepEqual(hinted, []);
  });
});
