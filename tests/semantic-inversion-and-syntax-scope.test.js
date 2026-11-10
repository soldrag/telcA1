import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSentenceTopology } from '../src/services/schreiben/linguistic/topologicalFieldParser.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

describe('Syntax Scope & Subordinate Clause Coordination', () => {
  it('does not fire ERR_V2_OVERCROWDED_VORFELD on coordinated subordinate clause with und', () => {
    const sentence = '..., weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.';
    const res = parseSentenceTopology(sentence, A1_GRAMMAR_PROFILE);
    assert.equal(res.errors.length, 0);
  });

  it('still detects genuine V2 violations in main clauses', () => {
    const sentence = 'Am Montag ich komme.';
    const res = parseSentenceTopology(sentence, A1_GRAMMAR_PROFILE);
    assert.equal(res.errors.length, 1);
    assert.equal(res.errors[0].code, 'ERR_V2_OVERCROWDED_VORFELD');
  });
});
