/**
 * Golden set: the reference letters of fixtures/schreiben-bench/gold.json (shared with `npm run bench:schreiben`),
 * graded in the limited mode against the rubric of the seed task they answer. Expectations follow reglament/telc-a1.md;
 * a case the limited mode misses is `todo` with its limit recorded in todo.md, never fitted.
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { findSeedQuestion } from './helpers/regressionFixtures.js';

const gold = JSON.parse(readFileSync(new URL('./fixtures/schreiben-bench/gold.json', import.meta.url), 'utf8'));
const options = { forceLimitedMode: true };

function gradeLimited(text, question) {
  return gradeSchreibenSubmission({ userText: text, question, options });
}

function describeMismatches(entry, res) {
  const { anrede, gruss, kg, total } = entry.expected;
  const actual = { anrede: res.breakdown.anrede, gruss: res.breakdown.gruss, kg: res.breakdown.kommunikative_gestaltung.points, total: res.points_earned };
  const expected = { anrede, gruss, kg, total };
  entry.expectedLp.forEach((level, i) => {
    expected[`lp${i + 1}`] = level;
    actual[`lp${i + 1}`] = res.breakdown.items[i].score;
  });
  return Object.keys(expected)
    .filter((key) => expected[key] !== undefined && expected[key] !== null && expected[key] !== actual[key])
    .map((key) => `${key}: got ${actual[key]}, expected ${expected[key]}`);
}

describe('Grading golden set (gold.json, limited mode)', () => {
  for (const entry of gold.filter((g) => g.expected)) {
    it(`${entry.id}: ${entry.title}`, { todo: entry.knownLimit }, async () => {
      const res = await gradeLimited(entry.text, await findSeedQuestion(entry.seedQuestionId));
      assert.deepEqual(describeMismatches(entry, res), []);
    });
  }
});

describe('Grading golden set: frame, length and determinism on own letters', () => {
  let courseTask;
  let doctorTask;
  before(async () => {
    courseTask = await findSeedQuestion('s1-q6');
    doctorTask = await findSeedQuestion('s2-q6');
  });

  it('a letter without Gruß and name loses only the Gruß part of the Kommunikative Gestaltung', async () => {
    const res = await gradeLimited(`Sehr geehrte Damen und Herren,
ich möchte einen Deutschkurs im August machen. Ich habe vier Wochen Zeit am Vormittag. Wie viel kostet der Kurs und wie kann ich mich anmelden?`, courseTask);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.gruss, 0);
    assert.equal(res.breakdown.kommunikative_gestaltung.points, 0.5);
    assert.equal(res.points_earned, 9.5);
  });

  it('a very short letter is scored by content only (no length rule at A1)', async () => {
    const res = await gradeLimited('Hallo Herr Schneider, ich kann nicht kommen. Danke.', doctorTask);
    assert.equal(res.word_count < 15, true);
    assert.deepEqual(res.breakdown.items.map((item) => item.score), [2, 0, 0]);
    assert.equal(res.points_earned, 3.5);
  });

  it('pure word repetition gets 0 points', async () => {
    const res = await gradeLimited('hallo hallo hallo hallo hallo hallo hallo hallo hallo hallo', courseTask);
    assert.equal(res.points_earned, 0);
    assert.equal(res.is_correct, false);
  });

  it('two runs produce identical scores and breakdown', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich will im August einen Deutschkurs A1 machen. Ich habe vier Wochen Zeit und möchte am Vormittag lernen. Wie viel kostet der Kurs?
Mit freundlichen Grüßen
Klara Weber`;
    const [run1, run2] = [await gradeLimited(text, courseTask), await gradeLimited(text, courseTask)];
    assert.equal(run1.points_earned, run2.points_earned);
    assert.deepEqual(run1.criteria_breakdown, run2.criteria_breakdown);
    assert.deepEqual(run1.grammar_errors, run2.grammar_errors);
    assert.deepEqual(run1.examiner_feedback, run2.examiner_feedback);
  });
});
