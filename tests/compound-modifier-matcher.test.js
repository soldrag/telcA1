import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findCompoundModifierMatches } from '../src/services/schreiben/linguistic/compoundModifierMatcher.js';

const ENTRIES = {
  Kurs: [{ pos: 'NOUN', lemma: 'Kurs' }],
  Termin: [{ pos: 'NOUN', lemma: 'Termin' }],
  Mittag: [{ pos: 'NOUN', lemma: 'Mittag' }],
  Arzt: [{ pos: 'NOUN', lemma: 'Arzt' }],
  Haus: [{ pos: 'NOUN', lemma: 'Haus' }],
  nach: [{ pos: 'PREP', lemma: 'nach' }],
  schnell: [{ pos: 'ADJ', lemma: 'schnell' }],
  gut: [{ pos: 'ADJ' }, { pos: 'VERB_FIN' }],
  ich: [{ pos: 'PRON_SUBJ', lemma: 'ich' }],
};
const lexicon = { lookup: (w) => ENTRIES[w] || null };
const match = (keywords, text) => findCompoundModifierMatches(keywords, text.split(' '), lexicon);

describe('compound modifier matcher (level-agnostic, stub lexicon port)', () => {
  it('finds the modifier of a compound whose head is a known noun, even if the modifier is unknown', () => {
    assert.deepEqual(match(['deutschkurs'], 'Ich möchte Deutsch lernen.'), ['deutschkurs']);
  });

  it('accepts a linking s and ignores case and punctuation', () => {
    assert.deepEqual(match(['arzttermin'], 'Der Arzt, bitte'), ['arzttermin']);
  });

  it('does not take the head of a compound or the compound itself for its modifier', () => {
    assert.deepEqual(match(['deutschkurs'], 'Der Kurs'), []);
    assert.deepEqual(match(['deutschkurs'], 'Deutschkurs'), []);
  });

  it('does not take a short word or a word of a closed class for a modifier', () => {
    assert.deepEqual(match(['barmann', 'nachmittag'], 'Bar nach'), []);
  });

  it('needs a known noun as the rest of the compound', () => {
    assert.deepEqual(match(['deutschland', 'zeitung'], 'Deutsch Zeit'), []);
  });

  it('a modifier of a mixed word class or a closed class is no topic word, an adjective is', () => {
    assert.deepEqual(match(['nachmittag'], 'nach'), []);
    assert.deepEqual(match(['gutkurs'], 'gut'), []);
    assert.deepEqual(match(['schnellkurs'], 'schnell'), ['schnellkurs']);
  });

  it('skips phrases and needs a lexicon port', () => {
    assert.deepEqual(match(['deutsch kurs'], 'Deutsch'), []);
    assert.throws(() => findCompoundModifierMatches(['a'], ['b']), TypeError);
  });
});
