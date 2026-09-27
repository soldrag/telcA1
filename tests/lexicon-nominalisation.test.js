import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tagTokens } from '../src/services/schreiben/linguistic/a1LexiconService.js';
import { parseSentencePropositions } from '../src/services/schreiben/linguistic/clauseStructureParser.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

const posOf = (sentence, word) => tagTokens(sentence.split(' ')).find((t) => t.raw === word)?.pos;

describe('A capitalised verb form after a preposition or article is a noun', () => {
  const nominal = [
    ['Wir sprechen über die Kosten', 'Kosten'],
    ['Ich lese beim Essen', 'Essen'],
    ['Er fragt nach Kosten', 'Kosten'],
  ];
  for (const [sentence, word] of nominal) {
    it(`"${word}" in "${sentence}" is a noun`, () => {
      assert.equal(posOf(sentence, word), 'NOUN');
    });
  }

  it('the preposition before it stays a preposition and the finite verb stays the predicate', () => {
    assert.equal(posOf('Er fragt nach Kosten', 'nach'), 'PREP');
    const [clause] = parseSentencePropositions('Er fragt nach Kosten.', A1_GRAMMAR_PROFILE);
    assert.equal(clause.predicateCore.baseAction, 'fragen');
  });

  const verbal = [['ich Komme gern', 'Komme'], ['Ich kann gut Lernen', 'Lernen']];
  for (const [sentence, word] of verbal) {
    it(`a learner-capitalised verb "${word}" outside a nominal context stays a verb`, () => {
      assert.match(posOf(sentence, word), /^VERB/);
    });
  }
});
