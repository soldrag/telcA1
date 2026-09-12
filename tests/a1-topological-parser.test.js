import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSentenceTopology } from '../src/services/schreiben/linguistic/topologicalFieldParser.js';
import { segmentMacroStructure } from '../src/services/schreiben/linguistic/macroSegmenter.js';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';

describe('A1 Topological Field Model & Linguistic Engine', () => {
  describe('Positive syntax cases (No false positives)', () => {
    it('accepts NP constituent in Vorfeld without V2 errors', () => {
      const res = parseSentenceTopology('Mein Chef hat keine Zeit.');
      assert.equal(res.errors.length, 0);
    });

    it('accepts coordinated subject-ellipsis across "und"', () => {
      const res = parseSentenceTopology('Leider muss ich länger arbeiten und kann nicht kommen.');
      assert.equal(res.errors.length, 0);
    });

    it('allows polite pronoun "Sie" capitalized after comma in Anrede', () => {
      const text = 'Sehr geehrte Damen und Herren,\nSie haben mir gestern geschrieben.';
      const macro = segmentMacroStructure(text);
      assert.equal(macro.anrede.recognized, true);
      assert.equal(macro.commaWarning, null);
    });

    it('does NOT flag "Rufen Sie mich zurück" as a dative error', () => {
      const errors = checkGermanA1Grammar('Rufen Sie mich zurück bitte.');
      const originals = errors.map(e => e.original.toLowerCase());
      assert.equal(originals.includes('rufen sie mich'), false);
      assert.equal(originals.includes('mich'), false);
    });
  });

  describe('Negative syntax and grammar cases (Proper detection)', () => {
    it('detects V2 violation with temporal complex in Vorfeld', () => {
      const res = parseSentenceTopology('am Montag um 14 Uhr ich habe keine Zeit');
      assert.equal(res.errors.length, 1);
      assert.equal(res.errors[0].code, 'ERR_V2_OVERCROWDED_VORFELD');
      assert.match(res.errors[0].correction, /am Montag um 14 Uhr habe ich/);
    });

    it('detects broken Satzklammer with modal verb', () => {
      const res = parseSentenceTopology('Können wir machen ein neuer Termin am Dienstag?');
      assert.equal(res.errors.length, 1);
      assert.equal(res.errors[0].code, 'ERR_BROKEN_SATZKLAMMER_MODAL');
      assert.match(res.errors[0].correction, /ein neuer Termin am Dienstag machen/);
    });

    it('detects "für der Termin" and suggests "für den Termin"', () => {
      const errors = checkGermanA1Grammar('Ich habe keine Zeit für der Termin.');
      const akkErr = errors.find(e => e.code === 'ERR_PREP_CASE_AKK');
      assert.ok(akkErr, 'ERR_PREP_CASE_AKK should be detected');
      assert.match(akkErr.correction, /für den Termin/);
    });

    it('detects uncountable mass noun error "zu viele Arbeiten"', () => {
      const errors = checkGermanA1Grammar('Der Chef gibt mir zu viele Arbeiten.');
      const massErr = errors.find(e => e.code === 'ERR_UNCOUNTABLE_MASS_NOUN');
      assert.ok(massErr, 'ERR_UNCOUNTABLE_MASS_NOUN should be detected');
      assert.match(massErr.correction, /zu viel Arbeit/);
    });

    it('detects masculine adjective declension in salutation "Liebe Herr"', () => {
      const macro = segmentMacroStructure('Liebe Herr Doktor Schneider,\nich schreibe Ihnen.');
      assert.equal(macro.anrede.recognized, true);
      assert.equal(macro.anrede.score, 1);
      assert.match(macro.anrede.error.correction, /Lieber Herr/);
    });
  });

  describe('Screenshot Regression Case (Full Letter Evaluation)', () => {
    const question = {
      max_points: 10,
      options_json: {
        type: 'essay',
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Termin absagen', keywords: ['montag', '14', 'keine zeit', 'absagen', 'termin'] },
            { id: 'lp2', label: 'Grund (Arbeit/Chef)', keywords: ['chef', 'arbeiten', 'arbeit'] },
            { id: 'lp3', label: 'Neuer Termin', keywords: ['dienstag', 'neuer termin', 'termin', 'rufen'] }
          ]
        }
      }
    };

    const userText = `Liebe Herr Doktor Schneider,
am Montag um 14 Uhr ich habe keine Zeit für der Termin. Der Chef gibt mir zu viele Arbeiten heute und morgen. Können wir machen ein neuer Termin am Dienstag? Rufen Sie mich zurück bitte.
Schöne Grüße!
Artem Smirnov`;

    it('recognizes salutation and closing without regex breakdowns', () => {
      const res = evaluateTeil2Essay(userText, question);
      assert.equal(res.detected.salutation, 'Liebe Herr Doktor Schneider,');
      assert.equal(res.detected.closing, 'Schöne Grüße!');
      assert.equal(res.detected.hasName, true);
      assert.equal(res.breakdown.anrede, 1); // Recognized with declension typo
      assert.equal(res.breakdown.gruss, 2);   // Formula + Name
    });

    it('segments all 3 Leitpunkte accurately', () => {
      const res = evaluateTeil2Essay(userText, question);
      const lp = res.user_segments.leitpunkte;
      assert.match(lp[0].userSentence, /Montag/i);
      assert.match(lp[1].userSentence, /Chef|Arbeiten/i);
      assert.match(lp[2].userSentence, /Dienstag/i);
      assert.equal(res.breakdown.leitpunkte, 6);
    });

    it('detects all 6 real grammatical errors and avoids the false dative hallucination', () => {
      const res = evaluateTeil2Essay(userText, question);
      const originals = res.grammar_errors.map(e => e.original.toLowerCase());

      assert.ok(originals.some(o => o.includes('liebe herr')), 'Should detect "Liebe Herr"');
      assert.ok(originals.some(o => o.includes('am montag um 14 uhr ich habe')), 'Should detect V2 violation');
      assert.ok(originals.some(o => o.includes('machen ein neuer termin')), 'Should detect Satzklammer');
      assert.ok(originals.some(o => o.includes('für der termin')), 'Should detect "für der"');
      assert.ok(originals.some(o => o.includes('zu viele arbeiten')), 'Should detect "zu viele Arbeiten"');
      assert.ok(originals.some(o => o.includes('ein neuer termin')), 'Should detect "ein neuer Termin"');

      // Crucial: Rufen Sie mich must NOT be flagged!
      assert.equal(originals.some(o => o.includes('rufen sie mich')), false);
      assert.equal(originals.some(o => o.includes('mich')), false);

      // Score: 1 (Anrede) + 6 (LP) + 2 (Gruß) - 3 (Penalty for 6 errors) = 6 points
      assert.equal(res.points_earned, 6);
      assert.equal(res.is_correct, true);
    });
  });
});
