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

describe('A misspelt keyword still states the point', () => {
  const misspellings = [
    ['arbeiten', 'Ich muss lange arbieten.'],
    ['hausaufgaben', 'Bitte schicken Sie die Hausaufgabem.'],
    ['termin', 'Ich brauche einen Termien.'],
    ['wohnung', 'Die Vohnung ist schön.'],
    ['fahrrad', 'Ich habe ein Farrad.'],
    ['interessiere', 'Ich intressiere mich für den Kurs.'],
  ];
  for (const [keyword, sentence] of misspellings) {
    it(`"${sentence}" states "${keyword}"`, () => {
      assert.deepEqual(match([keyword], sentence), [keyword]);
    });
  }

  it('never re-reads a known word as another one', () => {
    assert.deepEqual(match(['mann'], 'Das kann man machen.'), []);
    assert.deepEqual(match(['kosten'], 'Ich kann kochen.'), []);
    assert.deepEqual(match(['arbeit'], 'Ich habe Zeit.'), []);
  });
});
