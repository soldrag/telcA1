/**
 * Counterexamples from the independent review of v0.7.89 (general noun dictionary). Weak masculine nouns keep
 * their oblique singular, a sg/pl-ambiguous form is resolved by its article, and a bare dictionary word (a name
 * like "Maria") is not read as a noun. Sentences are the review's own, not bench or eval text.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { lookupDictionaryNoun } from '../src/services/schreiben/linguistic/germanNounDictionary.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

const corrections = (text) => checkGermanA1Grammar(text).map((e) => e.correction);

describe('Noun dictionary: correct sentences stay clean', () => {
  for (const text of [
    'Maria kommt morgen.', 'Ich gehe mit Maria ins Kino.', 'Ich sehe den Kunden.', 'Ich frage den Studenten.',
    'Ich helfe dem Studenten.', 'Ich helfe dem Nachbarn.', 'Ich frage den Polizisten.', 'Ich helfe dem Praktikanten.',
    'Ich sehe den Kollegen.', 'Kommt Paula morgen?', 'Ich gehe mit Julia.', 'Der Joghurt ist lecker.', 'Das Joghurt ist lecker.',
    'Der Lehrer kommt.', 'Die Lehrer kommen.', 'Bringt Anna Bier mit?', 'Habe keine Zeit.',
  ]) {
    it(text, () => assert.deepEqual(corrections(text), []));
  }
});

describe('Noun dictionary: errors are found', () => {
  for (const [text, correction] of [
    ['Die Kollegen ist nett.', 'sind'],
    ['Ich komme mit die Kollegen.', 'mit den Kollegen'],
    ['Die Lehrer kommt.', 'kommen'],
    ['Die Kunden ist zufrieden.', 'sind'],
    ['Ich frage den Student.', 'den Studenten'],
    ['Ich kaufe einen Fahrkarte.', 'eine Fahrkarte'],
    ['Ich habe zwei Kollege.', 'zwei Kollegen'],
  ]) {
    it(`${text} → ${correction}`, () => assert.ok(corrections(text).includes(correction), JSON.stringify(corrections(text))));
  }
});

describe('Noun dictionary data', () => {
  const numbers = (form) => lookupDictionaryNoun(form).map((e) => `${e.lemma}:${e.number}`);

  it('a weak masculine oblique form is a singular form too ("Kunden")', () => {
    assert.ok(numbers('Kunden').includes('Kunde:sg'));
    assert.ok(numbers('Kunden').includes('Kunde:pl'));
  });

  it('the archaic dative -e is not a singular form ("Termine" is plural only)', () => {
    assert.deepEqual([...new Set(numbers('Termine'))], ['Termin:pl']);
  });

  it('the lexicon port loads once and resolves on repeat', async () => {
    assert.equal(typeof A1_GRAMMAR_PROFILE.lexicon.load, 'function');
    const first = A1_GRAMMAR_PROFILE.lexicon.load();
    assert.ok(first instanceof Promise);
    await first;
    await A1_GRAMMAR_PROFILE.lexicon.load();
  });
});
