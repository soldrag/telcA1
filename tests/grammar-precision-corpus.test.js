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

// Counterexamples from the independent review of v0.7.95 (not from the corpus): the tagger and case-government
// heuristics must not overreach.
describe('Grammar hints: review counterexamples', () => {
  const corrections = (text) => checkGermanA1Grammar(text).map((e) => e.correction);
  for (const text of ['Ich komme, weil wir einen Termin haben.', 'Ich weiß nicht, ob wir meinen Onkel treffen.',
    'Er verkauft sein Auto.', 'Ich gebe ihr Blumen.', 'Kommt ihr Mann auch?']) {
    it(`clean: ${text}`, () => assert.deepEqual(corrections(text), []));
  }
  for (const [text, correction] of [['Ich brauche ein Computer jeden Tag.', 'einen Computer'],
    ['Ich sehe der Mann jede Woche.', 'den Mann'], ['Ich besuche meinem Bruder jeden Tag.', 'meinen Bruder']]) {
    it(`${text} → ${correction}`, () => assert.ok(corrections(text).includes(correction), JSON.stringify(corrections(text))));
  }
});
