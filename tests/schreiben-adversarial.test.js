import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeLetter } from './helpers/gradeLetter.js';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { questions } from '../src/data/exams/seeds/schreiben-modellsatz-4.js';

describe('Schreiben Semantic Adversarial & Linguistic Invariant Suite', () => {
  const modellsatz4Teil2 = questions.find(q => q.id === 's4-q6');

  it('Case 1: Semantic Role Inversion (Wie viel kostet der Hund? Ist die Wohnung erlaubt?)', async () => {
    const text = `Sehr geehrte Frau Hansen,
ich möchte gern eine Ferienwohnung mieten. Wir sind zwei Erwachsene und ein Kind. Wir bleiben vom 10. bis zum 17. Juli. Wie viel kostet der Hund? Ist die Wohnung erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = await gradeLetter(text, modellsatz4Teil2);

    // Punkt 3 MUST NOT receive 2 points due to role inversion (dog purchase vs apartment rental)
    assert.equal(res.breakdown.items[2].score, 0);
    assert.match(res.breakdown.items[2].frameErrors.map((e) => e.explanation).join(' '), /Sinnentstellung/i);
    // Overall points must not be 10/10
    assert.ok(res.points_earned <= 7, `Expected points <= 7, got ${res.points_earned}`);
    // Semantic errors must be flagged in grammar_errors
    const hasInversionError = res.grammar_errors.some(e => e.code === 'ERR_SEMANTIC_ROLE_INVERSION');
    assert.ok(hasInversionError, 'Must detect ERR_SEMANTIC_ROLE_INVERSION');
  });

  it('Case 2: Conversive Verb Direction (Ferienwohnung vermieten statt mieten)', async () => {
    const text = `Sehr geehrte Frau Hansen,
ich möchte Ihre Ferienwohnung vermieten. Wir sind zwei Erwachsene und ein Kind. Wir kommen vom 10. bis zum 17. Juli. Wie viel kostet die Wohnung? Ist ein Hund erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = await gradeLetter(text, modellsatz4Teil2);

    // Punkt 1 MUST NOT receive 2 points because "vermieten" inverts tenant/landlord roles
    assert.equal(res.breakdown.items[0].score, 1);
    assert.match(res.breakdown.items[0].frameErrors.map((e) => e.explanation).join(' '), /mieten.*nicht.*vermieten/i);
    // Partial LP1 (1.5) + 3 + 3 + KG 1: the role inversion costs half of point 1, not the whole letter
    assert.equal(res.points_earned, 8.5);
    // Lexical conversive error must be flagged
    const hasConversiveError = res.grammar_errors.some(e => e.code === 'ERR_CONVERSIVE_VERB_DIRECTION');
    assert.ok(hasConversiveError, 'Must detect ERR_CONVERSIVE_VERB_DIRECTION');
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
    const text = `Sehr geehrte Frau Hansen,
ich möchte Ihre Ferienwohnung mieten. Wir sind zwei Erwachsene und ein Kind. Wir bleiben vom 10. bis zum 17. Juli. Wie viel der Preis für die Wohnung? Darf mein Hund mitkommen?
Mit freundlichen Grüßen
Alex Müller`;

    const res = await gradeLetter(text, modellsatz4Teil2);

    // The question stays understandable: the error is flagged as feedback but costs no points at A1
    assert.equal(res.points_earned, 10);
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
