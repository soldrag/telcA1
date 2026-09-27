import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { stemByLemma } from '../src/services/schreiben/linguistic/lemmaStem.js';
import { stemGermanWord } from '../src/services/schreiben/linguistic/germanStemmer.js';

const ENTRIES = {
  zahlt: [{ pos: 'VERB_FIN', lemma: 'zahlen' }],
  gefahren: [{ pos: 'VERB_PART', lemma: 'fahren' }],
  bank: [{ pos: 'NOUN', lemma: 'Bank' }, { pos: 'NOUN', lemma: 'Bänke' }],
};
const lexicon = { lookup: (w) => ENTRIES[w] || null };

describe('stem through the lexicon lemma (stub lexicon port)', () => {
  it('folds verb forms the stemming algorithm leaves apart', () => {
    assert.notEqual(stemGermanWord('zahlt'), stemGermanWord('zahlen'));
    assert.equal(stemByLemma('zahlt', lexicon), stemByLemma('zahlen', lexicon));
    assert.equal(stemByLemma('Gefahren.', lexicon), stemGermanWord('fahren'));
  });

  it('keeps the own stem of unknown words and of lemmas with different stems', () => {
    assert.equal(stemByLemma('Hausaufgaben', lexicon), stemGermanWord('hausaufgaben'));
    assert.equal(stemByLemma('Bank', lexicon), stemGermanWord('bank'));
  });

  it('needs a lexicon port', () => {
    assert.throws(() => stemByLemma('zahlt'), TypeError);
  });
});
