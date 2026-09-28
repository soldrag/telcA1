/**
 * Target cases for the lexicon-driven grammar checker (`stage` records the rollout stage that brought the rule);
 * `expect: []` means the sentence is correct German and must produce no hint at all.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const checkGermanA1Grammar = (text) => resolveLevelContext('A1').grammar.checkLetter(text);
import { describeGrammarErrors } from './helpers/grammarSnapshotCorpus.js';

const targets = JSON.parse(readFileSync(new URL('./fixtures/grammar/targets.json', import.meta.url), 'utf8'));

describe('Grammar checker target cases', () => {
  for (const target of targets) {
    it(`${target.id}: ${target.text}`, () => {
      const errors = checkGermanA1Grammar(target.text);
      const found = describeGrammarErrors(errors);
      if (target.expect.length === 0) {
        assert.deepEqual(found, []);
        return;
      }
      for (const correction of target.expect) {
        assert.ok(errors.some((e) => String(e.correction || '').includes(correction)), `missing "${correction}" in ${JSON.stringify(found)}`);
      }
    });
  }
});
