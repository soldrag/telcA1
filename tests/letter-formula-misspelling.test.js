import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchSalutation, matchClosing, findLastClosingOffset } from '../src/services/schreiben/linguistic/letter/letterFormulaMatcher.js';

describe('Letter formulas with a learner\'s misspelling', () => {
  it('reads a misspelt formula word as the formula', () => {
    assert.equal(matchSalutation('Sehr geerte Damen und Heren,')?.misspelt, true);
    assert.equal(matchClosing('Mit freundliche Gruse')?.misspelt, true);
    assert.equal(matchClosing('Grus')?.misspelt, true);
    assert.equal(matchClosing('Mit freundlichen Grüßen')?.misspelt, false);
  });

  it('does not read content as a formula', () => {
    assert.equal(matchSalutation('Sehr gut ist das.'), null);
    assert.equal(matchClosing('Ich sende Grus an alle'), null);
  });

  it('ends the body at a misspelt closing only when at most a name follows', () => {
    assert.ok(findLastClosingOffset('Ich komme am Montag.\nViele Gruse\nAnna') > 0);
    assert.equal(findLastClosingOffset('Ich komme am Montag.\nViele Gruse von meiner Familie und von meinen zwei Kindern'), -1);
  });
});
