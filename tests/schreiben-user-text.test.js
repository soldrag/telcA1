import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeClosing } from '../src/services/schreiben/closingAnalyzer.js';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { segmentUserEssay } from '../src/services/schreiben/schreibenTextSegmenter.js';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';

describe('Real User Text Examination (Artem Smirnov Email)', () => {
  const userText = `Sehr geehrte Damen und Herren,
ich will in August ein Deutschkurs A1 machen. Ich habe Zeit vier Wochen und ich will lernen am Vormittag. Wie viel kostet der Kurs?
Wie kann ich anmelden?
Mit freundlichen Gruß
Artem Smirnov`;

  const question = {
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'a1', 'machen', 'august'] },
          { id: 'lp2', label: 'Zeit/Dauer', keywords: ['wochen', 'zeit', 'vormittag', 'lernen'] },
          { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'anmelden', 'wie viel'] }
        ]
      }
    }
  };

  it('tolerantly recognizes closing formula and sender name despite declension typo', () => {
    const closing = analyzeClosing(userText, { isFormal: true });
    assert.equal(closing.recognized, true);
    assert.equal(closing.hasName, true);
    assert.equal(closing.score, 2);
    assert.equal(closing.senderName, 'Artem Smirnov');
    assert.match(closing.grammarNote, /Dativ-Hinweis/);
  });

  it('detects all typical A1 German grammar errors in the user text', () => {
    const errors = checkGermanA1Grammar(userText);
    const originals = errors.map(e => e.original.toLowerCase());

    assert.equal(originals.some(o => o.includes('in august')), true);
    assert.equal(originals.some(o => o.includes('ein deutschkurs')), true);
    assert.equal(originals.some(o => o.includes('anmelden')), true);
    assert.equal(originals.some(o => o.includes('zeit vier wochen')), true);
    assert.equal(originals.some(o => o.includes('will lernen am vormittag')), true);
    assert.equal(originals.some(o => o.includes('mit freundlichen gruß')), true);
  });

  it('segments the user text accurately into the 3 Leitpunkte, Anrede and Closing', () => {
    const criteria = question.options_json.rubric.leitpunkte_criteria;
    const segments = segmentUserEssay(userText, criteria);

    assert.equal(segments.anrede, 'Sehr geehrte Damen und Herren,');
    assert.match(segments.leitpunkte[0].userSentence, /deutschkurs/i);
    assert.match(segments.leitpunkte[1].userSentence, /wochen/i);
    // Both questions in Punkt 3 are preserved together!
    assert.match(segments.leitpunkte[2].userSentence, /kostet/i);
    assert.match(segments.leitpunkte[2].userSentence, /anmelden/i);
    assert.equal(segments.closing, 'Mit freundlichen Gruß');
    assert.equal(segments.senderName, 'Artem Smirnov');
  });

  it('evaluates overall essay with realistic score of 7/10', () => {
    const result = evaluateTeil2Essay(userText, question);
    assert.equal(result.breakdown.anrede, 2);
    assert.equal(result.breakdown.leitpunkte, 6);
    assert.equal(result.breakdown.gruss, 2);
    assert.equal(result.breakdown.grammar_penalty, 3);
    // Base 10 minus 3 points penalty for 6 grammar errors = 7 points!
    assert.equal(result.points_earned, 7);
    assert.equal(result.is_correct, true);
    assert.equal(result.grammar_errors.length >= 5, true);
  });

  describe('User Text #3 Examination (Word Order, Satzklammer, W-Frage & Plural)', () => {
    const text3 = `Sehr geehrte Damen und Herren,
Ich möchte im August Deutschkurs A1 machen. Ich habe Zeit für vier Woche. Ich möchte lernen vormittags. Wie viel der Kurs kostet? Und wie ich kann mich anmelden?
Liebe Grüße,
Artem Smirnov`;

    const rubricCriteria = [
      { id: 'lp1', label: 'Grund', keywords: ['deutschkurs', 'kurs', 'a1', 'lernen', 'sprachschule', 'august'] },
      { id: 'lp2', label: 'Zeit/Dauer', keywords: ['wochen', 'woche', 'zeit', 'vormittags', 'vormittag', 'termin'] },
      { id: 'lp3', label: 'Kosten/Anmeldung', keywords: ['kosten', 'kostet', 'gebühr', 'anmelden', 'anmeldung', 'wie viel'] }
    ];

    it('detects all specific syntax, word order, plural and missing article errors', () => {
      const errors = checkGermanA1Grammar(text3);
      const originals = errors.map(e => e.original.toLowerCase());

      // 1. W-Frage word order
      assert.equal(originals.some(o => o.includes('wie viel der kurs kostet')), true);
      assert.equal(originals.some(o => o.includes('und wie ich kann')), true);

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

    it('detects W-Frage word order even without a question mark', () => {
      const textNoQm = 'Wie viel der Kurs kostet. Und wie ich kann mich anmelden.';
      const errors = checkGermanA1Grammar(textNoQm);
      const originals = errors.map(e => e.original.toLowerCase());
      assert.equal(originals.some(o => o.includes('wie viel der kurs kostet')), true);
      assert.equal(originals.some(o => o.includes('wie ich kann')), true);
    });

    it('detects Verbzweitstellung error with adverbial at Position 1', () => {
      const textAdv = 'Im August ich möchte Deutsch lernen.';
      const errors = checkGermanA1Grammar(textAdv);
      const originals = errors.map(e => e.original.toLowerCase());
      assert.equal(originals.some(o => o.includes('im august ich möchte')), true);
      assert.equal(errors.find(e => e.original.includes('Im August ich möchte'))?.correction, 'Im August möchte ich');
    });

    it('segments temporal sentence "Ich möchte lernen vormittags" correctly into Punkt 2', () => {
      const segments = segmentUserEssay(text3, rubricCriteria);

      assert.equal(segments.anrede, 'Sehr geehrte Damen und Herren,');
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

    it('provides punctuation hint for comma after closing formula', () => {
      const closing = analyzeClosing(text3, { isFormal: true });
      assert.match(closing.grammarNote, /kein Komma/i);
    });
  });

  describe('User Text #4 Examination (Nächsten Monat, Satzklammer, auf Kurs anmelden)', () => {
    const text4 = `Sehr geehrte Damen und Herren,
ich will besuchen einen Deutschkurs für August. Nächsten Monat ich habe vier Wochen Zeit und ich möchte am Vormittag studieren. Sagen Sie mir bitte, wie viel kostet der Kurs? Ich möchte mich auf den Kurs anmelden.
Mit freundliche Grüßen
Artem Smirnov`;

    it('detects all 5 syntax, preposition, and declension errors', () => {
      const errors = checkGermanA1Grammar(text4);
      const originals = errors.map(e => e.original.toLowerCase());

      assert.equal(originals.some(o => o.includes('nächsten monat ich habe')), true);
      assert.equal(originals.some(o => o.includes('will besuchen einen deutschkurs')), true);
      assert.equal(originals.some(o => o.includes('für august')), true);
      assert.equal(originals.some(o => o.includes('auf den kurs anmelden')), true);
      assert.equal(originals.some(o => o.includes('mit freundliche grüßen')), true);
    });

    it('segments and evaluates full tricky text with realistic score 8/10', () => {
      const res = evaluateTeil2Essay(text4, question);
      assert.equal(res.points_earned, 8);
      assert.equal(res.breakdown.leitpunkte, 6);
      assert.equal(res.breakdown.grammar_penalty, 2);
      assert.equal(res.grammar_errors.length, 5);
      assert.match(res.user_segments.leitpunkte[1].userSentence, /vormittag studieren/i);
    });
  });
});
