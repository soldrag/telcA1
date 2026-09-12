import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';
import { questions as ms4Questions } from '../server/seeds/schreiben-modellsatz-4.js';

describe('Schreiben Teil 2 Benchmark Corpus (Gold Standard)', () => {
  const modellsatz1Question = {
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'a1', 'machen', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit/Dauer', keywords: ['wochen', 'zeit', 'vormittag', 'lernen'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'anmelden', 'anmeldung', 'informationen', 'wie viel'], requiredMatches: 2 }
        ]
      }
    }
  };

  const modellsatz2Question = {
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Termin absagen', keywords: ['termin', 'absagen', 'montag', 'nicht kommen'], requiredMatches: 2 },
          { id: 'lp2', label: 'Grund', keywords: ['krank', 'fieber', 'überstunden', 'arbeit', 'arbeiten'], requiredMatches: 1 },
          { id: 'lp3', label: 'Neuer Termin', keywords: ['dienstag', 'mittwoch', 'woche', 'verschieben', 'neuer termin'], requiredMatches: 1 }
        ]
      }
    }
  };

  it('Test 1: User Text #2 (Language school, hybrid salutation, modal syntax, capitalization, 2 questions in Punkt 3)', () => {
    const text = `Hallo Damen und Herren,
ich besuche wollen einen deutschkurs im August. Ich habe vier wochen Zeit und ich am vormittag lernen möchte. Was kosten der Kurs? Bitte senden Sie mir die informationen für die anmeldung.
Viele Grüße
Artem Smirnov`;

    const res = evaluateTeil2Essay(text, modellsatz1Question);
    
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
    // Realistic score: 6-8 out of 10 (Raw: 1+6+2=9 minus 2 penalty = 7)
    assert.equal(res.points_earned >= 6 && res.points_earned <= 8, true);
  });

  it('Test 2: User Text #1 (Language school, formal greeting, 6 typical errors)', () => {
    const text = `Sehr geehrte Damen und Herren,
ich will in August ein Deutschkurs A1 machen. Ich habe Zeit vier Wochen und ich will lernen am Vormittag. Wie viel kostet der Kurs?
Wie kann ich anmelden?
Mit freundlichen Gruß
Artem Smirnov`;

    const res = evaluateTeil2Essay(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length >= 5, true);
    assert.equal(res.points_earned, 7);
  });

  it('Test 3: Modellsatz 2 Doctor cancellation (Strong submission without errors)', () => {
    const text = `Sehr geehrte Frau Dr. Schneider,
ich habe am Montag um 14 Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil ich arbeiten muss. Können wir den Termin auf nächsten Dienstag verschieben?
Mit freundlichen Grüßen
Max Mustermann`;

    const res = evaluateTeil2Essay(text, modellsatz2Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length, 0);
    assert.equal(res.points_earned, 10);
  });

  it('Test 4: Modellsatz 2 Doctor cancellation (Moderate errors, single name)', () => {
    const text = `Guten Tag Herr Schneider,
ich kann am montag nicht kommen zu Termin. Ich bin sehr krank und habe fieber. Geht es am mittwoch?
Viele Grusse
Olga`;

    const res = evaluateTeil2Essay(text, modellsatz2Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    // Single name Olga gives 1 point for closing
    assert.equal(res.breakdown.gruss >= 1, true);
    assert.equal(res.grammar_errors.length >= 1, true);
    assert.equal(res.points_earned >= 7 && res.points_earned <= 9, true);
  });

  it('Test 5: Incomplete text (missing Punkt 3 and closing, under word count)', () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte Deutschkurs machen im August. Ich habe vier Wochen Urlaub.`;

    const res = evaluateTeil2Essay(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.gruss, 0);
    assert.equal(res.breakdown.items[2].score, 0);
    assert.equal(res.points_earned <= 5, true);
  });

  it('Test 6: Tricky User Text #4 (Satzklammer, adverbial fronting, wrong prepositions, adjective ending)', () => {
    const text = `Sehr geehrte Damen und Herren,
ich will besuchen einen Deutschkurs für August. Nächsten Monat ich habe vier Wochen Zeit und ich möchte am Vormittag studieren. Sagen Sie mir bitte, wie viel kostet der Kurs? Ich möchte mich auf den Kurs anmelden.
Mit freundliche Grüßen
Artem Smirnov`;

    const res = evaluateTeil2Essay(text, modellsatz1Question);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.breakdown.grammar_penalty, 2);
    assert.equal(res.points_earned, 8);
    assert.equal(res.grammar_errors.length, 5);

    // Verify correct mapping across all 3 Leitpunkte despite complex phrasing
    assert.match(res.user_segments.leitpunkte[0].userSentence, /deutschkurs für august/i);
    assert.match(res.user_segments.leitpunkte[1].userSentence, /vormittag studieren/i);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /wie viel kostet der kurs/i);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /anmelden/i);
  });

  it('Test 7: Pure word repetition / gibberish gets 0 points', () => {
    const text = `hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo`;
    const res = evaluateTeil2Essay(text, modellsatz1Question);
    assert.equal(res.points_earned, 0);
  });

  it('Test 8: Modellsatz 4 Semantic Role Inversion (Wie viel kostet der Hund? Ist die Wohnung erlaubt?)', () => {
    const ms4Teil2 = ms4Questions.find(q => q.id === 's4-q6');
    const text = `Sehr geehrte Frau Hansen,
ich möchte gern eine Ferienwohnung mieten. Wir sind zwei Erwachsene und ein Kind. Wir bleiben vom 10. bis zum 17. Juli. Wie viel kostet der Hund? Ist die Wohnung erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = evaluateTeil2Essay(text, ms4Teil2);
    // Punkt 3 must receive 0 points due to Sinnentstellung
    assert.equal(res.breakdown.items[2].score, 0);
    assert.match(res.breakdown.items[2].detail, /Sinnentstellung/i);
    // Total score must be penalised (max 7/10)
    assert.ok(res.points_earned <= 7);
  });

  it('Test 9: Modellsatz 4 Conversive Verb Confusion (Ferienwohnung vermieten statt mieten)', () => {
    const ms4Teil2 = ms4Questions.find(q => q.id === 's4-q6');
    const text = `Sehr geehrte Frau Hansen,
ich möchte Ihre Ferienwohnung vermieten. Wir sind zwei Erwachsene und ein Kind. Wir kommen vom 10. bis zum 17. Juli. Wie viel kostet die Wohnung? Ist ein Hund erlaubt?
Mit freundlichen Grüßen
Alex Müller`;

    const res = evaluateTeil2Essay(text, ms4Teil2);
    // Punkt 1 is capped to 1 point due to conversive verb error
    assert.equal(res.breakdown.items[0].score, 1);
    assert.match(res.breakdown.items[0].detail, /mieten.*nicht.*vermieten/i);
    // Must be penalized and report lexical error
    assert.ok(res.points_earned <= 8);
    assert.ok(res.grammar_errors.some(e => e.code === 'ERR_CONVERSIVE_VERB_DIRECTION'));
  });
});
