import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findMatchedKeywords } from '../src/services/schreiben/linguistic/keywordStemMatcher.js';
import { defaultA1RankerPolicy as policy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';

const words = (text) => text.split(/\s+/);
const match = (keywords, text) => findMatchedKeywords(keywords, words(text), policy.lexicon);

describe('Phrase keywords match their words in a row', () => {
  it('matches an inflected phrase', () => {
    assert.deepEqual(match(['nächste woche'], 'Haben Sie nächste Woche Zeit?'), ['nächste woche']);
    assert.deepEqual(match(['neuen termin'], 'Ich möchte einen neuen Termin.'), ['neuen termin']);
    assert.deepEqual(match(['kann nicht'], 'Ich kann nicht kommen.'), ['kann nicht']);
  });

  it('does not match the words scattered over the sentence', () => {
    assert.deepEqual(match(['neuen termin'], 'Der Termin ist neu für mich.'), []);
    assert.deepEqual(match(['nächste woche'], 'Diese Woche und nächsten Monat.'), []);
  });
});

describe('A correctly spelt word is not read as a similar-sounding keyword', () => {
  const lookalikes = [['kurs', 'kurz'], ['hund', 'Mund'], ['preis', 'Reis'], ['wochen', 'kochen'], ['kind', 'Kino'], ['zeit', 'Zeig']];
  for (const [keyword, word] of lookalikes) {
    it(`"${word}" does not state "${keyword}"`, () => {
      assert.deepEqual(match([keyword], `Das ist ${word}.`), []);
    });
  }
});

describe('A separable verb keyword matches its split form (Satzklammer)', () => {
  const stub = {
    lookup: (w) => ({
      zumachen: [{ pos: 'VERB_INF', lemma: 'zumachen', valency: 'SEP', baseVerb: 'machen' }],
      macht: [{ pos: 'VERB_FIN', lemma: 'machen' }],
      mache: [{ pos: 'VERB_FIN', lemma: 'machen' }],
    })[w] || null,
  };
  const matchSep = (text) => findMatchedKeywords(['zumachen'], words(text), stub);

  it('matches the base verb with the prefix closing the clause', () => {
    assert.deepEqual(matchSep('Wann macht der Laden zu?'), ['zumachen']);
    assert.deepEqual(matchSep('Ich mache das Fenster morgen zu.'), ['zumachen']);
    assert.deepEqual(matchSep('Bitte zumachen.'), ['zumachen']);
  });

  it('does not match a preposition inside the clause or a prefix in the next clause', () => {
    assert.deepEqual(matchSep('Ich mache das zu Hause.'), []);
    assert.deepEqual(matchSep('Ich mache das, zu spät.'), []);
  });
});
