import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSalutation } from '../src/services/schreiben/salutationAnalyzer.js';
import { analyzeClosing } from '../src/services/schreiben/closingAnalyzer.js';
import { analyzeGermanQuality } from '../src/services/schreiben/germanQualityAnalyzer.js';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';

describe('Schreiben Teil 2 Essay Evaluator', () => {
  it('analyzes salutations accurately', () => {
    const formal = analyzeSalutation('Sehr geehrte Damen und Herren,\nich brauche Hilfe.');
    assert.equal(formal.recognized, true);
    assert.equal(formal.score, 2);

    const informal = analyzeSalutation('Hallo Peter,\nwie geht es dir?', { isFormal: true });
    assert.equal(informal.recognized, true);
    assert.equal(informal.score, 1);

    const missing = analyzeSalutation('Ich möchte einen Kurs machen.');
    assert.equal(missing.recognized, false);
    assert.equal(missing.score, 0);
  });

  it('analyzes closing formulas and sender names', () => {
    const withName = analyzeClosing('Mit freundlichen Grüßen,\nAnna Schmidt');
    assert.equal(withName.recognized, true);
    assert.equal(withName.hasName, true);
    assert.equal(withName.score, 2);

    const withoutName = analyzeClosing('Mit freundlichen Grüßen');
    assert.equal(withoutName.recognized, true);
    assert.equal(withoutName.hasName, false);
    assert.equal(withoutName.score, 1);

    const missing = analyzeClosing('Danke für alles.');
    assert.equal(missing.recognized, false);
    assert.equal(missing.score, 0);
  });

  it('detects gibberish, spam repetitions and noun capitalization', () => {
    const spam = analyzeGermanQuality('hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo');
    assert.equal(spam.isGibberish, true);

    const capCheck = analyzeGermanQuality('Ich habe am montag einen termin bei dr. schneider.');
    assert.equal(capCheck.capitalizationWarnings.length > 0, true);
  });

  it('evaluates full sample solution with maximum points', () => {
    const sampleText = 'Sehr geehrte Damen und Herren,\n\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs und wie kann ich mich anmelden?\n\nMit freundlichen Grüßen\nMaria Ivanova';
    const mockQuestion = {
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'a1', 'august'], requiredMatches: 2 },
            { id: 'lp2', label: 'Zeit/Dauer', keywords: ['wochen', 'zeit', 'vormittags'], requiredMatches: 2 },
            { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'anmelden'], requiredMatches: 2 }
          ]
        }
      }
    };

    const result = evaluateTeil2Essay(sampleText, mockQuestion);
    assert.equal(result.points_earned, 10);
    assert.equal(result.is_correct, true);
    assert.equal(result.breakdown.anrede, 2);
    assert.equal(result.breakdown.leitpunkte, 6);
    assert.equal(result.breakdown.gruss, 2);
  });

  it('gives 0 points for empty or gibberish text', () => {
    const emptyResult = evaluateTeil2Essay('', {});
    assert.equal(emptyResult.points_earned, 0);

    const spamResult = evaluateTeil2Essay('test test test test test test test test test test', {});
    assert.equal(spamResult.points_earned, 0);
  });
});
