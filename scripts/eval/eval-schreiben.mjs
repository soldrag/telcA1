/**
 * Schreiben Teil 2 evaluation against examiner verdicts.
 *   npm run eval:open   [-- --model]   open set: per-letter table, for debugging cases
 *   npm run eval:hidden [-- --model]   hidden set: aggregate numbers only, for measuring
 *   npm run eval:merlin [-- --model]   real telc A1 exam letters (MERLIN, sealed like the hidden set): aggregates only
 * Default mode is the limited mode (no model: reference alignment). --model grades with the keyword-free evidence head
 * on EmbeddingGemma, as the browser does (downloads the model on first use). The head is trained on the open and
 * calibration sentences' tasks, so its numbers there are in-sample; hidden and MERLIN are not.
 * --calibration grades the calibration letters (scripts/eval/calibration/letters-levels-*.json) like the open set.
 * Open and calibration sets only: --save <file> stores the per-letter verdicts, --baseline <file> compares with stored ones letter
 * by letter and Leitpunkt by Leitpunkt (a 40-letter percentage alone moves by chance; paired changes do not).
 * The hidden set is never printed: tune only on the open set, check on the hidden one.
 */

import fs from 'node:fs';
import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';
import { expectedTotal, validateLetters } from './letterSchema.mjs';
import { merlinTasks } from './merlin/tasks.js';

const OPEN_DIR = new URL('../../tests/fixtures/schreiben-open/', import.meta.url);
const SEALED_SETS = ['hidden', 'merlin'];
const set = ['hidden', 'merlin', 'calibration'].find((name) => process.argv.includes(`--${name}`)) || 'open';
// Sets whose letters may be printed: tuning and ablation work on these, never on the sealed ones.
const isReadable = !SEALED_SETS.includes(set);
const useModel = process.argv.includes('--model');
const MIN_GROUP = 8;
const argValue = (flag) => { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : null; };

const CALIBRATION_DIR = new URL('calibration/', import.meta.url);

async function loadSet() {
  if (SEALED_SETS.includes(set)) return (await import('./hiddenSetStore.mjs')).loadHiddenLetters(set);
  if (set === 'calibration') {
    return fs.readdirSync(CALIBRATION_DIR).filter((f) => /^letters-levels-.*\.json$/.test(f)).sort().flatMap((f) => (
      JSON.parse(fs.readFileSync(new URL(f, CALIBRATION_DIR), 'utf8')).map((l, i) => ({ ...l, id: `${f.replace(/^letters-levels-|\.json$/g, '')}-${i}` }))
    ));
  }
  return fs.readdirSync(OPEN_DIR).filter((f) => f.endsWith('.json')).sort().flatMap((f) => {
    const letters = JSON.parse(fs.readFileSync(new URL(f, OPEN_DIR), 'utf8'));
    const problems = validateLetters(letters);
    if (problems.length) throw new Error(`${f}: ${problems.join('; ')}`);
    return letters.map((l, i) => ({ ...l, id: l.id || `${f.replace('.json', '')}-${String(i + 1).padStart(2, '0')}` }));
  });
}

const questionCache = new Map();
async function findQuestion(seedQuestionId) {
  const merlinTask = merlinTasks.find((t) => t.id === seedQuestionId);
  if (merlinTask) return merlinTask;
  if (!questionCache.has(seedQuestionId)) {
    const n = seedQuestionId.match(/^s(\d+)-/)[1];
    const { questions } = await import(`../../src/data/exams/seeds/schreiben-modellsatz-${n}.js`);
    questionCache.set(seedQuestionId, questions.find((q) => q.id === seedQuestionId));
  }
  return questionCache.get(seedQuestionId);
}

let extractor = null;
async function createGrader() {
  if (!useModel) return (userText, question) => gradeSchreibenSubmission({ userText, question, options: { forceLimitedMode: true } });
  const { MicroRankerProvider } = await import('../../src/services/ai/providers/MicroRankerProvider.js');
  const { createSentenceEmbedder } = await import('../../src/services/embeddings/embeddingService.js');
  extractor ??= await createSentenceEmbedder();
  return (userText, question) => gradeSchreibenSubmission({
    userText, question, provider: new MicroRankerProvider(), options: { evidenceExtractor: extractor },
  });
}

function compare(letter, result) {
  const want = letter.expected;
  const gotLp = result.breakdown.items.map((it) => it.score);
  const gotKg = result.breakdown.kommunikative_gestaltung?.points ?? 0;
  const diff = result.points_earned - expectedTotal(want);
  return {
    letter, gotLp, gotKg, got: result.points_earned, want: expectedTotal(want), diff,
    voided: Boolean(result.breakdown.leitpunkte_void_reason),
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
async function gradeAll() {
  const grade = await createGrader();
  const rows = [];
  for (const letter of letters) rows.push(compare(letter, await grade(letter.text, await findQuestion(letter.seedQuestionId))));
  return rows;
}

function toVerdicts(rows) {
  return Object.fromEntries(rows.map((r) => [r.letter.id, { lp: r.gotLp, kg: r.gotKg, total: r.got }]));
}

// Paired comparison: which letters moved closer to or further from the examiner, and which Leitpunkt decisions.
function printPairedChanges(rows, baseline) {
  const tally = { letters: { better: 0, worse: 0 }, leitpunkte: { better: 0, worse: 0 } };
  const changed = [];
  for (const r of rows) {
    const before = baseline[r.letter.id];
    if (!before) continue;
    const delta = Math.abs(before.total - r.want) - Math.abs(r.diff);
    if (delta > 0) tally.letters.better += 1;
    if (delta < 0) tally.letters.worse += 1;
    r.gotLp.forEach((level, i) => {
      const was = before.lp[i] === r.letter.expected.lp[i];
      const is = level === r.letter.expected.lp[i];
      if (is && !was) tally.leitpunkte.better += 1;
      if (was && !is) tally.leitpunkte.worse += 1;
    });
    if (delta !== 0) changed.push(`${delta > 0 ? '+' : '-'} ${r.letter.id.padEnd(22)} ${r.letter.category.padEnd(13)} lp ${before.lp.join('')} -> ${r.gotLp.join('')} exp=${r.letter.expected.lp.join('')} total ${before.total} -> ${r.got} / ${r.want}`);
  }
  console.log(`\nPaired with baseline: letters ${tally.letters.better} closer, ${tally.letters.worse} further; Leitpunkt decisions ${tally.leitpunkte.better} fixed, ${tally.leitpunkte.worse} broken`);
  changed.forEach((line) => console.log(line));
}

function printEngine(label, rows) {
  console.log(`\nSchreiben eval · ${set} set · ${label}`);
  if (isReadable) printLetters(rows);
  console.table(summarize(rows));
  printGroups(rows);
}

const rows = await gradeAll();
printEngine(useModel ? 'evidence head (EmbeddingGemma)' : 'limited mode (reference alignment)', rows);
if (isReadable && argValue('--baseline')) printPairedChanges(rows, JSON.parse(fs.readFileSync(argValue('--baseline'), 'utf8')));
if (isReadable && argValue('--save')) fs.writeFileSync(argValue('--save'), JSON.stringify(toVerdicts(rows), null, 2) + '\n');
