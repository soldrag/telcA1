/**
 * Schreiben Teil 2 evaluation against examiner verdicts.
 *   npm run eval:open   [-- --ranker]   open set: per-letter table, for debugging cases
 *   npm run eval:hidden [-- --ranker]   hidden set: aggregate numbers only, for measuring
 * Default mode is the limited mode (no model). --ranker grades with the Micro-Ranker on EmbeddingGemma,
 * as the browser does (downloads the model on first use).
 * --review adds the trained another-purpose review to the keyword stage (implies --ranker); --shadow grades every
 * letter without and with it and compares them pair by pair (aggregates only on the hidden set).
 * --calibration grades the calibration letters (scripts/eval/calibration/letters-levels-*.json) like the open set.
 * Open and calibration sets only: --save <file> stores the per-letter verdicts, --baseline <file> compares with stored ones letter
 * by letter and Leitpunkt by Leitpunkt (a 40-letter percentage alone moves by chance; paired changes do not).
 * The hidden set is never printed: tune only on the open set, check on the hidden one.
 */

import fs from 'node:fs';
import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';
import { expectedTotal, validateLetters } from './letterSchema.mjs';
import { canReviewPurpose } from '../../src/services/schreiben/grading/purposeReview.js';
import { resolveLevelContext } from '../../src/services/schreiben/levelContext.js';

const OPEN_DIR = new URL('../../tests/fixtures/schreiben-open/', import.meta.url);
const set = process.argv.includes('--hidden') ? 'hidden' : (process.argv.includes('--calibration') ? 'calibration' : 'open');
// Sets whose letters may be printed: tuning and ablation work on these, never on the hidden one.
const isReadable = set !== 'hidden';
const shadow = process.argv.includes('--shadow');
const withReview = process.argv.includes('--review');
const useRanker = process.argv.includes('--ranker') || withReview || shadow;
const MIN_GROUP = 8;
const argValue = (flag) => { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : null; };

const CALIBRATION_DIR = new URL('calibration/', import.meta.url);

async function loadSet() {
  if (set === 'hidden') return (await import('./hiddenSetStore.mjs')).loadHiddenLetters();
  // Calibration letters train the purpose review: grade them to measure the keyword stage, not the review.
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
  if (!questionCache.has(seedQuestionId)) {
    const n = seedQuestionId.match(/^s(\d+)-/)[1];
    const { questions } = await import(`../../src/data/exams/seeds/schreiben-modellsatz-${n}.js`);
    questionCache.set(seedQuestionId, questions.find((q) => q.id === seedQuestionId));
  }
  return questionCache.get(seedQuestionId);
}

let extractors = null;
async function createGrader(review) {
  if (!useRanker) {
    return (userText, question) => gradeSchreibenSubmission({ userText, question, options: { forceLimitedMode: true } });
  }
  const { MicroRankerProvider } = await import('../../src/services/ai/providers/MicroRankerProvider.js');
  const { clearEmbeddingCache, createEmbeddingExtractors } = await import('../../src/services/embeddings/embeddingService.js');
  // One model session, as in the app: the keyword stage reads the pooled vectors, the review the sentence ones.
  extractors ??= await createEmbeddingExtractors();
  const extractor = extractors.pooled;
  const evidenceExtractor = review ? extractors.sentence : null;
  return async (userText, question) => {
    clearEmbeddingCache();
    return gradeSchreibenSubmission({
      userText, question, provider: new MicroRankerProvider(),
      options: { customExtractor: extractor, evidenceExtractor },
    });
  };
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
async function gradeAll(review) {
  const grade = await createGrader(review);
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

// Pair by pair, with the review against without it: Leitpunkt decisions fixed / broken, letters closer / further,
// 2↔0 errors, voids of letters the examiner credited, and the voids the review adds: catches where the examiner gave
// every Leitpunkt 0 (invisible in fixed / broken when the keyword levels were 0 already), false voids otherwise.
const reviewable = (rows) => rows.filter((r) => canReviewPurpose(r.letter.seedQuestionId, resolveLevelContext('A1').policy)).length;

function printShadowComparison(before, after) {
  const t = { fixed: 0, broken: 0, closer: 0, further: 0, twoZero: [0, 0], falseVoids: [0, 0], addedCatches: 0, addedFalse: 0 };
  before.forEach((b, i) => {
    const a = after[i];
    const want = a.letter.expected.lp;
    a.gotLp.forEach((level, k) => {
      const was = b.gotLp[k] === want[k];
      if (level === want[k] && !was) t.fixed += 1;
      if (level !== want[k] && was) t.broken += 1;
    });
    const delta = Math.abs(b.diff) - Math.abs(a.diff);
    if (delta > 0) t.closer += 1;
    if (delta < 0) t.further += 1;
    if (a.voided && !b.voided) {
      if (want.every((l) => l === 0)) t.addedCatches += 1;
      else t.addedFalse += 1;
    }
    [b, a].forEach((r, j) => {
      r.gotLp.forEach((level, k) => { if (Math.abs(level - want[k]) === 2) t.twoZero[j] += 1; });
      if (r.voided && want.some((l) => l > 0)) t.falseVoids[j] += 1;
    });
  });
  const decisions = before.length * 3;
  console.log(`\nShadow · purpose review vs keyword stage over ${decisions} Leitpunkt decisions: ${t.fixed} fixed, ${t.broken} broken (net ${(((t.fixed - t.broken) / decisions) * 100).toFixed(1)}%)`);
  console.log(`  letters closer to the examiner ${t.closer}, further ${t.further}`);
  console.log(`  2↔0 errors: keyword ${t.twoZero[0]}, review ${t.twoZero[1]} · letters void although the examiner credited a Leitpunkt: keyword ${t.falseVoids[0]}, review ${t.falseVoids[1]}`);
  console.log(`  voids the review adds: ${t.addedCatches} where the examiner gave every Leitpunkt 0, ${t.addedFalse} where the examiner credited some`);
  console.log(`  letters the review could read (trained head, example bank): ${reviewable(before)} of ${before.length}`);
}

function printEngine(label, rows) {
  console.log(`\nSchreiben eval · ${set} set · ${label}`);
  if (isReadable && !shadow) printLetters(rows);
  console.table(summarize(rows));
  printGroups(rows);
}

if (shadow) {
  const keywordRows = await gradeAll(false);
  const evidenceRows = await gradeAll(true);
  printEngine('Micro-Ranker · keyword stage', keywordRows);
  printEngine('Micro-Ranker · keyword stage + purpose review', evidenceRows);
  printShadowComparison(keywordRows, evidenceRows);
  if (isReadable) {
    console.log(`\nChanged letters (${set} set):`);
    evidenceRows.forEach((a, i) => {
      const b = keywordRows[i];
      if (b.gotLp.join('') !== a.gotLp.join('') || b.got !== a.got) {
        console.log(`  ${a.letter.id.padEnd(22)} ${a.letter.category.padEnd(13)} lp ${b.gotLp.join('')} -> ${a.gotLp.join('')} exp=${a.letter.expected.lp.join('')} total ${b.got} -> ${a.got} / ${a.want}`);
      }
    });
  }
} else {
  const rows = await gradeAll(withReview);
  printEngine(useRanker ? `Micro-Ranker · keyword stage${withReview ? ' + purpose review' : ''}` : 'limited mode', rows);
  if (isReadable && argValue('--baseline')) printPairedChanges(rows, JSON.parse(fs.readFileSync(argValue('--baseline'), 'utf8')));
  if (isReadable && argValue('--save')) fs.writeFileSync(argValue('--save'), JSON.stringify(toVerdicts(rows), null, 2) + '\n');
}
