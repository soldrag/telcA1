import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { groupKeywordConcepts, countMatchedConcepts } from '../src/services/schreiben/linguistic/keywordConcepts.js';
import { keywordThreshold } from '../src/services/schreiben/grading/rivalEvidence.js';
import { evaluateCriterionKeywords } from '../src/services/schreiben/grading/stage2Leitpunkte.js';

const ENTRIES = {
  zahlen: [{ pos: 'VERB_INF', lemma: 'zahlen' }],
  zahlt: [{ pos: 'VERB_FIN', lemma: 'zahlen' }],
  karte: [{ pos: 'NOUN', lemma: 'Karte' }],
  karten: [{ pos: 'NOUN', lemma: 'Karte' }],
  bar: [{ pos: 'ADV', lemma: 'bar' }],
  ich: [{ pos: 'PRON', lemma: 'ich' }],
};
const lexicon = { lookup: (w) => ENTRIES[String(w).toLowerCase()] || null, findForms: () => [], tag: (ws) => ws };

describe('keyword concepts (level-agnostic, stub lexicon port)', () => {
  it('groups forms of one lemma and one stem into a single concept', () => {
    assert.deepEqual(groupKeywordConcepts(['zahlen', 'zahlt', 'karte', 'karten', 'bar'], lexicon),
      [['zahlen', 'zahlt'], ['karte', 'karten'], ['bar']]);
  });

  it('counts a keyword matched through two spellings once', () => {
    const words = 'Ich zahlt bar'.split(' ');
    assert.equal(countMatchedConcepts(['zahlen', 'zahlt', 'karte'], words, lexicon), 1);
    assert.equal(countMatchedConcepts(['zahlen', 'zahlt', 'bar'], words, lexicon), 2);
  });

  it('caps the threshold by the number of concepts the rubric lists', () => {
    assert.equal(keywordThreshold({ keywords: ['zahlen', 'zahlt'], requiredMatches: 2 }, lexicon), 1);
    assert.equal(keywordThreshold({ keywords: ['zahlen', 'zahlt', 'karte'], requiredMatches: 2 }, lexicon), 2);
    assert.equal(keywordThreshold({ keywords: ['zahlen', 'karte', 'bar'] }, lexicon), 2);
  });

  it('one concept named in two forms is partial keyword coverage, two concepts are full', () => {
    const criterion = { id: 'pay', keywords: ['zahlen', 'zahlt', 'karte'], requiredMatches: 2 };
    assert.equal(evaluateCriterionKeywords(['Ich zahlen und zahlt.'], criterion, { lexicon }).score, 1);
    assert.equal(evaluateCriterionKeywords(['Ich zahlt mit Karte.'], criterion, { lexicon }).score, 2);
  });
});
