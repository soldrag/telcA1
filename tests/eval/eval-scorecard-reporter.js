/**
 * Schreiben Teil 2 Diagnostic Quality Scorecard Reporter.
 * Runs evaluation suite and generates a formatted terminal benchmark matrix.
 * Strictly adheres to McConnell limits (<= 180 lines, <= 25 lines per function).
 */

import { performance } from 'node:perf_hooks';
import { evaluateTeil2Essay } from '../../src/services/schreiben/schreibenTeil2Evaluator.js';
import {
  allSchreibenEvaluationCases,
  getQuestionForCase
} from './fixtures/index.js';

function evaluateCase(testCase) {
  const question = getQuestionForCase(testCase);
  const start = performance.now();
  const res = evaluateTeil2Essay(testCase.text, question);
  const latencyMs = Number((performance.now() - start).toFixed(2));

  const exp = testCase.expected;
  let pass = true;

  if (exp.anrede !== undefined && res.breakdown.anrede !== exp.anrede) pass = false;
  if (exp.gruss !== undefined && res.breakdown.gruss !== exp.gruss) pass = false;
  if (exp.leitpunkte !== undefined && res.breakdown.leitpunkte !== exp.leitpunkte) pass = false;
  if (exp.algorithmicLeitpunkte !== undefined && res.breakdown.leitpunkte !== exp.algorithmicLeitpunkte) pass = false;
  if (exp.minScore !== undefined && res.points_earned < exp.minScore) pass = false;
  if (exp.maxScore !== undefined && res.points_earned > exp.maxScore) pass = false;
  if (exp.pointsEarned !== undefined && res.points_earned !== exp.pointsEarned) pass = false;
  if (exp.minErrors !== undefined && res.grammar_errors.length < exp.minErrors) pass = false;
  if (exp.isCorrect !== undefined && res.is_correct !== exp.isCorrect) pass = false;

  return { testCase, res, pass, latencyMs };
}

function formatRow(result, idx) {
  const { testCase, res, pass, latencyMs } = result;
  const num = String(idx + 1).padStart(2, ' ');
  const cat = testCase.category.toUpperCase().padEnd(10, ' ');
  const title = testCase.title.slice(0, 32).padEnd(32, ' ');
  const status = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const score = `${res.points_earned}/10`.padStart(5, ' ');
  const bd = `[A:${res.breakdown.anrede} LP:${res.breakdown.leitpunkte} G:${res.breakdown.gruss} -${res.breakdown.grammar_penalty}]`;
  const time = `${latencyMs}ms`.padStart(7, ' ');

  return `| ${num} | ${cat} | ${title} | ${score} | ${bd} | ${status} | ${time} |`;
}

function printHeader() {
  console.log('\n' + '='.repeat(96));
  console.log('   TELC DEUTSCH A1 — SCHREIBEN TEIL 2 QUALITY SCORECARD MATRIX');
  console.log('='.repeat(96));
  console.log('|  # | Category   | Test Case Title                  | Score | Breakdown          | Status | Latency |');
  console.log('|----+------------+----------------------------------+-------+--------------------+--------+---------|');
}

function printSummary(results, totalTime) {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const rate = ((passed / total) * 100).toFixed(1);

  console.log('|----+------------+----------------------------------+-------+--------------------+--------+---------|');
  console.log(`\nSUMMARY:`);
  console.log(`  Total Edge Cases:  ${total}`);
  console.log(`  Passed Cases:      \x1b[32m${passed}\x1b[0m (${rate}%)`);
  console.log(`  Failed Cases:      ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'}`);
  console.log(`  Total Duration:    ${totalTime.toFixed(2)}ms`);
  console.log(`  Target Mode:       Algorithmic Deterministic Baseline (0 MB, offline)`);
  console.log('='.repeat(96) + '\n');
}

export function runSchreibenEvaluation() {
  const overallStart = performance.now();
  printHeader();

  const results = allSchreibenEvaluationCases.map(evaluateCase);
  results.forEach((r, idx) => console.log(formatRow(r, idx)));

  const totalTime = performance.now() - overallStart;
  printSummary(results, totalTime);

  const allPassed = results.every(r => r.pass);
  return { allPassed, results, totalTime };
}

// Auto-run if executed directly as entry script
if (process.argv[1]?.endsWith('eval-scorecard-reporter.js')) {
  const { allPassed } = runSchreibenEvaluation();
  process.exit(allPassed ? 0 : 1);
}
