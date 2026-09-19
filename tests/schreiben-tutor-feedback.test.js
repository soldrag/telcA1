import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIAGNOSTIC_CODES } from '../src/services/schreiben/feedback/feedbackContracts.js';
import { resolveTutorCriterionFeedback } from '../src/services/schreiben/feedback/tutorFeedbackResolver.js';
import { analyzeLeitpunkte } from '../src/services/schreiben/leitpunkteAnalyzer.js';
import { evaluateTeil2Essay } from '../src/services/schreiben/schreibenTeil2Evaluator.js';

describe('Schreiben Pedagogical Tutor Feedback Resolver', () => {
  it('resolves localized explanations in Russian, English, and German for inverted defect', () => {
    const ruNote = resolveTutorCriterionFeedback({
      criterionId: 'lp1',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_INVERTED_DEFECT,
      matchedSentence: 'meine Heizung perfekt funktioniert',
      language: 'ru'
    });
    assert.match(ruNote, /в тексте сказано, что прибор исправен/);
    assert.match(ruNote, /«meine Heizung perfekt funktioniert»/);

    const enNote = resolveTutorCriterionFeedback({
      criterionId: 'lp1',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_INVERTED_DEFECT,
      matchedSentence: 'meine Heizung perfekt funktioniert',
      language: 'en'
    });
    assert.match(enNote, /states the appliance works/);
    assert.match(enNote, /"meine Heizung perfekt funktioniert"/);

    const deNote = resolveTutorCriterionFeedback({
      criterionId: 'lp1',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_INVERTED_DEFECT,
      language: 'de'
    });
    assert.match(deNote, /dass das Gerät funktioniert/);
  });

  it('resolves localized explanations for inverted request (refusing technician)', () => {
    const ruNote = resolveTutorCriterionFeedback({
      criterionId: 'lp3',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_INVERTED_REQUEST,
      matchedSentence: 'Ich brauche keinen Handwerker',
      language: 'ru'
    });
    assert.match(ruNote, /выражен отказ от мастера\/помощи/);
    assert.match(ruNote, /«Ich brauche keinen Handwerker»/);

    const enNote = resolveTutorCriterionFeedback({
      criterionId: 'lp3',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_INVERTED_REQUEST,
      language: 'en'
    });
    assert.match(enNote, /refuses a technician\/help/);
  });

  it('resolves correct tutor notes for full fulfillment and missing points', () => {
    const fullRu = resolveTutorCriterionFeedback({
      criterionId: 'lp2',
      score: 2,
      diagnosticCode: DIAGNOSTIC_CODES.LP_FULFILLED,
      language: 'ru'
    });
    assert.match(fullRu, /Пункт раскрыт полностью \(2\/2\)/);

    const missingEn = resolveTutorCriterionFeedback({
      criterionId: 'lp2',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.LP_MISSING,
      language: 'en'
    });
    assert.match(missingEn, /Point missing \(0\/2\)/);
  });

  it('resolves salutation and closing notes accurately across languages', () => {
    const anredeOk = resolveTutorCriterionFeedback({
      criterionId: 'anrede',
      score: 2,
      diagnosticCode: DIAGNOSTIC_CODES.ANREDE_PERFECT,
      language: 'ru'
    });
    assert.match(anredeOk, /Обращение подобрано верно/);

    const grussMissing = resolveTutorCriterionFeedback({
      criterionId: 'gruss',
      score: 0,
      diagnosticCode: DIAGNOSTIC_CODES.GRUSS_MISSING,
      language: 'en'
    });
    assert.match(grussMissing, /Missing closing formula or sender name/);
  });

  it('falls back cleanly by score when diagnosticCode is missing', () => {
    const fallbackRu = resolveTutorCriterionFeedback({
      criterionId: 'lp1',
      score: 2,
      language: 'ru'
    });
    assert.match(fallbackRu, /Пункт раскрыт полностью \(2\/2\)/);

    const fallbackZero = resolveTutorCriterionFeedback({
      criterionId: 'anrede',
      score: 0,
      language: 'de'
    });
    assert.match(fallbackZero, /Es fehlt eine passende Anrede/);
  });
});

describe('Linguistic Engine Diagnostic Grounding Integration', () => {
  const heatingCriteria = [
    {
      id: 'lp1',
      label: 'Grund für das Schreiben (Heizung kaputt)',
      keywords: ['heizung', 'kaputt', 'kalt', 'warm', 'funktionieren'],
      requiredMatches: 2
    },
    {
      id: 'lp2',
      label: 'Wann Sie zu Hause sind',
      keywords: ['zeit', 'zu hause', 'uhr', 'vormittag', 'nachmittag', 'termin'],
      requiredMatches: 1
    },
    {
      id: 'lp3',
      label: 'Handwerker / Reparaturtermin bitten',
      keywords: ['handwerker', 'techniker', 'kommen', 'reparieren', 'bitten'],
      requiredMatches: 1
    }
  ];

  it('tags adversarial heating letter with LP_INVERTED_DEFECT and LP_INVERTED_REQUEST', () => {
    const text = 'Sehr geehrter Herr Müller,\n' +
      'ich schreibe Ihnen, weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.\n' +
      'Ich habe morgen Zeit.\n' +
      'Ich brauche dringend keinen Handwerker. Bitte kommen Sie morgen um 10 Uhr nicht vorbei.\n' +
      'Mit freundlichen Grüßen\n' +
      'Max Mustermann';

    const result = analyzeLeitpunkte(text, heatingCriteria);
    const lp1 = result.items[0];
    const lp3 = result.items[2];

    assert.equal(lp1.score, 0);
    assert.equal(lp1.diagnosticCode, DIAGNOSTIC_CODES.LP_INVERTED_DEFECT);

    assert.equal(lp3.score, 0);
    assert.equal(lp3.diagnosticCode, DIAGNOSTIC_CODES.LP_INVERTED_REQUEST);
  });

  it('tags legitimate submission with LP_FULFILLED', () => {
    const text = 'Sehr geehrter Herr Müller,\n' +
      'meine Heizung ist kaputt und die Wohnung ist sehr kalt.\n' +
      'Ich bin am Dienstag ab 16 Uhr zu Hause.\n' +
      'Bitte schicken Sie einen Handwerker zur Reparatur.\n' +
      'Mit freundlichen Grüßen\n' +
      'Max Mustermann';

    const result = analyzeLeitpunkte(text, heatingCriteria);
    assert.equal(result.items[0].score, 2);
    assert.equal(result.items[0].diagnosticCode, DIAGNOSTIC_CODES.LP_FULFILLED);
    assert.equal(result.items[1].score, 2);
    assert.equal(result.items[2].score, 2);
    assert.equal(result.items[2].diagnosticCode, DIAGNOSTIC_CODES.LP_FULFILLED);
  });

  it('provides diagnostic codes across full evaluateTeil2Essay pipeline', () => {
    const question = {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: heatingCriteria
        }
      }
    };
    const letter = 'Sehr geehrte Damen und Herren,\n' +
      'meine Heizung ist kaputt.\n' +
      'Ich bin morgen um 14 Uhr zu Hause.\n' +
      'Können Sie einen Handwerker schicken?\n' +
      'Mit freundlichen Grüßen,\n' +
      'Anna Meier';

    const res = evaluateTeil2Essay(letter, question);
    assert.ok(res.breakdown.items.length === 3);
    for (const item of res.breakdown.items) {
      assert.ok(item.diagnosticCode, `Item ${item.id} should have a diagnosticCode`);
    }
  });
});
