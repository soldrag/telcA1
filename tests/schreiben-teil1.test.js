import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { areDatesEquivalent } from '../src/services/schreiben/schreibenDateNormalizer.js';
import { areNumbersEquivalent } from '../src/services/schreiben/schreibenNumberNormalizer.js';
import { compareFormAnswer } from '../src/services/schreiben/schreibenFormAnswerFacts.js';
import { evaluateTeil1Answer } from '../src/services/schreiben/schreibenTeil1Evaluator.js';
import { telcA1Regulation } from '../src/services/schreiben/regulations/index.js';

const accepts = (answer, expected) => telcA1Regulation.acceptsTeil1Answer(compareFormAnswer(answer, expected));

describe('Schreiben Teil 1 Smart Form Evaluator', () => {
  it('normalizes various date formats into canonical representations', () => {
    assert.equal(areDatesEquivalent('18/07', '18. Juli'), true);
    assert.equal(areDatesEquivalent('18 juli 2024', '18.07.'), true);
    assert.equal(areDatesEquivalent('Juli 18', '18. Juli'), true);
    assert.equal(areDatesEquivalent('Montag, 18. Juli', 'Freitag, 18. Juli'), false, 'another weekday');
    assert.equal(areDatesEquivalent('1.500', '1.5.'), false, 'a thousands dot is not a year');
    assert.equal(areDatesEquivalent('18. Juli', '18.07'), true);
    assert.equal(areDatesEquivalent('18.07.', '18. Juli'), true);
    assert.equal(areDatesEquivalent('19. Juli', '18.07'), false);
  });

  it('normalizes numbers written as digits or German words', () => {
    assert.equal(areNumbersEquivalent('fünfzehn', '15'), true);
    assert.equal(areNumbersEquivalent('03', '3'), true);
    assert.equal(areNumbersEquivalent('3', 'drei'), true);
    assert.equal(areNumbersEquivalent('drei personen', '3'), true);
    assert.equal(areNumbersEquivalent('4', 'drei'), false);
  });

  it('matches words with typos or umlaut variations using fuzzy matching', () => {
    assert.equal(accepts('Kreditkrate', 'Kreditkarte'), true);
    assert.equal(accepts('Doppelzimer', 'Doppelzimmer'), true);
    assert.equal(accepts('Doppelzimmer', 'Doppelzimmer'), true);
    // Short words should not match different words
    assert.equal(accepts('bar', 'bad'), false);
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
  // Official telc A1 rating of Teil 1 (Übungstest 1, Bewertung der Schriftlichen Prüfung)
  it('accepts only unambiguously correct numbers and dates: no typo tolerance for digits', () => {
    const qDate = { correct_answer: '18. juli|18.07' };
    assert.equal(evaluateTeil1Answer('18.7.', qDate), true);
    assert.equal(evaluateTeil1Answer('19.07', qDate), false);
    assert.equal(evaluateTeil1Answer('12354', { correct_answer: '12345' }), false);
    assert.equal(evaluateTeil1Answer('12', { correct_answer: '21' }), false);
    assert.equal(accepts('1907', '1807'), false);
  });

  it('accepts a misspelling that sounds like the expected word ("donastag" for Donnerstag)', () => {
    const qDay = { correct_answer: 'Donnerstag' };
    assert.equal(evaluateTeil1Answer('donastag', qDay), true);
    assert.equal(evaluateTeil1Answer('am Donastag', qDay), true);
    assert.equal(evaluateTeil1Answer('Dienstag', qDay), false);
    assert.equal(evaluateTeil1Answer('Mittwoch', qDay), false);
    assert.equal(evaluateTeil1Answer('Sonntag', { correct_answer: 'Montag' }), false);
    assert.equal(evaluateTeil1Answer('Fata', { correct_answer: 'Vater' }), true);
  });

  it('accepts misspelled words of a multi-word answer, each word on its own', () => {
    const qFood = { correct_answer: 'italienische küche' };
    assert.equal(evaluateTeil1Answer('italienishe Kuche', qFood), true);
    assert.equal(evaluateTeil1Answer('französische Küche', qFood), false);
    assert.equal(evaluateTeil1Answer('am Sonntag', { correct_answer: 'am Montag' }), false);
    assert.equal(evaluateTeil1Answer('mit Kasse', { correct_answer: 'mit Karte' }), false);
  });

  it('accepts a number only with the same words beside it', () => {
    const qYear = { correct_answer: '1 jahr|jahreskarte' };
    assert.equal(evaluateTeil1Answer('ein Jahr', qYear), true);
    assert.equal(evaluateTeil1Answer('ein Monat', qYear), false);
    assert.equal(evaluateTeil1Answer('18. Juni', { correct_answer: '18. juli|18.07' }), false);
    assert.equal(areNumbersEquivalent('drei Personen', '3'), true);
    assert.equal(evaluateTeil1Answer('zwei Kinder', { correct_answer: '2 Kinder und 1 Erwachsener' }), false);
    assert.equal(evaluateTeil1Answer('zwei Kinder und ein Erwachsener', { correct_answer: '2 Kinder und 1 Erwachsener' }), true);
    assert.equal(evaluateTeil1Answer('eine Woche', { correct_answer: '1 Woche' }), true);
  });

  it('pairs each number with the words it counts, in any order', () => {
    const qGuests = { correct_answer: '2 Kinder und 1 Erwachsener' };
    assert.equal(evaluateTeil1Answer('ein Erwachsener und zwei Kinder', qGuests), true);
    assert.equal(evaluateTeil1Answer('1 Kind und 2 Erwachsene', qGuests), false);
    assert.equal(evaluateTeil1Answer('3 Erwachsene und 2 Kinder', { correct_answer: '2 Erwachsene und 3 Kinder' }), false);
    assert.equal(evaluateTeil1Answer('1 großes Zimmer', { correct_answer: '1 Zimmer' }), true);
  });

  it('reads a date written with spaces, a month abbreviation or a year, and compares the year', () => {
    assert.equal(evaluateTeil1Answer('18. 7.', { correct_answer: '18. Juli' }), true);
    assert.equal(evaluateTeil1Answer('15. Nov.', { correct_answer: '15. November' }), true);
    assert.equal(evaluateTeil1Answer('am 18.7.', { correct_answer: '18. Juli' }), true);
    assert.equal(evaluateTeil1Answer('12.03.94', { correct_answer: '12.03.1994' }), true);
    assert.equal(evaluateTeil1Answer('12.03.1995', { correct_answer: '12.03.1994' }), false);
    assert.equal(evaluateTeil1Answer('1.12.', { correct_answer: '11.2.' }), false);
  });

  it('accepts no answer that offers a choice, and one whose expected answer is itself a choice', () => {
    assert.equal(evaluateTeil1Answer('Montag oder Donnerstag', { correct_answer: 'Donnerstag' }), false);
    assert.equal(evaluateTeil1Answer('Leipzig oder Dresden', { correct_answer: 'Leipzig' }), false);
    assert.equal(evaluateTeil1Answer('Donnerstag', { correct_answer: 'Donnerstag' }), true);
    assert.equal(evaluateTeil1Answer('bis 18 Uhr', { correct_answer: '18 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('Montag oder Donnerstag', { correct_answer: 'Montag oder Donnerstag' }), true);
  });

  it('accepts no answer that writes another number beside the right one', () => {
    assert.equal(evaluateTeil1Answer('am 18. Juni oder 18. Juli', { correct_answer: '18. Juli' }), false);
    assert.equal(evaluateTeil1Answer('1 Jahr oder 1 Monat', { correct_answer: '1 Jahr' }), false);
    assert.equal(evaluateTeil1Answer('3 oder 4', { correct_answer: '3' }), false);
  });

  it('reads a number with its unit symbol, a time, a thousands dot and words before the number', () => {
    assert.equal(evaluateTeil1Answer('25 €', { correct_answer: '25 Euro' }), true);
    assert.equal(evaluateTeil1Answer('25,00 Euro', { correct_answer: '25 Euro' }), true);
    assert.equal(evaluateTeil1Answer('1.500 Euro', { correct_answer: '1500 Euro' }), true);
    assert.equal(evaluateTeil1Answer('14 Uhr', { correct_answer: '14:00' }), true);
    assert.equal(evaluateTeil1Answer('14:30', { correct_answer: '14 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('Erwachsene: 2, Kind: 1', { correct_answer: '2 erwachsene 1 kind' }), true);
    assert.equal(evaluateTeil1Answer('Kinder 3 und Erwachsene 2', { correct_answer: '2 Erwachsene und 3 Kinder' }), true);
  });

  it('accepts a usual abbreviation with a dot, not any word start', () => {
    assert.equal(evaluateTeil1Answer('Poststr. 14', { correct_answer: 'Poststraße 14' }), true);
    assert.equal(evaluateTeil1Answer('2 Erw. 1 Kind', { correct_answer: '2 Erwachsene 1 Kind' }), true);
    assert.equal(evaluateTeil1Answer('Post 14', { correct_answer: 'Poststraße 14' }), false);
    assert.equal(evaluateTeil1Answer('Jun.', { correct_answer: 'Juli' }), false);
    assert.equal(evaluateTeil1Answer('2 Erw., 1 Kind', { correct_answer: '2 Erwachsene 1 Kind' }), true);
    assert.equal(evaluateTeil1Answer('Do.', { correct_answer: 'Donnerstag' }), true);
    assert.equal(evaluateTeil1Answer('Kre.', { correct_answer: 'Kreditkarte' }), false, 'not a usual abbreviation');
  });

  it('reads the answer as the type of the expected answer: a date, a time, a digit sequence or an amount', () => {
    assert.equal(evaluateTeil1Answer('08.05.1996', { correct_answer: '05.08.1996' }), false, 'day and month swapped');
    assert.equal(evaluateTeil1Answer('12.03.2094', { correct_answer: '12.03.1994' }), false);
    assert.equal(evaluateTeil1Answer('15./16. November', { correct_answer: '15. November' }), false);
    assert.equal(evaluateTeil1Answer('um 9', { correct_answer: '9 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('09:00', { correct_answer: '9 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('14.30', { correct_answer: '14:30' }), true);
    assert.equal(evaluateTeil1Answer('14:00 bis 15:00', { correct_answer: '14 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('0176 123 45 67', { correct_answer: '0176 1234567' }), true);
    assert.equal(evaluateTeil1Answer('1234567 0176', { correct_answer: '0176 1234567' }), false);
    assert.equal(evaluateTeil1Answer('12.50 €', { correct_answer: '12,50 Euro' }), true);
    assert.equal(evaluateTeil1Answer('Hauptstraße 5a', { correct_answer: 'Hauptstraße 5' }), false);
  });

  it('compares the counted word in any grammatical form, and a fraction changes the amount', () => {
    assert.equal(evaluateTeil1Answer('vier Person', { correct_answer: '4 Personen' }), true);
    assert.equal(evaluateTeil1Answer('2 Erwachsene 1 Kinder', { correct_answer: '2 Erwachsene 1 Kind' }), true);
    assert.equal(evaluateTeil1Answer('ein halbes Jahr', { correct_answer: '1 Jahr' }), false);
    assert.equal(evaluateTeil1Answer('ein Jahr oder 2 Jahre', { correct_answer: 'ein Jahr' }), false);
  });

  it('does not grade a note in brackets', () => {
    assert.equal(evaluateTeil1Answer('3 (drei)', { correct_answer: '3' }), true);
    assert.equal(evaluateTeil1Answer('3 Personen (2 Erwachsene, 1 Kind)', { correct_answer: '3' }), true);
    assert.equal(evaluateTeil1Answer('12.03.1994 (30 Jahre)', { correct_answer: '12.03.1994' }), true);
  });

  it('reads a thousands dot as a number, a time only with its own words, and a note that offers another answer', () => {
    assert.equal(evaluateTeil1Answer('1500 Euro', { correct_answer: '1.500 Euro' }), true);
    assert.equal(evaluateTeil1Answer('1.5 Euro', { correct_answer: '1.500 Euro' }), false);
    assert.equal(evaluateTeil1Answer('9 Euro', { correct_answer: '9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('halb 9', { correct_answer: '9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('Dienstag, 9 Uhr', { correct_answer: 'Montag, 9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('18. Juli (oder 19. Juli)', { correct_answer: '18. Juli' }), false);
    assert.equal(evaluateTeil1Answer('(030) 123456', { correct_answer: '030 123456' }), true);
    assert.equal(evaluateTeil1Answer('0176-1234567', { correct_answer: '01761234567' }), true);
    assert.equal(evaluateTeil1Answer('€25', { correct_answer: '25 Euro' }), true);
    assert.equal(evaluateTeil1Answer('fünfzehn Uhr', { correct_answer: '15 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('Jul.', { correct_answer: 'Juli' }), true);
  });

  it('reads a decimal dot, a time with a part of the day, a comma before the year, and keeps a leading zero of a code', () => {
    assert.equal(evaluateTeil1Answer('12.50', { correct_answer: '12,50 Euro' }), true);
    assert.equal(evaluateTeil1Answer('morgens um 9', { correct_answer: '9 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('Montag morgens 9 Uhr', { correct_answer: 'Montag, 9 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('9 Minuten', { correct_answer: '9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('7. Mai, 1990', { correct_answer: '07.05.1990' }), true);
    assert.equal(evaluateTeil1Answer('4109 Leipzig', { correct_answer: '04109 Leipzig' }), false);
    assert.equal(evaluateTeil1Answer('4 Personen (2 Erwachsene, 2 Kinder)', { correct_answer: '2 Erwachsene, 2 Kinder' }), true);
  });

  it('checks a written year against the expected forms that write one', () => {
    const qBirth = { correct_answer: '05.08.1996', options_json: { accepted_answers: ['05.08.'] } };
    assert.equal(evaluateTeil1Answer('05.08.1995', qBirth), false);
    assert.equal(evaluateTeil1Answer('5.8.96', qBirth), true);
    assert.equal(evaluateTeil1Answer('05.08.', qBirth), true);
    assert.equal(evaluateTeil1Answer('am 05.08.1995 geboren', qBirth), false);
    assert.equal(evaluateTeil1Answer('5. August 1995 in Porto', qBirth), false);
    assert.equal(evaluateTeil1Answer('05.08.1996 in Porto', qBirth), true);
  });

  it('reads a time as a whole and puts a part of the day on its half of the clock', () => {
    assert.equal(evaluateTeil1Answer('9 Euro', { correct_answer: '9:00' }), false);
    assert.equal(evaluateTeil1Answer('9 Minuten', { correct_answer: '9 Uhr', options_json: { accepted_answers: ['9:00'] } }), false);
    assert.equal(evaluateTeil1Answer('Montag, 9:00', { correct_answer: '9:00' }), true);
    assert.equal(evaluateTeil1Answer('abends um 9', { correct_answer: '9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('Montag abends 9 Uhr', { correct_answer: 'Montag, 9 Uhr' }), false);
    assert.equal(evaluateTeil1Answer('abends um 8', { correct_answer: '20 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('2:30 nachmittags', { correct_answer: '14:30' }), true);
    assert.equal(evaluateTeil1Answer('mittags um 12', { correct_answer: '12 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('nachts um 11', { correct_answer: '23 Uhr' }), true);
    assert.equal(evaluateTeil1Answer('morgens um 20 Uhr', { correct_answer: '20 Uhr' }), false);
  });

  it('keeps the typo tolerance of a word beside a number, but not of the number', () => {
    assert.equal(evaluateTeil1Answer('Hauptstrase 5', { correct_answer: 'Hauptstraße 5' }), true);
    assert.equal(evaluateTeil1Answer('3 Nachte', { correct_answer: '3 Nächte' }), true);
    assert.equal(evaluateTeil1Answer('Hauptstraße 6', { correct_answer: 'Hauptstraße 5' }), false);
    assert.equal(evaluateTeil1Answer('am 19. Juli', { correct_answer: '18. Juli' }), false);
  });

  it('gives a number word no typo tolerance, but still tolerates a typo beside the article "eine"', () => {
    assert.equal(evaluateTeil1Answer('nein', { correct_answer: 'neun' }), false);
    assert.equal(evaluateTeil1Answer('vier', { correct_answer: 'Bier' }), false);
    assert.equal(evaluateTeil1Answer('eine Tase Kaffee', { correct_answer: 'eine Tasse Kaffee' }), true);
  });

  it('does not take another month or weekday for a typo, but tolerates a misspelt one', () => {
    assert.equal(evaluateTeil1Answer('Juni', { correct_answer: 'Juli' }), false);
    assert.equal(evaluateTeil1Answer('im Juni', { correct_answer: 'Juli' }), false);
    assert.equal(evaluateTeil1Answer('Mondtag', { correct_answer: 'Montag' }), true);
    assert.equal(evaluateTeil1Answer('Dinstag', { correct_answer: 'Dienstag' }), true);
    assert.equal(evaluateTeil1Answer('Maerz', { correct_answer: 'März' }), true);
    assert.equal(evaluateTeil1Answer('am Sontag', { correct_answer: 'am Montag' }), false, 'sounds like Sonntag');
    assert.equal(evaluateTeil1Answer('Juny', { correct_answer: 'Juli' }), false, 'nearer to Juni');
  });

  // Limit (todo.md, P1): a final "ch" for "g" is how "Tag" sounds in the north, but "ch = g at the end" also
  // joins Flug and Fluch, Teig and Teich, so the rule is not introduced.
  it('accepts "Donerstach" for Donnerstag', { todo: 'final ch for g joins real words (Flug/Fluch)' }, () => {
    assert.equal(evaluateTeil1Answer('Donerstach', { correct_answer: 'Donnerstag' }), true);
  });
});
