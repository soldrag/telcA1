/**
 * General German verb dictionary (de.wiktionary via german-verbs-database): verbs outside the A1 list are
 * recognised as verbs, conjugated by person and number, and generate agreement corrections. Sentences are
 * written for these rules, not taken from eval or bench letters.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { lookupWord } from '../src/services/schreiben/linguistic/a1LexiconService.js';

const readings = (word) => lookupWord(word).map((e) => `${e.pos}:${e.lemma}${e.person ? `:${e.person.join('')}${e.number}` : ''}`);
const corrections = (text) => checkGermanA1Grammar(text).map((e) => e.correction);

describe('Verb dictionary: forms', () => {
  it('present forms from the table, plural and "ihr" from the infinitive', () => {
    assert.deepEqual(readings('spreche'), ['VERB_FIN:sprechen:1sg']);
    assert.deepEqual(readings('spricht'), ['VERB_FIN:sprechen:3sg']);
    assert.deepEqual(readings('sprecht'), ['VERB_FIN:sprechen:2pl']);
    assert.ok(readings('wisst').includes('VERB_FIN:wissen:2pl'), 'not the archaic imperative "wisset"');
    assert.ok(readings('rechnet').includes('VERB_FIN:rechnen:2pl'));
  });

  it('past and participle', () => {
    assert.ok(readings('sprachen').includes('VERB_FIN:sprechen:13pl'));
    assert.deepEqual(readings('gelesen'), ['VERB_PART:lesen']);
  });

  it('a separable verb is an infinitive with its base verb', () => {
    const [entry] = lookupWord('fernsehen');
    assert.equal(entry.valency, 'SEP');
    assert.equal(entry.baseVerb, 'sehen');
  });

  it('A1 entries win over the dictionary', () => {
    assert.ok(lookupWord('komme').every((e) => e.source !== 'dictionary'));
  });
});

describe('Verb dictionary: grammar', () => {
  for (const text of ['Ich spreche mit dem Kunden.', 'Ich lese gern Bücher.', 'Ihr sprecht gut Deutsch.',
    'Weißt du, wann der Kurs beginnt?', 'Ich weiß nicht, wo das Hotel ist.', 'Ich komme morgen, wann beginnt der Kurs?']) {
    it(`clean: ${text}`, () => assert.deepEqual(corrections(text), []));
  }

  for (const [text, correction] of [['Ich spricht Deutsch.', 'spreche'], ['Er sprechen Deutsch.', 'spricht'],
    ['Du lese gern.', 'liest'], ['Morgen ich komme.', 'Morgen komme ich']]) {
    it(`${text} → ${correction}`, () => assert.ok(corrections(text).some((c) => c.includes(correction)), JSON.stringify(corrections(text))));
  }
});
