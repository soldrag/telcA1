import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildExaminerFeedbackDescriptor } from '../src/services/schreiben/feedback/examinerFeedbackBuilder.js';
import { renderExaminerFeedback } from '../src/services/schreiben/feedback/examinerFeedbackRenderer.js';
import { EXAMINER_PHRASES, EXAMINER_PHRASE_TOKENS } from '../src/services/schreiben/feedback/examinerPhraseBank.js';
import { DIAGNOSTIC_CODES, EXAMINER_CODES } from '../src/services/schreiben/feedback/feedbackContracts.js';
import { formatStudentQuote } from '../src/services/schreiben/feedback/studentQuoteFormatter.js';
import { selectGrammarHighlights } from '../src/services/schreiben/feedback/grammarHighlightSelector.js';
import { defaultA1RankerPolicy, IRankerPolicy } from '../src/services/schreiben/grading/policies/index.js';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';

const lp = (label, score, diagnosticCode, matchedSentence = '', missingAspects = []) =>
  ({ label, score, diagnosticCode, matchedSentence, missingAspects });

function perfectFacts(overrides = {}) {
  return {
    anrede: { score: 2, code: DIAGNOSTIC_CODES.ANREDE_PERFECT, text: 'Sehr geehrte Damen und Herren' },
    gruss: { score: 2, code: DIAGNOSTIC_CODES.GRUSS_PERFECT, text: 'Mit freundlichen Grüßen Anna' },
    items: [
      lp('Termin absagen', 2, DIAGNOSTIC_CODES.LP_FULFILLED, 'Ich kann morgen leider nicht kommen.'),
      lp('Grund nennen', 2, DIAGNOSTIC_CODES.LP_FULFILLED, 'Ich bin krank.'),
      lp('Neuen Termin vorschlagen', 2, DIAGNOSTIC_CODES.LP_FULFILLED, 'Geht es am Freitag?'),
    ],
    grammarErrors: [],
    finalPoints: 10,
    maxPoints: 10,
    wordCount: 40,
    isGibberish: false,
    ...overrides,
  };
}

const build = (facts) => defaultA1RankerPolicy.buildExaminerFeedback(facts);
const codes = (entries) => entries.map((e) => e.code);

describe('Examiner feedback: descriptor builder (A1 policy)', () => {
  it('perfect letter: excellent verdict, all points covered, clean grammar', () => {
    const d = build(perfectFacts());
    assert.deepEqual(codes(d.summary), [EXAMINER_CODES.OVERALL_EXCELLENT, EXAMINER_CODES.SUMMARY_LP_ALL_COVERED, EXAMINER_CODES.GRAMMAR_CLEAN]);
    assert.ok(d.bullets.every((b) => b.status === 'positive'));
    assert.equal(d.bullets.length, 5);
  });

  it('inverted Leitpunkt: summary names the point and the bullet cites the student sentence', () => {
    const facts = perfectFacts({ finalPoints: 6 });
    facts.items[2] = lp('Handwerker bestellen', 0, DIAGNOSTIC_CODES.LP_INVERTED_REQUEST, 'Ich brauche keinen Handwerker.');
    const d = build(facts);
    assert.deepEqual(d.summary[1], { code: EXAMINER_CODES.SUMMARY_LP_INVERTED, params: { criterion: 'Handwerker bestellen' } });
    const bullet = d.bullets.find((b) => b.code === DIAGNOSTIC_CODES.LP_INVERTED_REQUEST);
    assert.equal(bullet.status, 'error');
    assert.equal(bullet.params.quote, 'Ich brauche keinen Handwerker.');
  });

  it('compound point with a missing aspect reports that aspect', () => {
    const facts = perfectFacts({ finalPoints: 9 });
    facts.items[1] = lp('Personen und Beruf', 1, DIAGNOSTIC_CODES.LP_PARTIAL, 'Wir sind drei Personen.', ['Beruf']);
    const bullet = build(facts).bullets.find((b) => b.category === 'leitpunkt' && b.status === 'warning');
    assert.equal(bullet.code, EXAMINER_CODES.LP_MISSING_ASPECT);
    assert.equal(bullet.params.missingAspect, 'Beruf');
  });

  it('all points at zero means the theme was missed', () => {
    const items = perfectFacts().items.map((it) => ({ ...it, score: 0, diagnosticCode: DIAGNOSTIC_CODES.LP_MISSING }));
    const d = build(perfectFacts({ items, finalPoints: 4 }));
    assert.equal(d.summary[0].code, EXAMINER_CODES.OVERALL_THEME_MISSED);
    assert.deepEqual(d.summary[1], { code: EXAMINER_CODES.SUMMARY_LP_MISSING_MANY, params: { count: 3 } });
  });

  it('gibberish yields a single insufficient verdict', () => {
    const d = build(perfectFacts({ isGibberish: true, finalPoints: 0 }));
    assert.deepEqual(codes(d.summary), [EXAMINER_CODES.OVERALL_INSUFFICIENT]);
  });

  it('missing framing is summarized, not bulleted', () => {
    const d = build(perfectFacts({
      anrede: { score: 0, code: DIAGNOSTIC_CODES.ANREDE_MISSING, text: '' },
      gruss: { score: 0, code: DIAGNOSTIC_CODES.GRUSS_MISSING, text: '' },
      finalPoints: 6,
    }));
    assert.ok(codes(d.summary).includes(EXAMINER_CODES.SUMMARY_FRAMING_BOTH));
    assert.ok(!d.bullets.some((b) => b.category === 'anrede' || b.category === 'gruss'));
  });

  it('descriptor is plain data (survives worker postMessage / history storage)', () => {
    const d = build(perfectFacts());
    assert.deepEqual(structuredClone(d), d);
  });

  it('informal salutation in formal context yields ANREDE_REGISTER_MISMATCH warning', () => {
    const facts = perfectFacts({
      anrede: { score: 1, code: DIAGNOSTIC_CODES.ANREDE_REGISTER_MISMATCH, text: 'Liebe Frau Hansen' },
      finalPoints: 9.5,
    });
    const d = build(facts);
    const bullet = d.bullets.find((b) => b.category === 'anrede');
    assert.equal(bullet.code, DIAGNOSTIC_CODES.ANREDE_REGISTER_MISMATCH);
    assert.equal(bullet.status, 'warning');
    const ru = renderExaminerFeedback(d, 'ru');
    assert.match(ru.bulletPoints.find((b) => b.category === 'anrede').text, /слишком неформальное для официального письма/);
  });

  it('declension error in salutation yields ANREDE_DECLENSION_FLAW with correction', () => {
    const facts = perfectFacts({
      anrede: { score: 1, code: DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW, text: 'Sehr geehrte Herr Hansen', correction: 'Sehr geehrter Herr' },
      finalPoints: 9.5,
    });
    const d = build(facts);
    const bullet = d.bullets.find((b) => b.category === 'anrede');
    assert.equal(bullet.code, DIAGNOSTIC_CODES.ANREDE_DECLENSION_FLAW);
    assert.equal(bullet.params.correction, 'Sehr geehrter Herr');
    const ru = renderExaminerFeedback(d, 'ru');
    assert.match(ru.bulletPoints.find((b) => b.category === 'anrede').text, /ошибка в окончании.*Правильно: «Sehr geehrter Herr»/);
  });

  it('IRankerPolicy requires feedbackSelection from each level', () => {
    assert.throws(() => new IRankerPolicy().buildExaminerFeedback({}), /feedbackSelection getter must be implemented/);
  });
});

describe('Examiner feedback: grammar highlights', () => {
  it('subordinate clause word order gets a verb-final code from the checker', () => {
    const errors = checkGermanA1Grammar('Ich komme nicht, weil ich kann nicht kommen.');
    const [first] = selectGrammarHighlights(errors, 2);
    assert.equal(first.code, EXAMINER_CODES.GRAMMAR_VERB_FINAL);
    assert.ok('Ich komme nicht, weil ich kann nicht kommen.'.includes(first.params.quote));
  });

  it('prefers distinct topics and skips uncitable errors', () => {
    const errors = [
      { original: 'mit den Freund', correction: 'mit dem Freund', category: 'rektion' },
      { original: 'mit die Frau', correction: 'mit der Frau', category: 'rektion' },
      { original: 'Heute ich gehe', correction: 'Heute gehe ich', category: 'syntax', code: 'ERR_V2_ADVERBIAL_VORFELD' },
      { original: 'x', correction: '', category: 'orthography' },
    ];
    assert.deepEqual(codes(selectGrammarHighlights(errors, 2)), [EXAMINER_CODES.GRAMMAR_V2, EXAMINER_CODES.GRAMMAR_REKTION]);
  });
});

describe('Examiner feedback: rendering and phrase bank contract', () => {
  const sampleParams = { quote: 'a', correction: 'b', criterion: 'c', missingAspect: 'd', count: 2, points: 5, maxPoints: 10 };

  it('every phrase exists in RU and EN and uses only known tokens', () => {
    assert.deepEqual(Object.keys(EXAMINER_PHRASES.ru).sort(), Object.keys(EXAMINER_PHRASES.en).sort());
    for (const template of [...Object.values(EXAMINER_PHRASES.ru), ...Object.values(EXAMINER_PHRASES.en)]) {
      const tokens = [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      assert.ok(tokens.every((t) => EXAMINER_PHRASE_TOKENS.includes(t)), template);
    }
  });

  it('every code the builder can emit has a phrase', () => {
    const emitted = [...Object.values(EXAMINER_CODES), ...Object.values(DIAGNOSTIC_CODES)]
      .filter((c) => !['LP_MISSING', 'ANREDE_MISSING', 'GRUSS_MISSING'].includes(c));
    for (const code of emitted) {
      assert.ok(EXAMINER_PHRASES.ru[code] && EXAMINER_PHRASES.en[code], code);
      const rendered = renderExaminerFeedback({ summary: [{ code, params: sampleParams }] }, 'ru');
      assert.ok(!rendered.summary.includes('{'), `${code}: ${rendered.summary}`);
    }
  });

  it('same descriptor renders in RU and EN with locale quotes around German text', () => {
    const facts = perfectFacts({ finalPoints: 6 });
    facts.items[2] = lp('Handwerker bestellen', 0, DIAGNOSTIC_CODES.LP_INVERTED_REQUEST, 'Ich brauche keinen Handwerker.');
    const d = build(facts);
    const ru = renderExaminerFeedback(d, 'ru');
    const en = renderExaminerFeedback(d, 'en');
    assert.match(ru.bulletPoints.find((b) => b.status === 'error').text, /«Ich brauche keinen Handwerker»/);
    assert.match(en.bulletPoints.find((b) => b.status === 'error').text, /"Ich brauche keinen Handwerker"/);
    assert.match(ru.summary, /6 из 10/);
    assert.equal(renderExaminerFeedback(d, 'de').language, 'en');
    assert.equal(renderExaminerFeedback(null, 'ru'), null);
  });

  it('quote formatter trims punctuation and shortens on a word boundary', () => {
    assert.equal(formatStudentQuote('Ich bin krank!', 'ru'), '«Ich bin krank»');
    const long = 'Ich möchte Ihnen mitteilen dass ich morgen leider nicht zum Termin in Ihrer Praxis kommen kann.';
    const quoted = formatStudentQuote(long, 'en');
    assert.ok(quoted.endsWith('…"') && quoted.length <= 74);
    assert.ok(!quoted.includes(' …'));
    assert.equal(formatStudentQuote('   ', 'en'), '');
  });
});

describe('Examiner feedback: pipeline integration', () => {
  it('limited mode still produces a descriptor whose quotes come from the letter', async () => {
    const text = 'Sehr geehrte Damen und Herren,\nich kann morgen leider nicht kommen, weil ich bin krank. Heute ich gehe zum Arzt.\nMit freundlichen Grüßen\nAnna Müller';
    const question = {
      max_points: 10,
      options_json: { rubric: { leitpunkte_criteria: [
        { id: 'lp1', label: 'Termin absagen', keywords: ['termin', 'kommen', 'absagen'], requiredMatches: 1 },
        { id: 'lp2', label: 'Grund nennen', keywords: ['krank', 'arzt', 'weil'], requiredMatches: 1 },
      ] } },
    };
    const res = await gradeSchreibenSubmission({ userText: text, question, provider: new NoneProvider() });
    const d = res.examiner_feedback;
    assert.equal(d.version, 1);
    assert.ok(d.summary.length >= 2 && d.summary.length <= 4);
    const flatText = text.replace(/\s+/g, ' ');
    for (const b of d.bullets.filter((x) => x.params.quote)) {
      assert.ok(flatText.includes(b.params.quote.replace(/\s+/g, ' ').replace(/[.,!?]$/, '')), b.params.quote);
    }
    assert.ok(d.bullets.some((b) => b.category === 'grammar'));
    assert.equal(typeof res.feedback_summary, 'string');
  });
});
