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

const suites = await loadRegressionSuites();

const LIMITED_MODE_GAPS = {
  '02_reference_missing_pets': 'LP3: rubric keywords "kosten" and "kostet" share one stem and count as two matches, so the missing Haustiere aspect passes requiredMatches',
  '05_frame_only': 'LP1: "Ich wohne in Berlin" matches the rubric keyword "wohnung" by stem',
  '11_keyword_stuffing': 'bare rubric nouns count as coverage; limited mode has no communicative-action check',
  '12_off_topic': 'LP2: the temporal heuristic credits "am Samstag" as Zeitraum evidence (todo P1 "Эвристика времени")',
  '14_price_missing': 'LP3: pet synonyms (Katze, Tier) are missing from the s4-q6 rubric keywords',
  '19_route_not_period': 'LP2: keyword count cannot check compound aspects; only the Micro-Ranker caps a vetoed Zeitraum',
  '20_persons_without_count': 'LP2: keyword count cannot check compound aspects; Personen without a number needs the ranker',
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
      const satzklammer = res.grammar_errors.filter((e) => e.code === 'ERR_BROKEN_SATZKLAMMER_MODAL');
      assert.equal(satzklammer.length, 1);
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
