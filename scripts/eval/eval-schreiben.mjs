/**
 * Schreiben Teil 2 evaluation against examiner verdicts.
 *   npm run eval:open   [-- --ranker]   open set: per-letter table, for debugging cases
 *   npm run eval:hidden [-- --ranker]   hidden set: aggregate numbers only, for measuring
 * Default mode is the limited mode (no model). --ranker grades with the Micro-Ranker on EmbeddingGemma,
 * as the browser does (downloads the model on first use).
 * The hidden set is never printed: tune only on the open set, check on the hidden one.
 */

import fs from 'node:fs';
import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';
import { expectedTotal, validateLetters } from './letterSchema.mjs';

const OPEN_DIR = new URL('../../tests/fixtures/schreiben-open/', import.meta.url);
const set = process.argv.includes('--hidden') ? 'hidden' : 'open';
const useRanker = process.argv.includes('--ranker');
const MIN_GROUP = 8;

async function loadSet() {
  if (set === 'hidden') return (await import('./hiddenSetStore.mjs')).loadHiddenLetters();
  return fs.readdirSync(OPEN_DIR).filter((f) => f.endsWith('.json')).sort().flatMap((f) => {
    const letters = JSON.parse(fs.readFileSync(new URL(f, OPEN_DIR), 'utf8'));
    const problems = validateLetters(letters);
    if (problems.length) throw new Error(`${f}: ${problems.join('; ')}`);
    return letters.map((l, i) => ({ ...l, id: l.id || `${f.replace('.json', '')}-${String(i + 1).padStart(2, '0')}` }));
  });
}

const questionCache = new Map();
async function findQuestion(seedQuestionId) {
  if (!questionCache.has(seedQuestionId)) {
    const n = seedQuestionId.match(/^s(\d+)-/)[1];
    const { questions } = await import(`../../src/data/exams/seeds/schreiben-modellsatz-${n}.js`);
    questionCache.set(seedQuestionId, questions.find((q) => q.id === seedQuestionId));
  }
  return questionCache.get(seedQuestionId);
}

async function createGrader() {
  if (!useRanker) {
    return (userText, question) => gradeSchreibenSubmission({ userText, question, options: { forceLimitedMode: true } });
  }
  const { pipeline } = await import('@huggingface/transformers');
  const { MicroRankerProvider } = await import('../../src/services/ai/providers/MicroRankerProvider.js');
  const { clearEmbeddingCache } = await import('../../src/services/embeddings/embeddingService.js');
  const extractor = await pipeline('feature-extraction', 'onnx-community/embeddinggemma-300m-ONNX', { dtype: 'q4' });
  return async (userText, question) => {
    clearEmbeddingCache();
    return gradeSchreibenSubmission({ userText, question, provider: new MicroRankerProvider(), options: { customExtractor: extractor } });
  };
}

function compare(letter, result) {
  const want = letter.expected;
  const gotLp = result.breakdown.items.map((it) => it.score);
  const gotKg = result.breakdown.kommunikative_gestaltung?.points ?? 0;
  const diff = result.points_earned - expectedTotal(want);
  return {
    letter, gotLp, gotKg, got: result.points_earned, want: expectedTotal(want), diff,
    lpHits: gotLp.filter((lv, i) => lv === want.lp[i]).length,
    lpOver: gotLp.filter((lv, i) => lv > want.lp[i]).length,
    lpUnder: gotLp.filter((lv, i) => lv < want.lp[i]).length,
  };
}

const pct = (part, whole) => (whole ? `${((100 * part) / whole).toFixed(1)}%` : '—');

function summarize(rows) {
  const n = rows.length;
  const lpTotal = n * 3;
  return {
    letters: n,
    totalExact: pct(rows.filter((r) => r.diff === 0).length, n),
    totalWithinHalf: pct(rows.filter((r) => Math.abs(r.diff) <= 0.5).length, n),
    totalWithin1_5: pct(rows.filter((r) => Math.abs(r.diff) <= 1.5).length, n),
    meanAbsError: (rows.reduce((s, r) => s + Math.abs(r.diff), 0) / n).toFixed(2),
    meanSignedError: (rows.reduce((s, r) => s + r.diff, 0) / n).toFixed(2),
    leitpunktAgreement: pct(rows.reduce((s, r) => s + r.lpHits, 0), lpTotal),
    leitpunktOverCredit: pct(rows.reduce((s, r) => s + r.lpOver, 0), lpTotal),
    leitpunktUnderCredit: pct(rows.reduce((s, r) => s + r.lpUnder, 0), lpTotal),
    kgAgreement: pct(rows.filter((r) => r.gotKg === r.letter.expected.kg).length, n),
  };
}

function printGroups(rows) {
  const groups = Map.groupBy(rows, (r) => r.letter.category);
  console.log(`\nBy category (groups of at least ${MIN_GROUP}): within ±0.5 · mean signed error`);
  for (const [category, group] of [...groups].sort()) {
    if (group.length < MIN_GROUP) continue;
    const s = summarize(group);
    console.log(`  ${category.padEnd(14)} n=${String(group.length).padStart(3)}  ${s.totalWithinHalf.padStart(6)}  ${s.meanSignedError}`);
  }
}

function printLetters(rows) {
  for (const r of rows) {
    const mark = Math.abs(r.diff) <= 0.5 ? 'ok  ' : 'DIFF';
    console.log(`${mark} ${r.letter.id.padEnd(22)} ${r.letter.category.padEnd(13)} lp=${r.gotLp.join('')} exp=${r.letter.expected.lp.join('')} kg=${r.gotKg}/${r.letter.expected.kg} total=${r.got}/${r.want}`);
  }
}

const letters = await loadSet();
const grade = await createGrader();
const rows = [];
for (const letter of letters) {
  rows.push(compare(letter, await grade(letter.text, await findQuestion(letter.seedQuestionId))));
}

console.log(`Schreiben eval · ${set} set · ${useRanker ? 'Micro-Ranker (EmbeddingGemma)' : 'limited mode'}`);
if (set === 'open') printLetters(rows);
console.table(summarize(rows));
printGroups(rows);
