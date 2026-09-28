import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeClosing } from '../src/services/schreiben/closingAnalyzer.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const checkGermanA1Grammar = (text) => resolveLevelContext('A1').grammar.checkLetter(text);
import { segmentLetter } from './helpers/segmentLetter.js';
import { readFileSync } from 'node:fs';
import { findSeedQuestion } from './helpers/regressionFixtures.js';
import { gradeLetter } from './helpers/gradeLetter.js';

const A1 = resolveLevelContext('A1');
// Learner letters G2 and G11 are gold letters: their scores are checked in grading-golden-set, here only grammar and segmentation.
const gold = JSON.parse(readFileSync(new URL('./fixtures/schreiben-bench/gold.json', import.meta.url), 'utf8'));
const goldText = (id) => gold.find((g) => g.id === id).text;
const courseCriteria = (await findSeedQuestion('s1-q6')).options_json.rubric.leitpunkte_criteria;

describe('Learner letters: grammar and segmentation (gold G2, G11 and User Text #3)', () => {
  const userText = goldText('G2');

  it('tolerantly recognizes closing formula and sender name despite declension typo', async () => {
    const closing = analyzeClosing(userText, { isFormal: true });
    assert.equal(closing.recognized, true);
    assert.equal(closing.hasName, true);
    assert.equal(closing.score, 2);
    assert.equal(closing.senderName, 'Artem Smirnov');
    const dative = checkGermanA1Grammar(userText).find((e) => e.code === 'ERR_PREP_CASE_DAT' && /Gruß/.test(e.original));
    assert.match(dative.correction, /freundlichem Gruß/);
  });

  it('detects all typical A1 German grammar errors in the user text', async () => {
    const errors = checkGermanA1Grammar(userText);
    const originals = errors.map(e => e.original.toLowerCase());

    assert.equal(originals.some(o => o.includes('in august')), true);
    assert.equal(originals.some(o => o.includes('ein deutschkurs')), true);
    assert.equal(originals.some(o => o.includes('anmelden')), true);
    assert.equal(originals.some(o => o.includes('zeit vier wochen')), true);
    // "will lernen am Vormittag": a prepositional phrase after the infinitive is accepted German, not flagged.
    assert.equal(originals.some(o => o.includes('will lernen am vormittag')), false);
    assert.equal(originals.some(o => o.includes('mit freundlichen gruß')), true);
  });

  it('segments the letter body into the 3 Leitpunkte', async () => {
    const segments = segmentLetter(userText, courseCriteria, A1);

    assert.match(segments.leitpunkte[0].userSentence, /deutschkurs/i);
    assert.match(segments.leitpunkte[1].userSentence, /wochen/i);
    // Both questions in Punkt 3 are preserved together!
    assert.match(segments.leitpunkte[2].userSentence, /kostet/i);
    assert.match(segments.leitpunkte[2].userSentence, /anmelden/i);
  });

  it('keeps both questions of Punkt 3 together when the second one is on its own line', () => {
    const split = userText.replace('Kurs? Wie kann', 'Kurs?\nWie kann');
    assert.notEqual(split, userText);
    const lp3 = segmentLetter(split, courseCriteria, A1).leitpunkte[2].userSentence;
    assert.match(lp3, /kostet/i);
    assert.match(lp3, /anmelden/i);
  });

  it('User Text #2: rough word order and an imperative request still fulfil all three points', async () => {
    const res = await gradeLetter(`Hallo Damen und Herren,
ich besuche wollen einen deutschkurs im August. Ich habe vier wochen Zeit und ich am vormittag lernen möchte. Was kosten der Kurs? Bitte senden Sie mir die informationen für die anmeldung.
Viele Grüße
Artem Smirnov`, await findSeedQuestion('s1-q6'));
    assert.deepEqual(res.breakdown.items.map((item) => item.score), [2, 2, 2]);
    assert.match(res.user_segments.leitpunkte[2].userSentence, /Was kosten der Kurs\?.*anmeldung/);
    // "Hallo" to "Damen und Herren": register mismatch, KG 0.5 (3 + 3 + 3 + 0.5)
    assert.equal(res.breakdown.anrede, 1);
    assert.equal(res.points_earned, 9.5);
  });

  describe('User Text #3 Examination (Word Order, Satzklammer, W-Frage & Plural)', () => {
    const text3 = `Sehr geehrte Damen und Herren,
Ich möchte im August Deutschkurs A1 machen. Ich habe Zeit für vier Woche. Ich möchte lernen vormittags. Wie viel der Kurs kostet? Und wie ich kann mich anmelden?
Liebe Grüße,
Artem Smirnov`;

    it('detects all specific syntax, word order, plural and missing article errors', async () => {
      const errors = checkGermanA1Grammar(text3);
      const originals = errors.map(e => e.original.toLowerCase());

      // 1. W-Frage word order
      assert.equal(originals.some(o => o.includes('wie viel der kurs kostet')), true);
      assert.equal(originals.some(o => o.includes('wie ich kann')), true);

      // 2. Modal bracket
      assert.equal(originals.some(o => o.includes('möchte lernen vormittags')), true);

      // 3. Plural after numeral
      assert.equal(originals.some(o => o.includes('vier woche')), true);

      // 4. Missing article
      assert.equal(originals.some(o => o.includes('deutschkurs a1 machen')), true);

      // 5. Capitalization after comma
      assert.equal(originals.some(o => o.includes('sehr geehrte damen und herren, ich')), true);

      // 6. Comma after closing sign-off is included in grammar_errors
      assert.equal(originals.some(o => o.includes('liebe grüße,')), true);
    });

    it('detects W-Frage word order even without a question mark', async () => {
      const textNoQm = 'Wie viel der Kurs kostet. Und wie ich kann mich anmelden.';
      const errors = checkGermanA1Grammar(textNoQm);
      const originals = errors.map(e => e.original.toLowerCase());
      assert.equal(originals.some(o => o.includes('wie viel der kurs kostet')), true);
      assert.equal(originals.some(o => o.includes('wie ich kann')), true);
    });

    it('detects Verbzweitstellung error with adverbial at Position 1', async () => {
      const textAdv = 'Im August ich möchte Deutsch lernen.';
      const errors = checkGermanA1Grammar(textAdv);
      const originals = errors.map(e => e.original.toLowerCase());
      assert.equal(originals.some(o => o.includes('im august ich möchte')), true);
      assert.equal(errors.find(e => e.original.includes('Im August ich möchte'))?.correction, 'Im August möchte ich');
    });

    it('segments temporal sentence "Ich möchte lernen vormittags" correctly into Punkt 2', async () => {
      const segments = segmentLetter(text3, courseCriteria, A1);

        // Punkt 1 has the Grund
      assert.match(segments.leitpunkte[0].userSentence, /deutschkurs a1 machen/i);
      assert.doesNotMatch(segments.leitpunkte[0].userSentence, /vormittags/i);

      // Punkt 2 receives both duration AND time-of-day
      assert.match(segments.leitpunkte[1].userSentence, /vier woche/i);
      assert.match(segments.leitpunkte[1].userSentence, /lernen vormittags/i);

      // Punkt 3 has both inquiry questions
      assert.match(segments.leitpunkte[2].userSentence, /wie viel der kurs kostet/i);
      assert.match(segments.leitpunkte[2].userSentence, /wie ich kann mich anmelden/i);
    });

    it('provides punctuation hint for comma after closing formula', async () => {
      const comma = checkGermanA1Grammar(text3).find((e) => e.code === 'ERR_COMMA_AFTER_CLOSING');
      assert.match(comma.explanation, /kein Komma/i);
    });
  });

  describe('User Text #4 Examination (Nächsten Monat, Satzklammer, auf Kurs anmelden)', () => {
    const text4 = goldText('G11');

    it('detects the syntax, preposition and declension errors', async () => {
      const errors = checkGermanA1Grammar(text4);
      const originals = errors.map(e => e.original.toLowerCase());

      assert.equal(originals.some(o => o.includes('nächsten monat ich habe')), true);
      assert.equal(originals.some(o => o.includes('will besuchen einen deutschkurs')), true);
      assert.equal(originals.some(o => o.includes('für august')), true);
      assert.equal(originals.some(o => o.includes('auf den kurs anmelden')), true);
      assert.equal(originals.some(o => o.includes('mit freundliche grüßen')), true);
    });

    it('segments the fronted and bracketed sentences into their Leitpunkte', async () => {
      const segments = segmentLetter(text4, courseCriteria, A1);
      assert.match(segments.leitpunkte[0].userSentence, /deutschkurs für august/i);
      assert.match(segments.leitpunkte[1].userSentence, /vormittag studieren/i);
      assert.match(segments.leitpunkte[2].userSentence, /wie viel kostet der kurs/i);
      assert.match(segments.leitpunkte[2].userSentence, /anmelden/i);
    });
  });
});
