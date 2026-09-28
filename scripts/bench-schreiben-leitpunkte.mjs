/**
 * Schreiben Leitpunkte benchmark: benchmark letters + gold letters + regression suites, graded in two provider modes
 * (none: the limited rule-based mode; primary: the Micro-Ranker on EmbeddingGemma).
 * Diagnostic only — every score change must be explained, never tuned towards expectedLp.
 * Usage: npm run bench:schreiben [-- --save]   (--save overwrites the stored baseline)
 */

import fs from 'node:fs';
import { pipeline, env } from '@huggingface/transformers';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';
import { BENCHMARK_TASKS } from '../tests/fixtures/schreiben-bench/letters.js';
import { loadRegressionSuites, acceptedRange, leitpunktLevelForPoints, findSeedQuestion } from '../tests/helpers/regressionFixtures.js';

const FIXTURES = new URL('../tests/fixtures/schreiben-bench/', import.meta.url);
const BASELINE = new URL('baseline.txt', FIXTURES);

env.allowRemoteModels = false;


async function loadItems() {
  const letters = BENCHMARK_TASKS.flatMap((t) => t.letters.map((l) => ({ ...l, question: t.question })));
  const gold = JSON.parse(fs.readFileSync(new URL('gold.json', FIXTURES), 'utf8'));
  const goldItems = await Promise.all(gold.map(async (g) => ({ ...g, type: g.title, question: await findSeedQuestion(g.seedQuestionId) })));
  return [...letters, ...goldItems, ...(await loadRegressionItems())];
}

// Regression suites hold official points; the Leitpunkt columns compare coverage levels (accept ranges included).
function toRegressionItem(suite, tc) {
  const toLevel = (points) => leitpunktLevelForPoints(suite.regulation, points);
  const lpRanges = ['lp1', 'lp2', 'lp3'].map((key) => acceptedRange(tc, key).map(toLevel));
  return {
    id: `${suite.seedQuestionId}:${tc.id.slice(0, 2)}`,
    type: tc.title,
    text: tc.text,
    question: suite.question,
    expectedLp: tc.expected.lp.map(toLevel),
    lpRanges,
    expectedTotal: acceptedRange(tc, 'total'),
  };
}

async function loadRegressionItems() {
  const suites = await loadRegressionSuites();
  return suites.flatMap((suite) => suite.cases.map((tc) => toRegressionItem(suite, tc)));
}

function formatScores(result) {
  return result.breakdown.items
    .map((it) => `${it.score}${String(it.diagnosticCode || '').startsWith('LP_INVERTED') ? 'i' : ''}`)
    .join('');
}

function countMatches(result, item) {
  if (!item.expectedLp) return { hit: 0, total: 0 };
  const ranges = item.lpRanges || item.expectedLp.map((exp) => [exp, exp]);
  const pairs = ranges.map((range, i) => [range, result.breakdown.items[i]?.score]).filter(([[min]]) => min !== null);
  return { hit: pairs.filter(([[min, max], got]) => got >= min && got <= max).length, total: pairs.length };
}

function formatTotals(item, totals) {
  if (!item.expectedTotal) return '';
  const [min, max] = item.expectedTotal;
  return ` tot=${totals.join('/')} exp=${min === max ? min : `${min}-${max}`}`;
}

async function gradeItem(item, modes, extractor, tally) {
  const cells = [];
  const totals = [];
  for (const [name, provider] of Object.entries(modes)) {
    clearEmbeddingCache();
    const result = await gradeSchreibenSubmission({ userText: item.text, question: item.question, provider, options: { customExtractor: extractor } });
    const { hit, total } = countMatches(result, item);
    totals.push(result.points_earned);
    tally[name].hit += hit;
    tally[name].total += total;
    cells.push(`${name}=${formatScores(result)}`.padEnd(14));
  }
  const expected = item.expectedLp ? item.expectedLp.map((e) => e ?? '?').join('') : '---';
  return `${item.id.padEnd(6)} ${cells.join(' ')} exp=${expected}${formatTotals(item, totals)} | ${item.type}`;
}

function printBaselineDiff(rows) {
  if (!fs.existsSync(BASELINE)) return console.log('\nNo baseline stored yet (run with --save).');
  const before = new Map(fs.readFileSync(BASELINE, 'utf8').split('\n').filter(Boolean).map((r) => [r.split(' ')[0], r]));
  const changed = rows.filter((r) => before.get(r.split(' ')[0]) !== r);
  console.log(`\nChanged vs baseline: ${changed.length}`);
  for (const r of changed) console.log(`- ${before.get(r.split(' ')[0]) || '(new)'}\n+ ${r}`);
}

async function runBenchmark() {
  const extractor = await pipeline('feature-extraction', 'onnx-community/embeddinggemma-300m-ONNX', { dtype: 'q4' });
  const modes = {
    none: new NoneProvider(),
    primary: new MicroRankerProvider(),
  };
  const tally = Object.fromEntries(Object.keys(modes).map((m) => [m, { hit: 0, total: 0 }]));
  const rows = [];
  for (const item of await loadItems()) {
    const row = await gradeItem(item, modes, extractor, tally);
    rows.push(row);
    console.log(row);
  }
  console.log('\nMatches with expectedLp:', Object.entries(tally).map(([m, t]) => `${m} ${t.hit}/${t.total}`).join(', '));
  printBaselineDiff(rows);
  if (process.argv.includes('--save')) fs.writeFileSync(BASELINE, rows.join('\n') + '\n');
}

await runBenchmark();
