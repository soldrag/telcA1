import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toGermanSoundKey } from '../src/services/schreiben/linguistic/germanSoundKey.js';

const sameSound = (a, b) => toGermanSoundKey(a) === toGermanSoundKey(b);

describe('German sound key', () => {
  it('gives spellings of one pronunciation one key', () => {
    assert.ok(sameSound('Stadt', 'Statt'), 'dt = tt');
    assert.ok(sameSound('Tag', 'Tak'), 'final devoicing');
    assert.ok(sameSound('Vater', 'Fata'), 'v = f, unstressed -er');
    assert.ok(sameSound('Fotograf', 'Photograph'), 'ph = f');
    assert.ok(sameSound('mehr', 'Meer'), 'lengthening h = doubled vowel');
    assert.ok(sameSound('Grüße', 'Gruesse'), 'umlaut transliteration, ß = ss');
    assert.ok(sameSound('Zucker', 'Zuker'), 'ck = k');
  });

  it('keeps words that differ in a vowel, a marked length or a stressed r apart', () => {
    assert.ok(!sameSound('Dienstag', 'Donnerstag'));
    assert.ok(!sameSound('Montag', 'Sonntag'));
    assert.ok(!sameSound('Miete', 'Mitte'), 'ie marks a long vowel');
    assert.ok(!sameSound('Miiete', 'Mitte'));
    assert.ok(!sameSound('Berg', 'Back'), 'the r of a first syllable is not vocalised');
    assert.ok(!sameSound('Erbe', 'Abe'));
    assert.ok(!sameSound('Mäher', 'mehr'), 'an h between vowels is not a lengthening h');
    assert.ok(!sameSound('Flug', 'Fluch'));
  });

  it('is empty for an empty word', () => {
    assert.equal(toGermanSoundKey(''), '');
  });
});
