/**
 * Every grading entry point loads the lexicon data itself. `npm test` preloads it (tests/support), which hid
 * v0.7.89's broken submit on static hosting: Schreiben answers threw "dictionary is not loaded" and the
 * confirm button did nothing. These checks run in a fresh process without the preload.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const ANSWERS = JSON.stringify({
  's4-q1': 'Müller', 's4-q2': 'Anna', 's4-q3': 'Berlin', 's4-q4': 'Hund', 's4-q5': 'Juli',
  's4-q6': 'Sehr geehrte Frau Hansen, ich komme im Juli mit meiner Familie. Viele Grüße Anna',
});

function runFresh(source) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', source], { cwd: ROOT, encoding: 'utf8' }).trim();
}

describe('Lexicon data is loaded by the grading entry points', () => {
  it('local (static hosting) submit grades Schreiben without a preload', () => {
    const out = runFresh(`
      import { submitLocalExamAnswers } from './src/services/localDataService.js';
      const r = await submitLocalExamAnswers('schreiben-modellsatz-4', { answers: ${ANSWERS}, timeSpentSeconds: 60 });
      console.log(r.reviewItems.length);
    `);
    assert.equal(out, '6');
  });
});
