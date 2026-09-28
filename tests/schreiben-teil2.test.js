import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSalutation } from '../src/services/schreiben/salutationAnalyzer.js';
import { analyzeClosing } from '../src/services/schreiben/closingAnalyzer.js';
import { isGibberishText } from '../src/services/schreiben/gibberishDetector.js';
import { gradeLetter } from './helpers/gradeLetter.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const A1 = resolveLevelContext('A1');

describe('Schreiben Teil 2 Essay Evaluator', () => {
  it('analyzes salutations accurately', async () => {
    const formal = analyzeSalutation('Sehr geehrte Damen und Herren,\nich brauche Hilfe.', { grammar: A1.grammar });
    assert.equal(formal.recognized, true);
    assert.equal(formal.score, 2);

    const informal = analyzeSalutation('Hallo Peter,\nwie geht es dir?', { isFormal: true, grammar: A1.grammar });
    assert.equal(informal.recognized, true);
    assert.equal(informal.score, 1);

    const informalTask = analyzeSalutation('Liebe Maria,\nwie geht es dir?', { isFormal: false, grammar: A1.grammar });
    assert.equal(informalTask.score, 2);

    const hybrid = analyzeSalutation('Hallo Damen und Herren,\nich brauche Hilfe.', { isFormal: true, grammar: A1.grammar });
    assert.equal(hybrid.recognized, true);
    assert.equal(hybrid.score, 1);

    const missing = analyzeSalutation('Ich möchte einen Kurs machen.', { grammar: A1.grammar });
    assert.equal(missing.recognized, false);
    assert.equal(missing.score, 0);
  });

  it('analyzes closing formulas; the sender name is read but not rated', async () => {
    const withName = analyzeClosing('Mit freundlichen Grüßen,\nAnna Schmidt');
    assert.equal(withName.recognized, true);
    assert.equal(withName.hasName, true);
    assert.equal(withName.score, 2);

    const withoutName = analyzeClosing('Mit freundlichen Grüßen');
    assert.equal(withoutName.recognized, true);
    assert.equal(withoutName.hasName, false);
    assert.equal(withoutName.score, 2);

    const informalToSie = analyzeClosing('Tschüss,\nAnna Schmidt', { isFormal: true });
    assert.equal(informalToSie.recognized, true);
    assert.equal(informalToSie.score, 1);

    const missing = analyzeClosing('Danke für alles.');
    assert.equal(missing.recognized, false);
    assert.equal(missing.score, 0);
  });

  it('detects gibberish and spam repetitions; noun capitalization comes from the grammar engine', async () => {
    assert.equal(isGibberishText('hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo'), true);
    // Counterexample: short, repetitive A1 sentences are a text, not repetitions
    assert.equal(isGibberishText('Ich bin Tom. Ich bin da. Ich bin müde. Ich bin krank. Ich bin zu Hause.'), false);

    const capCheck = A1.grammar.checkLetter('Ich habe am montag einen termin bei dr. schneider.');
    assert.ok(capCheck.some((e) => e.code === 'ERR_NOUN_CAPITALIZATION'), 'noun capitalisation is the grammar engine rule');
  });

  it('evaluates full sample solution with maximum points', async () => {
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

    const result = await gradeLetter(sampleText, mockQuestion);
    assert.equal(result.points_earned, 10);
    assert.equal(result.is_correct, true);
    assert.equal(result.breakdown.anrede, 2);
    assert.equal(result.breakdown.leitpunkte, 9);
    assert.equal(result.breakdown.gruss, 2);
  });

  it('finds Anrede and Gruß in a letter written on one line', async () => {
    const body = 'ich brauche eine neue Wohnung in Köln. Haben Sie eine Wohnung mit zwei Zimmern?';
    const oneLine = await gradeLetter(`Sehr geehrter Herr Braun, ${body} Mit freundlichen Grüßen Lea Koch`, {});
    const withBreaks = await gradeLetter(`Sehr geehrter Herr Braun,\n${body}\nMit freundlichen Grüßen\nLea Koch`, {});
    assert.equal(oneLine.breakdown.anrede, 2);
    assert.equal(oneLine.breakdown.gruss, 2);
    assert.equal(oneLine.breakdown.anrede, withBreaks.breakdown.anrede);
    assert.equal(oneLine.breakdown.gruss, withBreaks.breakdown.gruss);

    const noFrame = await gradeLetter(`Ich ${body.slice(4)} Lea Koch`, {});
    assert.equal(noFrame.breakdown.anrede, 0);
    assert.equal(noFrame.breakdown.gruss, 0);
  });

  it('gives 0 points for empty or gibberish text', async () => {
    const emptyResult = await gradeLetter('', {});
    assert.equal(emptyResult.points_earned, 0);

    const spamResult = await gradeLetter('test test test test test test test test test test', {});
    assert.equal(spamResult.points_earned, 0);
  });
});
