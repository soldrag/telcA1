/**
 * Letters whose grammar-checker output is pinned in tests/fixtures/grammar/snapshot.json.
 * The snapshot is a diagnostic baseline for refactoring the checker: every diff is reviewed by hand.
 */
import { readFileSync } from 'node:fs';
import { BENCHMARK_TASKS } from '../fixtures/schreiben-bench/letters.js';

const readJson = (relPath) => JSON.parse(readFileSync(new URL(relPath, import.meta.url), 'utf8'));

export function collectGrammarSnapshotLetters() {
  const regression = readJson('../fixtures/schreiben-regression/telc-a1-ostsee.json').cases
    .map((c) => ({ id: `ostsee/${c.id}`, text: c.text }));
  const bench = BENCHMARK_TASKS.flatMap((task) => task.letters.map((l) => ({ id: `bench/${l.id}`, text: l.text })));
  const gold = readJson('../fixtures/schreiben-bench/gold.json').map((g) => ({ id: `gold/${g.id}`, text: g.text }));
  const targets = readJson('../fixtures/grammar/targets.json').map((t) => ({ id: `target/${t.id}`, text: t.text }));
  return [...regression, ...bench, ...gold, ...targets].filter((l) => typeof l.text === 'string');
}

export function describeGrammarErrors(errors = []) {
  return errors.map((e) => `${e.code || e.category}: ${e.original} → ${e.correction ?? ''}`);
}
