import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeLetter } from './helpers/gradeLetter.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const checkGermanA1Grammar = (text) => resolveLevelContext('A1').grammar.checkLetter(text);
import { questions } from '../src/data/exams/seeds/schreiben-modellsatz-4.js';

describe('Schreiben Semantic Adversarial & Linguistic Invariant Suite', () => {
  const modellsatz4Teil2 = questions.find(q => q.id === 's4-q6');

  // The rules are rubric data of s4-q6 (semantic_slots, conversive_rules); these letters are not bench or gold letters.
  const holidayLetter = (reason, question) => `Liebe Frau Hansen,
${reason} Wir sind drei Personen. Wir möchten vom 3. bis 10. August bleiben. ${question}
Viele Grüße
Jonas Keller`;
  const booking = 'wir möchten im August Urlaub machen und Ihre Wohnung buchen.';

  // reglament: distorted but understandable from the task → partly fulfilled (1.5), as "vermieten" for "mieten"
  it('asking the price of the pet and whether the flat is allowed distorts point 3 (Sinnentstellung)', async () => {
    const res = await gradeLetter(holidayLetter(booking, 'Was kostet die Katze? Ist das Zimmer erlaubt?'), modellsatz4Teil2);
    assert.equal(res.breakdown.items[2].score, 1);
    assert.match(res.breakdown.items[2].frameErrors.map((e) => e.explanation).join(' '), /Sinnentstellung/i);
    assert.deepEqual(res.grammar_errors.filter((e) => e.code === 'ERR_SEMANTIC_ROLE_INVERSION').map((e) => e.original), ['die Katze', 'das Zimmer']);
  });

  it('the same questions with the roles in place are no inversion', async () => {
    for (const question of ['Was kostet die Wohnung pro Nacht? Darf unsere Katze mitkommen?', 'Wie viel kostet eine Nacht? Ist eine Katze erlaubt?']) {
      const res = await gradeLetter(holidayLetter(booking, question), modellsatz4Teil2);
      assert.equal(res.breakdown.items[2].score, 2, question);
      assert.equal(res.grammar_errors.some((e) => e.code === 'ERR_SEMANTIC_ROLE_INVERSION'), false, question);
    }
  });

  it('"vermieten" instead of "mieten" makes point 1 partial and is reported, not scored beyond it', async () => {
    const question = 'Was kostet die Wohnung pro Nacht? Darf unsere Katze mitkommen?';
    const wrong = await gradeLetter(holidayLetter('wir möchten im August Ihre Wohnung vermieten.', question), modellsatz4Teil2);
    const right = await gradeLetter(holidayLetter('wir möchten im August Ihre Wohnung mieten.', question), modellsatz4Teil2);
    assert.equal(wrong.breakdown.items[0].score, 1);
    assert.match(wrong.breakdown.items[0].frameErrors.map((e) => e.explanation).join(' '), /mieten.*nicht.*vermieten/i);
    assert.ok(wrong.grammar_errors.some((e) => e.code === 'ERR_CONVERSIVE_VERB_DIRECTION'));
    assert.equal(right.breakdown.items[0].score, 2);
    // Partial point 1 costs 1.5 (3 → 1.5); nothing else changes
    assert.equal(right.points_earned - wrong.points_earned, 1.5);
  });

  // Known limits (todo.md, P1): recorded, not fitted
  it('persons named without a numeral fulfil "Personen"', { todo: 'personCountDetector counts numerals only' }, async () => {
    const res = await gradeLetter(holidayLetter(booking, 'Was kostet die Wohnung pro Nacht? Darf unsere Katze mitkommen?')
      .replace('Wir sind drei Personen.', 'Ich komme mit meiner Frau und meinem Sohn.'), modellsatz4Teil2);
    assert.equal(res.breakdown.items[1].score, 2);
  });

  it('asking the price of a person distorts point 3 as the price of a pet does', { todo: '"Sohn" has no person category in the lexicon' }, async () => {
    const res = await gradeLetter(holidayLetter(booking, 'Wie viel kostet mein Sohn? Darf unsere Katze mitkommen?'), modellsatz4Teil2);
    assert.equal(res.breakdown.items[2].score, 1);
  });

  it('Case 3: Dative Preposition with Feminine Determiner (mit meine Familie)', async () => {
    const text = 'Ich fahre im Sommer mit meine Familie nach Berlin.';
    const errors = checkGermanA1Grammar(text);

    const dativeErr = errors.find(e => e.code === 'ERR_PREP_CASE_DAT');
    assert.ok(dativeErr, 'Must detect ERR_PREP_CASE_DAT for "mit meine Familie"');
    assert.equal(dativeErr.original, 'mit meine Familie');
    assert.equal(dativeErr.correction, 'mit meiner Familie');
  });

  it('Case 4: Dative Preposition with Numeral + Plural Noun (mit zwei Erwachsene)', async () => {
    const text = 'Wir reisen mit zwei Erwachsene und einem Kind.';
    const errors = checkGermanA1Grammar(text);

    const dativeErr = errors.find(e => e.code === 'ERR_PREP_CASE_DAT');
    assert.ok(dativeErr, 'Must detect ERR_PREP_CASE_DAT for "mit zwei Erwachsene"');
    assert.equal(dativeErr.original, 'mit zwei Erwachsene');
    assert.equal(dativeErr.correction, 'mit zwei Erwachsenen');
  });

  it('Case 5: Genuine A1 Sample Solution receives full score (10/10) with zero false positives', async () => {
    const sampleText = `Sehr geehrte Frau Hansen,

ich möchte im Juli eine Ferienwohnung an der Ostsee mieten. Wir sind zwei Erwachsene und ein Kind und möchten vom 10. bis 17. Juli bleiben. Wie viel kostet die Wohnung und sind Hunde erlaubt?

Mit freundlichen Grüßen
David Weber`;

    const res = await gradeLetter(sampleText, modellsatz4Teil2);

    assert.equal(res.points_earned, 10);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.items[0].score, 2);
    assert.equal(res.breakdown.items[1].score, 2);
    assert.equal(res.breakdown.items[2].score, 2);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length, 0);
  });

  it('Case 6: Missing predicate in question (Wie viel der Preis für die Wohnung?)', async () => {
    const res = await gradeLetter(holidayLetter(booking, 'Wie viel der Preis für die Wohnung? Darf unsere Katze mitkommen?'), modellsatz4Teil2);
    const correct = await gradeLetter(holidayLetter(booking, 'Wie viel kostet die Wohnung? Darf unsere Katze mitkommen?'), modellsatz4Teil2);

    // The question stays understandable: the error is flagged as feedback but costs no points at A1
    assert.equal(res.points_earned, correct.points_earned);
    assert.deepEqual(res.breakdown.items.map((item) => item.score), [2, 2, 2]);
    const missingVerbErr = res.grammar_errors.find(e => e.code === 'ERR_MISSING_PREDICATE_QUESTION');
    assert.ok(missingVerbErr, 'Must detect ERR_MISSING_PREDICATE_QUESTION');
    assert.match(missingVerbErr.original, /Wie viel der Preis/i);
  });

  it('Case 7: Missing copula verb in declarative clause (Das Zimmer sehr schön.)', async () => {
    const text = 'Das Zimmer sehr schön.';
    const errors = checkGermanA1Grammar(text);

    const copulaErr = errors.find(e => e.code === 'ERR_MISSING_COPULA_VERB');
    assert.ok(copulaErr, 'Must detect ERR_MISSING_COPULA_VERB for "Das Zimmer sehr schön."');
  });
});
