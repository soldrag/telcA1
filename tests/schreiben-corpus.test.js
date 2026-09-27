import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeLetter } from './helpers/gradeLetter.js';
import { questions as ms4Questions } from '../src/data/exams/seeds/schreiben-modellsatz-4.js';

describe('Schreiben Teil 2 Benchmark Corpus (Gold Standard)', () => {
  const modellsatz1Question = {
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund', intent: 'REASON_EXPLANATION', keywords: ['deutschkurs', 'kurs', 'a1', 'machen', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit/Dauer', intent: 'GENERAL', evidence: 'temporal', keywords: ['wochen', 'zeit', 'vormittag', 'lernen'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten/Anmeldung', intent: 'INFORMATION_REQUEST', keywords: ['kosten', 'kostet', 'anmelden', 'anmeldung', 'informationen', 'wie viel'], requiredMatches: 2 }
        ]
      }
    }
  };

  const modellsatz2Question = {
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Termin absagen', intent: 'APPOINTMENT_CANCEL', keywords: ['termin', 'absagen', 'montag', 'nicht kommen'], requiredMatches: 2 },
          { id: 'lp2', label: 'Grund', intent: 'REASON_EXPLANATION', keywords: ['krank', 'fieber', 'überstunden', 'arbeit', 'arbeiten'], requiredMatches: 1 },
          { id: 'lp3', label: 'Neuer Termin', intent: 'APPOINTMENT_PROPOSAL', evidence: 'temporal', keywords: ['dienstag', 'mittwoch', 'woche', 'verschieben', 'neuer termin'], requiredMatches: 1 }
        ]
      }
    }
  };

  it('Test 1: User Text #2 (Language school, hybrid salutation, modal syntax, capitalization, 2 questions in Punkt 3)', async () => {
    const text = `Hallo Damen und Herren,
ich besuche wollen einen deutschkurs im August. Ich habe vier wochen Zeit und ich am vormittag lernen möchte. Was kosten der Kurs? Bitte senden Sie mir die informationen für die anmeldung.
Viele Grüße
Artem Smirnov`;

    const res = await gradeLetter(text, modellsatz1Question);
    
    // Punkt 3 must capture both sentences!
    const p3Sentence = res.user_segments.leitpunkte[2].userSentence;
    assert.match(p3Sentence, /Was kosten der Kurs/i);
    assert.match(p3Sentence, /anmeldung/i);

    // Salutation is recognized with partial score
    assert.equal(res.breakdown.anrede >= 1, true);
    // Closing is recognized with full name
    assert.equal(res.breakdown.gruss >= 1, true);
    // Grammar errors detected: besuche wollen, Was kosten, syntax nach und, Nomen-Großschreibung
    assert.equal(res.grammar_errors.length >= 3, true);
    // telc A1: all points understandable (9) + KG 0.5 (hybrid salutation); grammar is feedback only
    assert.equal(res.points_earned, 9.5);
  });

  it('Test 2: User Text #1 (Language school, formal greeting, 6 typical errors)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich will in August ein Deutschkurs A1 machen. Ich habe Zeit vier Wochen und ich will lernen am Vormittag. Wie viel kostet der Kurs?
Wie kann ich anmelden?
Mit freundlichen Gruß
Artem Smirnov`;

    const res = await gradeLetter(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length >= 5, true);
    assert.equal(res.points_earned, 10);
  });

  it('Test 3: Modellsatz 2 Doctor cancellation (Strong submission without errors)', async () => {
    const text = `Sehr geehrte Frau Dr. Schneider,
ich habe am Montag um 14 Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil ich arbeiten muss. Können wir den Termin auf nächsten Dienstag verschieben?
Mit freundlichen Grüßen
Max Mustermann`;

    const res = await gradeLetter(text, modellsatz2Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length, 0);
    assert.equal(res.points_earned, 10);
  });

  it('Test 4: Modellsatz 2 Doctor cancellation (Moderate errors, single name)', async () => {
    const text = `Guten Tag Herr Schneider,
ich kann am montag nicht kommen zu Termin. Ich bin sehr krank und habe fieber. Geht es am mittwoch?
Viele Grusse
Olga`;

    const res = await gradeLetter(text, modellsatz2Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    // Single name Olga gives 1 point for closing
    assert.equal(res.breakdown.gruss >= 1, true);
    assert.equal(res.grammar_errors.length >= 1, true);
    assert.equal(res.points_earned, 9.5);
  });

  it('Test 5: Incomplete text (missing Punkt 3 and closing, under word count)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte Deutschkurs machen im August. Ich habe vier Wochen Urlaub.`;

    const res = await gradeLetter(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.gruss, 0);
    assert.equal(res.breakdown.items[2].score, 0);
    // reglament/telc-a1.md Teil 2: ~30 words is a guide, not a criterion — "im August" + "vier Wochen"
    // fulfil Zeit/Dauer, so only the missing Punkt 3 and Gruß cost points: 3 + 3 + 0 + 0.5.
    assert.equal(res.points_earned, 6.5);
  });

  it('Test 6: Tricky User Text #4 (Satzklammer, adverbial fronting, wrong prepositions, adjective ending)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich will besuchen einen Deutschkurs für August. Nächsten Monat ich habe vier Wochen Zeit und ich möchte am Vormittag studieren. Sagen Sie mir bitte, wie viel kostet der Kurs? Ich möchte mich auf den Kurs anmelden.
Mit freundliche Grüßen
Artem Smirnov`;

    const res = await gradeLetter(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.points_earned, 10);
    // "einen Deutschkurs für August" is correct German, so it is no longer flagged.

    assert.equal(res.grammar_errors.length, 4);

    // Verify correct mapping across all 3 Leitpunkte despite complex phrasing
    assert.match(res.user_segments.leitpunkte[0].userSentence, /deutschkurs für august/i);
    assert.match(res.user_segments.leitpunkte[1].userSentence, /vormittag studieren/i);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /wie viel kostet der kurs/i);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /anmelden/i);
  });

  it('Test 7: Pure word repetition / gibberish gets 0 points', async () => {
    const text = `hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo`;
    const res = await gradeLetter(text, modellsatz1Question);
    assert.equal(res.points_earned, 0);
  });

  it('Test 8: Modellsatz 4 Semantic Role Inversion (Wie viel kostet der Hund? Ist die Wohnung erlaubt?)', async () => {
    const ms4Teil2 = ms4Questions.find(q => q.id === 's4-q6');
    const text = `Sehr geehrte Frau Hansen,
ich möchte gern eine Ferienwohnung mieten. Wir sind zwei Erwachsene und ein Kind. Wir bleiben vom 10. bis zum 17. Juli. Wie viel kostet der Hund? Ist die Wohnung erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = await gradeLetter(text, ms4Teil2);
    // Punkt 3 must receive 0 points due to Sinnentstellung
    assert.equal(res.breakdown.items[2].score, 0);
    assert.match(res.breakdown.items[2].frameErrors.map((e) => e.explanation).join(' '), /Sinnentstellung/i);
    // Total score must be penalised (max 7/10)
    assert.ok(res.points_earned <= 7);
  });

  it('Test 9: Modellsatz 4 Conversive Verb Confusion (Ferienwohnung vermieten statt mieten)', async () => {
    const ms4Teil2 = ms4Questions.find(q => q.id === 's4-q6');
    const text = `Sehr geehrte Frau Hansen,
ich möchte Ihre Ferienwohnung vermieten. Wir sind zwei Erwachsene und ein Kind. Wir kommen vom 10. bis zum 17. Juli. Wie viel kostet die Wohnung? Ist ein Hund erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = await gradeLetter(text, ms4Teil2);
    // Punkt 1 is capped to 1 point due to conversive verb error
    assert.equal(res.breakdown.items[0].score, 1);
    assert.match(res.breakdown.items[0].frameErrors.map((e) => e.explanation).join(' '), /mieten.*nicht.*vermieten/i);
    // Partial point 1 costs 1.5 (3 → 1.5); the lexical error itself is reported, not scored
    assert.equal(res.points_earned, 8.5);
    assert.ok(res.grammar_errors.some(e => e.code === 'ERR_CONVERSIVE_VERB_DIRECTION'));
  });
});
