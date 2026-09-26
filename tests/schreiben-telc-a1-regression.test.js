/**
 * telc A1 Schreiben Teil 2 regression suite in limited mode (no model, deterministic).
 * Letters and expectations: tests/fixtures/schreiben-regression/*.json (official points).
 * The neural modes are measured by `npm run bench:schreiben`; this file checks what must hold offline.
 * Known gaps are `todo` with the diagnosed cause — never fixed by fitting code or rubric to the letters.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { loadRegressionSuites, acceptedRange, isWithin } from './helpers/regressionFixtures.js';
import { calculateLinguisticAccuracy } from '../src/services/schreiben/scoring/linguisticAccuracyScorer.js';
import { dedupeGrammarErrors } from '../src/services/schreiben/linguistic/grammarErrorDeduper.js';
import { countLetterBodyWords } from '../src/services/schreiben/scoring/letterBodyWordCounter.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

const weights = A1_GRAMMAR_PROFILE.accuracyWeights;

const suites = await loadRegressionSuites();

const LIMITED_MODE_GAPS = {
  '11_keyword_stuffing': 'bare rubric nouns count as coverage; limited mode has no communicative-action check',
  '12_off_topic': 'LP2: the temporal heuristic credits "am Samstag" as Zeitraum evidence (todo P1 "Эвристика времени")',
};

const CONTENT_KEYS = ['lp1', 'lp2', 'lp3', 'total'];

function gradeLimited(text, question) {
  return gradeSchreibenSubmission({ userText: text, question, options: { forceLimitedMode: true } });
}

function describeMismatches(tc, actual) {
  return CONTENT_KEYS
    .filter((key) => !isWithin(actual[key], acceptedRange(tc, key)))
    .map((key) => `${key}: got ${actual[key]}, accepted ${acceptedRange(tc, key).join('–')}`);
}

for (const suite of suites) {
  describe(`Regression ${suite.file} (${suite.regulation.id}, ${suite.seedQuestionId}) — limited mode`, () => {
    const results = new Map();

    before(async () => {
      for (const tc of suite.cases) results.set(tc.id, await gradeLimited(tc.text, suite.question));
    });

    for (const tc of suite.cases) {
      it(`${tc.id}: Kommunikative Gestaltung`, () => {
        const kg = results.get(tc.id).breakdown.kommunikative_gestaltung.points;
        assert.ok(isWithin(kg, acceptedRange(tc, 'kg')), `KG ${kg}, accepted ${acceptedRange(tc, 'kg').join('–')}`);
      });

      it(`${tc.id}: Leitpunkte and total — ${tc.title}`, { todo: LIMITED_MODE_GAPS[tc.id] }, () => {
        const res = results.get(tc.id);
        const [lp1, lp2, lp3] = res.breakdown.items.map((it) => it.points);
        const mismatches = describeMismatches(tc, { lp1, lp2, lp3, total: res.points_earned });
        assert.deepEqual(mismatches, []);
      });
    }

    it('one defect flagged by two analyzers is listed once (17_screenshot_user_review)', () => {
      const res = results.get('17_screenshot_user_review');
      if (!res) return;
      // Two distinct bracket defects, each listed once with its whole bracket.
      const satzklammer = res.grammar_errors.filter((e) => e.code === 'ERR_BROKEN_SATZKLAMMER_MODAL');
      assert.deepEqual(satzklammer.map((e) => e.original).sort(), [
        'möchten kommen von 15. Juli bis 25. Juli',
        'will im Sommer mit meine Familie Urlaub machen an der Ostsee',
      ]);
    });

    it('the learning scale shown in the UI equals the pipeline one, capital "Ich" after the salutation included (17)', () => {
      const res = results.get('17_screenshot_user_review');
      if (!res) return;
      assert.ok(res.grammar_errors.some((e) => e.code === 'ERR_CAPITAL_AFTER_SALUTATION_COMMA'));
      const shown = calculateLinguisticAccuracy({ weights,
        grammarErrors: dedupeGrammarErrors(res.grammar_errors),
        wordCount: countLetterBodyWords(suite.cases.find((tc) => tc.id === '17_screenshot_user_review').text),
      });
      assert.equal(shown.score, res.linguistic_accuracy.score);
      assert.equal(shown.errorCount, res.linguistic_accuracy.errorCount);
    });

    it('grammar errors never lower the score (10_typical_a1_errors)', () => {
      const res = results.get('10_typical_a1_errors');
      assert.ok(res.grammar_errors.length > 0, 'the letter is expected to carry flagged A1 errors');
      assert.equal(res.points_earned, 10);
    });

    it('one sentence may serve two Leitpunkte (02: "wir möchten im Juli …" is reason and Zeitraum)', () => {
      const [lp1, lp2] = results.get('02_reference_missing_pets').breakdown.items;
      const shared = 'wir möchten im Juli mit der Familie an die Ostsee kommen.';
      assert.ok(lp1.keywordSentences.includes(shared) && lp2.keywordSentences.includes(shared));
      assert.equal(lp1.points + lp2.points, 6);
    });

    it('sentences outside every Leitpunkt are reported, not scored', () => {
      const res = results.get('15_long_with_extras');
      assert.ok(res.unassigned_sentences.includes('Gibt es einen Parkplatz?'));
      assert.equal(res.points_earned, 10);
    });
  });
}
