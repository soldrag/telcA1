import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGermanDate, areDatesEquivalent } from '../src/services/schreiben/schreibenDateNormalizer.js';
import { normalizeGermanNumber, areNumbersEquivalent } from '../src/services/schreiben/schreibenNumberNormalizer.js';
import { isFuzzyWordMatch } from '../src/services/schreiben/schreibenFuzzyMatcher.js';
import { evaluateTeil1Answer } from '../src/services/schreiben/schreibenTeil1Evaluator.js';

describe('Schreiben Teil 1 Smart Form Evaluator', () => {
  it('normalizes various date formats into canonical representations', () => {
    assert.equal(normalizeGermanDate('18. Juli'), '18.07');
    assert.equal(normalizeGermanDate('18.07.'), '18.07');
    assert.equal(normalizeGermanDate('18.7.'), '18.07');
    assert.equal(normalizeGermanDate('18/07'), '18.07');
    assert.equal(normalizeGermanDate('18 juli 2024'), '18.07');

    assert.equal(areDatesEquivalent('18. Juli', '18.07'), true);
    assert.equal(areDatesEquivalent('18.07.', '18. Juli'), true);
    assert.equal(areDatesEquivalent('19. Juli', '18.07'), false);
  });

  it('normalizes numbers written as digits or German words', () => {
    assert.equal(normalizeGermanNumber('drei'), '3');
    assert.equal(normalizeGermanNumber('3'), '3');
    assert.equal(normalizeGermanNumber('3 Personen'), '3');
    assert.equal(normalizeGermanNumber('zwei'), '2');

    assert.equal(areNumbersEquivalent('3', 'drei'), true);
    assert.equal(areNumbersEquivalent('drei personen', '3'), true);
    assert.equal(areNumbersEquivalent('4', 'drei'), false);
  });

  it('matches words with typos or umlaut variations using fuzzy matching', () => {
    assert.equal(isFuzzyWordMatch('Kreditkrate', 'Kreditkarte'), true);
    assert.equal(isFuzzyWordMatch('Doppelzimer', 'Doppelzimmer'), true);
    assert.equal(isFuzzyWordMatch('Doppelzimmer', 'Doppelzimmer'), true);
    // Short words should not match different words
    assert.equal(isFuzzyWordMatch('bar', 'bad'), false);
  });

  it('evaluates Teil 1 answers comprehensively', () => {
    const qName = { correct_answer: 'bauer', options_json: { accepted_answers: ['bauer', 'familie bauer'] } };
    assert.equal(evaluateTeil1Answer('Bauer', qName), true);
    assert.equal(evaluateTeil1Answer('Familie Bauer', qName), true);
    assert.equal(evaluateTeil1Answer('Müller', qName), false);

    const qDate = { correct_answer: '18. juli|18.07' };
    assert.equal(evaluateTeil1Answer('18. Juli', qDate), true);
    assert.equal(evaluateTeil1Answer('18.07.', qDate), true);
    assert.equal(evaluateTeil1Answer('18.7', qDate), true);

    const qNum = { correct_answer: '3', options_json: { accepted_answers: ['3', 'drei'] } };
    assert.equal(evaluateTeil1Answer('drei', qNum), true);
    assert.equal(evaluateTeil1Answer('3 personen', qNum), true);

    const qPayment = { correct_answer: 'kreditkarte', options_json: { accepted_answers: ['kreditkarte'] } };
    assert.equal(evaluateTeil1Answer('mit Kreditkarte', qPayment), true);
    assert.equal(evaluateTeil1Answer('Kreditkrate', qPayment), true); // 1 typo tolerance
    assert.equal(evaluateTeil1Answer('bar', qPayment), false);
  });
});
