/**
 * Pins the grammar checker output on every fixture letter. Refactoring the checker changes this on purpose:
 * review each diff (improvement or regression), then refresh with UPDATE_GRAMMAR_SNAPSHOT=1 npm test.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const checkGermanA1Grammar = (text) => resolveLevelContext('A1').grammar.checkLetter(text);
import { collectGrammarSnapshotLetters, describeGrammarErrors } from './helpers/grammarSnapshotCorpus.js';

const SNAPSHOT_URL = new URL('./fixtures/grammar/snapshot.json', import.meta.url);

function buildSnapshot() {
  return Object.fromEntries(collectGrammarSnapshotLetters()
    .map((letter) => [letter.id, describeGrammarErrors(checkGermanA1Grammar(letter.text))]));
}

describe('Grammar checker snapshot', () => {
  it('matches the reviewed snapshot for every fixture letter', () => {
    const actual = buildSnapshot();
    if (process.env.UPDATE_GRAMMAR_SNAPSHOT || !existsSync(SNAPSHOT_URL)) {
      writeFileSync(SNAPSHOT_URL, `${JSON.stringify(actual, null, 2)}\n`);
    }
    const expected = JSON.parse(readFileSync(SNAPSHOT_URL, 'utf8'));
    const changed = Object.keys({ ...expected, ...actual })
      .filter((id) => JSON.stringify(expected[id]) !== JSON.stringify(actual[id]))
      .map((id) => ({ id, was: expected[id], now: actual[id] }));
    assert.deepEqual(changed, [], `grammar output changed:\n${JSON.stringify(changed, null, 2)}`);
  });
});
