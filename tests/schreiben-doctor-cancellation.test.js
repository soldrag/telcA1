import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeLetter } from './helpers/gradeLetter.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { analyzeSalutation } from '../src/services/schreiben/salutationAnalyzer.js';
import { DIAGNOSTIC_CODES } from '../src/services/schreiben/feedback/feedbackContracts.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const A1 = resolveLevelContext('A1');

describe('Doctor cancellation regression (screenshot case)', () => {
  const question = {
    max_points: 10,
    options_json: {
      type: 'essay',
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund für Ihr Schreiben (Termin am Montag absagen)', intent: 'APPOINTMENT_CANCEL', keywords: ['termin', 'absagen', 'montag', 'nicht kommen', 'kann nicht', '14'], requiredMatches: 2 },
          { id: 'lp2', label: 'Warum (Überstunden oder Arbeit)', intent: 'REASON_EXPLANATION', keywords: ['arbeiten', 'arbeit', 'überstunden', 'ueberstunden', 'krank', 'länger'], requiredMatches: 1 },
          { id: 'lp3', label: 'Neuer Terminvorschlag (Dienstag oder Mittwoch)', intent: 'APPOINTMENT_PROPOSAL', evidence: 'temporal', keywords: ['dienstag', 'mittwoch', 'nächste woche', 'neuen termin', 'neuer termin', 'zeit', 'termin'], requiredMatches: 2 }
        ]
      }
    }
  };

  const studentText = `Sehr geehrte Herr Dr. Schneider,
ich muss leider absagen mein Termin am Montag um 14:00 Uhr. Ich kann nicht kommen, weil ich muss machen viele Überstunden auf der Arbeit. Geht es am Dienstag oder Mittwoch? Bitte antworten Sie mich.
Mit freundlichen Gruß
Artem Smirnov`;

  // reglament §6 Teil 2: a declension slip in an appropriate formula is a hint, not a lost point.
  it('recognizes "Sehr geehrte Herr Dr. Schneider" as appropriate anrede with a declension hint', async () => {
    const res = analyzeSalutation('Sehr geehrte Herr Dr. Schneider,\nich muss absagen.', { isFormal: true, grammar: A1.grammar });
    assert.equal(res.recognized, true);
    assert.equal(res.score, 2);
    assert.equal(res.diagnosticCode, DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW);
    assert.match(res.correction, /Sehr geehrter Herr/);

    const correct = analyzeSalutation('Sehr geehrter Herr Dr. Schneider,\nich muss absagen.', { isFormal: true, grammar: A1.grammar });
    assert.equal(correct.recognized, true);
    assert.equal(correct.score, 2);
  });

  it('assigns the cancellation sentence to Leitpunkt 1 (no phantom empty point)', async () => {
    const res = await gradeLetter(studentText, question);
    const segments = res.user_segments.leitpunkte;
    assert.match(segments[0].userSentence, /absagen/i);
    assert.match(segments[1].userSentence, /Überstunden|Arbeit/i);
    assert.match(segments[2].userSentence, /Dienstag|Mittwoch/i);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.gruss, 2);
  });

  it('detects the three previously missed grammar errors', async () => {
    const res = await gradeLetter(studentText, question);
    const originals = res.grammar_errors.map(e => e.original.toLowerCase());
    assert.ok(originals.some(o => o.includes('sehr geehrte herr')), 'missing "Sehr geehrte Herr"');
    assert.ok(originals.some(o => o.includes('mein termin')), 'missing "mein Termin"');
    assert.ok(originals.some(o => o.includes('antworten sie mich')), 'missing "antworten Sie mich"');
    assert.equal(res.grammar_errors.length >= 5, true);
    // Errors are feedback only at A1, the declined Anrede included: 9 + KG 1
    assert.equal(res.points_earned, 10);
  });

  it('correctly handles the Praxis-Team cancellation letter from screenshot', async () => {
    const text = `Sehr geehrte Praxis-Team,
ich schreibe, weil ich kann nicht kommen zu mein Termin am Montag um 14 Uhr. Ich muss lange arbeiten wegen die Überstunden. Passt es Ihnen an Dienstag oder Mittwoch?
Bitte geben Sie mir Bescheid.
Mit freundlichen Gruß,
Artem Smirnov`;

    const res = await gradeSchreibenSubmission({ userText: text, question, options: { forceLimitedMode: true } });

    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.items[2].score, 2); // Punkt 3 proposal recognized
    assert.equal(res.breakdown.gruss, 2);

    const originals = res.grammar_errors.map(e => e.original.toLowerCase());
    assert.ok(originals.some(o => o.includes('weil ich kann nicht kommen')), 'missing weil word order');
    assert.ok(originals.some(o => o.includes('zu mein termin')), 'missing zu mein Termin');
    assert.ok(originals.some(o => o.includes('an dienstag')), 'missing an Dienstag');
    assert.ok(originals.some(o => o.includes('wegen die überstunden')), 'missing wegen die Überstunden');
    assert.equal(res.is_correct, true);
    assert.equal(res.points_earned, 10);
  });

  it('correctly handles the second doctor cancellation letter without Punkt 3 segmentation collapse', async () => {
    const text = `Guten Tag Herr Dr. Schneider,
ich kann zu der Termin am Montag um 14:00 Uhr nicht kommen. Ich habe sehr viel zu tun bei mein Arbeit. Haben Sie vielleicht Zeit an Donnerstag oder Freitag? Bitte rufen Sie an mich zurück.
Viele Grüße,`;

    const res = await gradeSchreibenSubmission({ userText: text, question, options: { forceLimitedMode: true } });

    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 9);
    assert.equal(res.breakdown.gruss, 1); // missing sender name
    assert.equal(res.points_earned, 9.5);

    // Verify segmentation: Punkt 3 must NOT be empty!
    assert.match(res.user_segments.leitpunkte[0].userSentence, /14:00/);
    assert.match(res.user_segments.leitpunkte[1].userSentence, /bei mein Arbeit/);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /Donnerstag oder Freitag/);
    assert.doesNotMatch(res.user_segments.leitpunkte[2].userSentence, /Kein Satz/);

    // Verify detection of the 3 previously missed errors + 2 existing
    const originals = res.grammar_errors.map(e => e.original.toLowerCase());
    assert.ok(originals.some(o => o.includes('zu der termin')), 'detects zu der Termin');
    assert.ok(originals.some(o => o.includes('bei mein arbeit')), 'detects bei mein Arbeit');
    assert.ok(originals.some(o => o.includes('an mich zurück')), 'detects an mich zurück');
    assert.ok(originals.some(o => o.includes('an donnerstag')), 'detects an Donnerstag');
    assert.ok(originals.some(o => o.includes('viele grüße')), 'detects comma after closing');
  });
});
