/**
 * telc A1 Schreiben Teil 2 regression suite in limited mode (no model, deterministic).
 * Letters and expectations: tests/fixtures/schreiben-regression/*.json (official points).
 * The neural modes are measured by `npm run bench:schreiben`; this file checks what must hold offline.
 * Known gaps are recorded in todo.md with the diagnosed cause — never fixed by fitting code or rubric to the letters.
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

const CONTENT_KEYS = ['lp1', 'lp2', 'lp3', 'total'];

function gradeLimited(text, question) {
  return gradeSchreibenSubmission({ userText: text, question, options: { forceLimitedMode: true } });
}

function findCase(suite, id) {
  const tc = suite.cases.find((c) => c.id === id);
  assert.ok(tc, `${suite.file} has no case ${id}`);
  return tc;
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

      it(`${tc.id}: Leitpunkte and total — ${tc.title}`, () => {
        const res = results.get(tc.id);
        const [lp1, lp2, lp3] = res.breakdown.items.map((it) => it.points);
        const mismatches = describeMismatches(tc, { lp1, lp2, lp3, total: res.points_earned });
        assert.deepEqual(mismatches, []);
      });
    }

    it('one defect flagged by two analyzers is listed once (17_screenshot_user_review)', async () => {
      const tc = findCase(suite, '17_screenshot_user_review');
      const bracket = (res) => res.grammar_errors.filter((e) => e.code === 'ERR_BROKEN_SATZKLAMMER_MODAL').map((e) => e.original);
      // A prepositional phrase after the infinitive is accepted German ("Urlaub machen an der Ostsee").
      assert.deepEqual(bracket(results.get(tc.id)), []);
      // An object after the infinitive breaks the bracket: listed once with its whole bracket.
      const withObjectAfter = tc.text.replace('Urlaub machen an der Ostsee', 'machen Urlaub an der Ostsee');
      assert.notEqual(withObjectAfter, tc.text);
      assert.deepEqual(bracket(await gradeLimited(withObjectAfter, suite.question)), ['will im Sommer mit meine Familie machen Urlaub an der Ostsee']);
    });

    it('the learning scale shown in the UI counts the capital "Ich" after the salutation (17)', () => {
      const tc = findCase(suite, '17_screenshot_user_review');
      const res = results.get(tc.id);
      const counted = dedupeGrammarErrors(res.grammar_errors);
      assert.ok(counted.some((e) => e.code === 'ERR_CAPITAL_AFTER_SALUTATION_COMMA'));
      const shown = calculateLinguisticAccuracy({ weights,
        grammarErrors: counted,
        wordCount: countLetterBodyWords(tc.text),
      });
      assert.equal(shown.errorCount, counted.length);
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
      assert.ok(res.criteria_breakdown.diagnostic.unassignedSentences.includes('Gibt es einen Parkplatz?'));
      assert.equal(res.points_earned, 10);
    });
  });
}
