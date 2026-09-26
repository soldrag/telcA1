/**
 * Schreiben Leitpunkte benchmark: benchmark letters + gold letters, graded in three provider modes.
 * Diagnostic only — every score change must be explained, never tuned towards expectedLp.
 * Usage: npm run bench:schreiben [-- --save]   (--save overwrites the stored baseline)
 */

import fs from 'node:fs';
import { pipeline, env } from '@huggingface/transformers';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { createRankerEmbedder } from '../src/services/embeddings/rankerEmbedder.js';
import { clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import { BENCHMARK_TASKS } from '../tests/fixtures/schreiben-bench/letters.js';

const FIXTURES = new URL('../tests/fixtures/schreiben-bench/', import.meta.url);
const BASELINE = new URL('baseline.txt', FIXTURES);
const SEED_FILES = [1, 2, 3, 4].map((n) => `../server/seeds/schreiben-modellsatz-${n}.js`);

env.allowRemoteModels = false;

class GrayZoneRanker extends MicroRankerProvider {
  constructor(options) {
    super(options);
    this.id = PROVIDER_IDS.CLIENT_WEBGPU;
  }
}

async function findSeedQuestion(questionId) {
  for (const file of SEED_FILES) {
    const found = (await import(file)).questions.find((q) => q.id === questionId);
    if (found) return found;
  }
  throw new Error(`Seed question not found: ${questionId}`);
}

async function loadItems() {
  const letters = BENCHMARK_TASKS.flatMap((t) => t.letters.map((l) => ({ ...l, question: t.question })));
  const gold = JSON.parse(fs.readFileSync(new URL('gold.json', FIXTURES), 'utf8'));
  const goldItems = await Promise.all(gold.map(async (g) => ({ ...g, type: g.title, question: await findSeedQuestion(g.seedQuestionId) })));
  return [...letters, ...goldItems];
}

function formatScores(result) {
  return result.breakdown.items
    .map((it) => `${it.score}${String(it.diagnosticCode || '').startsWith('LP_INVERTED') ? 'i' : ''}`)
    .join('');
}

function countMatches(result, expectedLp) {
  if (!expectedLp) return { hit: 0, total: 0 };
  const pairs = expectedLp.map((exp, i) => [exp, result.breakdown.items[i]?.score]).filter(([exp]) => exp !== null);
  return { hit: pairs.filter(([exp, got]) => exp === got).length, total: pairs.length };
}

async function gradeItem(item, modes, extractor, tally) {
  const cells = [];
  for (const [name, provider] of Object.entries(modes)) {
    clearEmbeddingCache();
    const result = await gradeSchreibenSubmission({ userText: item.text, question: item.question, provider, options: { customExtractor: extractor } });
    const { hit, total } = countMatches(result, item.expectedLp);
    tally[name].hit += hit;
    tally[name].total += total;
    cells.push(`${name}=${formatScores(result)}`.padEnd(14));
  }
  const expected = item.expectedLp ? item.expectedLp.map((e) => e ?? '?').join('') : '---';
  return `${item.id.padEnd(6)} ${cells.join(' ')} exp=${expected} | ${item.type}`;
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
    gray: new GrayZoneRanker({ embedder: createRankerEmbedder({ customExtractor: extractor }) }),
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
