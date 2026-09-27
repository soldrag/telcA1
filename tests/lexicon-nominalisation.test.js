import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tagTokens } from '../src/services/schreiben/linguistic/a1LexiconService.js';
import { parseSentencePropositions } from '../src/services/schreiben/linguistic/clauseStructureParser.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

const posOf = (sentence, word) => tagTokens(sentence.split(' ')).find((t) => t.raw === word)?.pos;

describe('A capitalised verb form in a nominal context is a noun', () => {
  it('tags "Kosten" after a preposition as a noun and "nach" as its preposition', () => {
    assert.equal(posOf('Ich frage nicht nach Kosten', 'Kosten'), 'NOUN');
    assert.equal(posOf('Ich frage nicht nach Kosten', 'nach'), 'PREP');
  });

  it('keeps the asking verb as the predicate', () => {
    const [clause] = parseSentencePropositions('Ich frage nicht nach Kosten.', A1_GRAMMAR_PROFILE);
    assert.equal(clause.predicateCore.baseAction, 'fragen');
  });

  it('keeps a learner-capitalised verb after a pronoun a verb', () => {
    assert.match(posOf('ich Komme gern', 'Komme'), /^VERB/);
  });
});
