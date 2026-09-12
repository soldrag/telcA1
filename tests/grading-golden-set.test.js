import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenTeil2 } from '../src/services/schreiben/grading/gradingFacade.js';

describe('Grading Golden Set (10-15 Reference Letters, Algorithmic Determinism)', () => {
  const modellsatz1Question = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund für das Schreiben (Deutschkurs)', keywords: ['deutschkurs', 'kurs', 'a1', 'machen', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit und Dauer (Vormittag, 4 Wochen)', keywords: ['wochen', 'zeit', 'vormittag', 'lernen', 'stunden'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten und Anmeldung', keywords: ['kosten', 'kostet', 'anmelden', 'anmeldung', 'informationen', 'wie viel'], requiredMatches: 2 }
        ]
      }
    }
  };

  const modellsatz2Question = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Termin absagen', keywords: ['termin', 'absagen', 'montag', 'nicht kommen'], requiredMatches: 2 },
          { id: 'lp2', label: 'Grund für die Absage', keywords: ['krank', 'fieber', 'überstunden', 'arbeit', 'arbeiten'], requiredMatches: 1 },
          { id: 'lp3', label: 'Neuer Termin', keywords: ['dienstag', 'mittwoch', 'woche', 'verschieben', 'neuer termin'], requiredMatches: 1 }
        ]
      }
    }
  };

  const options = { forceLimitedMode: true }; // Deterministic algorithmic evaluation

  it('1. Modellsatz 1 Perfect Submission (Score 10/10)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule besuchen. Ich habe vier Wochen Zeit und möchte gern am Vormittag lernen. Wie viel kostet der Kurs und wie kann ich mich anmelden?
Mit freundlichen Grüßen
Maximilian Becker`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_penalty, 0);
    assert.equal(res.points_earned, 10);
    assert.equal(res.is_correct, true);
  });

  it('2. Modellsatz 1 Typical A1 Submission with typical errors (Score 7-8/10)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich will in August ein Deutschkurs A1 machen. Ich habe Zeit vier Wochen und ich will lernen am Vormittag. Wie viel kostet der Kurs? Wie kann ich anmelden?
Mit freundlichen Gruß
Artem Smirnov`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_errors.length >= 3, true);
    assert.equal(res.points_earned >= 7 && res.points_earned <= 8, true);
  });

  it('3. Modellsatz 1 Missing Anrede (Score 0 for Anrede)', async () => {
    const text = `Ich möchte im August einen Deutschkurs A1 besuchen. Ich habe vier Wochen Zeit und möchte am Vormittag lernen. Wie viel kostet der Kurs?
Viele Grüße
Anna Müller`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 0);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.points_earned <= 8, true);
  });

  it('4. Modellsatz 1 Missing LP3 (Score 0 for LP3)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte einen Deutschkurs im August machen. Ich habe vier Wochen Zeit.
Mit freundlichen Grüßen
Sarah Meyer`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.items[2].score, 0); // LP3 missing
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.points_earned <= 8, true);
  });

  it('5. Modellsatz 1 Missing Gruß & Name (Score 0 for Gruß)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte einen Deutschkurs im August machen. Ich habe vier Wochen Zeit am Vormittag. Wie viel kostet der Kurs und wie kann ich mich anmelden?`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.gruss, 0);
    assert.equal(res.points_earned <= 8, true);
  });

  it('6. Modellsatz 2 Doctor Cancellation Perfect (Score 10/10)', async () => {
    const text = `Sehr geehrte Frau Dr. Schneider,
ich habe am Montag um 14 Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil ich arbeiten muss. Können wir den Termin auf nächsten Dienstag verschieben?
Mit freundlichen Grüßen
Max Mustermann`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz2Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.grammar_penalty, 0);
    assert.equal(res.points_earned, 10);
  });

  it('7. Modellsatz 2 Moderate errors with single name (Score 7-9/10)', async () => {
    const text = `Guten Tag Herr Schneider,
ich kann am montag nicht kommen zu Termin. Ich bin sehr krank und habe fieber. Geht es am mittwoch?
Viele Grusse
Olga`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz2Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 1); // Single name gives 1
    assert.equal(res.points_earned >= 7 && res.points_earned <= 9, true);
  });

  it('8. Modellsatz 2 Informal greeting in formal context (Score 1 for Anrede)', async () => {
    const text = `Hallo Herr Schneider,
ich kann am Montag leider nicht kommen. Ich bin krank. Können wir den Termin verschieben?
Mit freundlichen Grüßen
Thomas Mann`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz2Question, options });
    assert.equal(res.breakdown.anrede, 1);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
  });

  it('9. Extremely short / incomplete submission (<15 words)', async () => {
    const text = `Hallo Herr Schneider, ich kann nicht kommen. Danke.`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz2Question, options });
    assert.equal(res.word_count < 15, true);
    assert.equal(res.points_earned <= 4, true);
  });

  it('10. Pure word repetition / gibberish gets 0 points', async () => {
    const text = `hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.points_earned, 0);
    assert.equal(res.is_correct, false);
  });

  it('11. Complex syntax with adverbial fronting & Satzklammer (Realistic 7-8/10)', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich will besuchen einen Deutschkurs für August. Nächsten Monat ich habe vier Wochen Zeit und ich möchte am Vormittag studieren. Sagen Sie mir bitte, wie viel kostet der Kurs? Ich möchte mich auf den Kurs anmelden.
Mit freundliche Grüßen
Artem Smirnov`;

    const res = await gradeSchreibenTeil2({ userText: text, question: modellsatz1Question, options });
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 6);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(res.points_earned, 8);
  });

  it('12. Algorithmic determinism: two runs produce identical scores and breakdown', async () => {
    const sampleText = `Sehr geehrte Damen und Herren,
ich will im August einen Deutschkurs A1 machen. Ich habe vier Wochen Zeit und möchte am Vormittag lernen. Wie viel kostet der Kurs?
Mit freundlichen Grüßen
Klara Weber`;

    const run1 = await gradeSchreibenTeil2({ userText: sampleText, question: modellsatz1Question, options });
    const run2 = await gradeSchreibenTeil2({ userText: sampleText, question: modellsatz1Question, options });

    assert.equal(run1.points_earned, run2.points_earned);
    assert.equal(run1.grammar_penalty, run2.grammar_penalty);
    assert.deepEqual(run1.criteria_breakdown, run2.criteria_breakdown);
    assert.deepEqual(run1.grammar_errors, run2.grammar_errors);
    assert.equal(run1.feedback_summary, run2.feedback_summary);
  });
});
