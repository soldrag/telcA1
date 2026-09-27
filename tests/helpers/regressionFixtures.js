/**
 * Loader for the Schreiben regression suites (tests/fixtures/schreiben-regression/*.json).
 * Suites store official exam points; the task and rubric come from the referenced seed question.
 */

import fs from 'node:fs';
import { getSchreibenRegulation } from '../../src/services/schreiben/regulations/index.js';

const SUITE_DIR = new URL('../fixtures/schreiben-regression/', import.meta.url);
const SEED_FILES = [1, 2, 3, 4].map((n) => `../../src/data/exams/seeds/schreiben-modellsatz-${n}.js`);
const LEVEL_BY_REGULATION = { 'telc-a1': 'A1' };

async function findSeedQuestion(questionId) {
  for (const file of SEED_FILES) {
    const found = (await import(file)).questions.find((q) => q.id === questionId);
    if (found) return found;
  }
  throw new Error(`Seed question not found: ${questionId}`);
}

export async function loadRegressionSuites() {
  const files = fs.readdirSync(SUITE_DIR).filter((f) => f.endsWith('.json')).sort();
  return Promise.all(files.map(async (file) => {
    const suite = JSON.parse(fs.readFileSync(new URL(file, SUITE_DIR), 'utf8'));
    const regulation = getSchreibenRegulation(LEVEL_BY_REGULATION[suite.regulation]);
    return { ...suite, file, regulation, question: await findSeedQuestion(suite.seedQuestionId) };
  }));
}

/** Expected value for 'lp1'..'lp3', 'kg' or 'total'. */
export function expectedValue(testCase, key) {
  const { lp, kg, total } = testCase.expected;
  if (key === 'kg') return kg;
  if (key === 'total') return total;
  return lp[Number(key.slice(2)) - 1];
}

/** Inclusive [min, max]: the judgment-call range when given, otherwise the exact expectation. */
export function acceptedRange(testCase, key) {
  const range = testCase.accept?.[key];
  if (range) return range;
  const value = expectedValue(testCase, key);
  return [value, value];
}

export function isWithin(value, [min, max]) {
  return value >= min && value <= max;
}

/** Coverage level (0/1/2) whose points on this regulation equal the given Leitpunkt points. */
export function leitpunktLevelForPoints(regulation, points) {
  const levels = [0, 1, 2];
  return levels.find((level) => regulation.scoreTeil2({ leitpunktLevels: [level] }).leitpunkte[0].points === points);
}
