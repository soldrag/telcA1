import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { misspellingRule } from '../src/services/schreiben/linguistic/letterRules/misspellingRule.js';

const level = resolveLevelContext('A1');
const check = (sentence) => misspellingRule.check({ bodySentences: [sentence] }, { lexicon: level.lexicon })
  .map((e) => `${e.original}→${e.correction}`);

describe('Misspelt words', () => {
  before(() => level.lexicon.load());

  it('flags a word that sounds like one A1 word', () => {
    assert.deepEqual(check('ich bin krang und kann nicht komen.'), ['krang→krank', 'komen→kommen']);
    assert.deepEqual(check('Bite schiken Sie mir die Hausaufgaben.'), ['Bite→Bitte', 'schiken→schicken']);
    assert.deepEqual(check('Ich habe fiber.'), ['fiber→Fieber']);
  });

  it('leaves correct words the lexicon does not know, and names, alone', () => {
    assert.deepEqual(check('Es ist kalt und ich habe mehr Zeit.'), []);
    assert.deepEqual(check('Heute ist es kurz nach acht.'), []);
    assert.deepEqual(check('Ich wohne bei Rahim in München.'), []);
  });
});
