/**
 * Trains the evidence review over the keyword stage (grading/evidenceReview.js) on calibration letters and reports it
 * honestly. Per Leitpunkt, two heads read the units' evidence next to the keyword level: "the examiner gave more"
 * (raise) and "the examiner gave less" (lower); per letter, one head says "written for another purpose".
 * Everything is measured leave one task out, thresholds included (chosen inside each fold on the other tasks only),
 * against the go criteria: Leitpunkt agreement not below the keyword stage, under-credit at most 2 points higher,
 * over-credit lower, no false voids, more decisions fixed than broken. Open and hidden letters are never read here.
 * Usage: node --max-old-space-size=6144 --import ./tests/support/loadLexiconData.js scripts/eval/train-letter-model.mjs [--save]
 *   needs the sentence heads of train-evidence-model.mjs; --save writes policies/a1EvidenceReviewModel.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';
import { createSentenceEmbedder, clearEmbeddingCache } from '../../src/services/embeddings/embeddingService.js';
import { prepareEmbeddingVector } from '../../src/services/schreiben/grading/vectorMath.js';
import { applyLogisticHead } from '../../src/services/schreiben/grading/evidenceFeatures.js';
import { decodeExampleBank } from '../../src/services/schreiben/grading/exampleBankVectors.js';
import { assessLetterUnits } from '../../src/services/schreiben/grading/unitEvidence.js';
import {
  REVIEW_FEATURE_NAMES, OFF_TASK_FEATURE_NAMES, leitpunktReviewFeatures, offTaskReviewFeatures, reviewedLevel, isOffTaskByReview,
} from '../../src/services/schreiben/grading/evidenceReview.js';
import { runStage0Preprocessing } from '../../src/services/schreiben/grading/stage0Preprocessing.js';
import { resolveLeitpunktCriteria } from '../../src/services/schreiben/leitpunktCriteria.js';
import { resolveLevelContext } from '../../src/services/schreiben/levelContext.js';
import { MicroRankerProvider } from '../../src/services/ai/providers/MicroRankerProvider.js';
import { trainLogistic, auc, wilson } from './logistic.mjs';

const ROOT = new URL('../../', import.meta.url);
const CALIBRATION_DIR = new URL('scripts/eval/calibration/', ROOT);
const REVIEW_FILE = new URL('src/services/schreiben/grading/policies/a1EvidenceReviewModel.json', ROOT);
const DOC_PROMPT = 'title: none | text: ';
const LAMBDA = 0.01;
// Moving a level the keyword stage set needs strong proof: raising over-credits when wrong, lowering under-credits.
const PRECISION = { raise: 0.95, lower: 0.9 };

const level = resolveLevelContext('A1');
await level.lexicon.load();
const { policy } = level;
const sentenceModel = policy.evidenceModel;
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const sha = (text) => crypto.createHash('sha1').update(text).digest('hex');

// --- letters -----------------------------------------------------------------------------------------------------------
// Graded letters carry both examiners: where they differ, each verdict counts half (soft label).
const graded = ['l1', 'l2', 'l3', 'l4'].flatMap((f) => readJson(new URL(`letters-levels-${f}.json`, CALIBRATION_DIR)).map((l, i) => ({
  id: `${f}-${i}`, task: l.seedQuestionId, text: l.text, category: l.category,
  verdicts: [{ lp: l.expected.lp, offTask: l.category === 'off_topic' }, { lp: l.examiner2.lp, offTask: l.examiner2.offTask }],
})));
const purpose = readJson(new URL('letters-purpose.json', CALIBRATION_DIR)).map((l, i) => ({
  id: `p-${i}`, task: l.task, text: l.text, verdicts: [{ lp: null, offTask: l.offTask }],
}));
const letters = [...graded, ...purpose];
const tasks = [...new Set(letters.map((l) => l.task))].sort();

const questionCache = new Map();
async function questionOf(task) {
  if (!questionCache.has(task)) {
    const { questions } = await import(new URL(`src/data/exams/seeds/schreiben-modellsatz-${task.match(/^s(\d+)-/)[1]}.js`, ROOT));
    questionCache.set(task, questions.find((q) => q.id === task));
  }
  return questionCache.get(task);
}

// --- keyword stage, as the app grades with the Micro-Ranker; cached per letter and code version ----------------------
const sourceHash = (() => {
  const hash = crypto.createHash('sha256');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (!p.endsWith('a1EvidenceReviewModel.json')) hash.update(p).update(fs.readFileSync(p));
  });
  ['src/services', 'src/data/exams'].forEach((d) => walk(new URL(d, ROOT).pathname));
  return hash.digest('hex').slice(0, 16);
})();
const keywordCacheFile = path.join(os.homedir(), '.cache', 'telc-a1', 'keyword-verdicts.json');
const keywordCache = fs.existsSync(keywordCacheFile) ? readJson(keywordCacheFile) : {};
let pooledExtractor = null;
async function keywordVerdict(letter) {
  const key = `${sourceHash}:${sha(letter.task + letter.text)}`;
  if (!keywordCache[key]) {
    if (!pooledExtractor) {
      const { pipeline } = await import('@huggingface/transformers');
      pooledExtractor = await pipeline('feature-extraction', 'onnx-community/embeddinggemma-300m-ONNX', { dtype: 'q4' });
    }
    clearEmbeddingCache();
    const result = await gradeSchreibenSubmission({
      userText: letter.text, question: await questionOf(letter.task), provider: new MicroRankerProvider(),
      options: { customExtractor: pooledExtractor, leitpunktEngine: 'keywords' },
    });
    keywordCache[key] = {
      levels: result.breakdown.items.map((it) => it.score),
      voidReason: result.breakdown.leitpunkte_void_reason,
    };
  }
  return keywordCache[key];
}

// --- evidence units, as evidenceReview.js reads them; sentence vectors shared with train-evidence-model.mjs ----------
const vectorCacheFile = path.join(os.homedir(), '.cache', 'telc-a1', 'vectors-sentence.json');
const vectorCache = fs.existsSync(vectorCacheFile) ? readJson(vectorCacheFile) : {};
let sentenceExtractor = null;
async function embed(text) {
  const key = sha(DOC_PROMPT + text);
  if (!vectorCache[key]) {
    sentenceExtractor ??= await createSentenceEmbedder();
    vectorCache[key] = Array.from(prepareEmbeddingVector((await sentenceExtractor(DOC_PROMPT + text)).data, 256));
  }
  return Float32Array.from(vectorCache[key]);
}
const bank = decodeExampleBank(readJson(new URL('src/data/exams/example-bank/vectors.json', ROOT)));

// --- rows ----------------------------------------------------------------------------------------------------------------
const lpRows = [];
const letterRows = [];
for (const letter of letters) {
  const question = await questionOf(letter.task);
  const criteria = resolveLeitpunktCriteria(question);
  const { bodySentences } = runStage0Preprocessing(letter.text, level);
  const keyword = await keywordVerdict(letter);
  const { units, sentenceOtherPurposeMargins } = await assessLetterUnits({
    sentences: bodySentences, embed, criteria, taskBank: bank.tasks[letter.task], neutral: bank.neutral, policy, model: sentenceModel,
  });
  const weight = 1 / letter.verdicts.length;
  letterRows.push(...letter.verdicts.map((v) => ({
    letter, keyword, weight, offTask: v.offTask ? 1 : 0,
    features: offTaskReviewFeatures({ criteria, units, sentenceOtherPurposeMargins, keywordLevels: keyword.levels }),
  })));
  if (letter.verdicts[0].lp === null) continue;
  criteria.forEach((criterion, k) => {
    const features = leitpunktReviewFeatures(criterion, units, keyword.levels[k]);
    if (!features) return;
    lpRows.push(...letter.verdicts.map((v) => ({
      letter, k, weight, features, examiner: v.lp[k], keywordLevel: keyword.levels[k],
      raise: v.lp[k] > keyword.levels[k] ? 1 : 0, lower: v.lp[k] < keyword.levels[k] ? 1 : 0,
    })));
  });
}
fs.mkdirSync(path.dirname(vectorCacheFile), { recursive: true });
fs.writeFileSync(vectorCacheFile, JSON.stringify(vectorCache));
fs.writeFileSync(keywordCacheFile, JSON.stringify(keywordCache));

// --- heads and thresholds ------------------------------------------------------------------------------------------------
// Signs: more support can only argue for a raise and against a lowering; a stronger contradiction the other way;
// a stronger fit to the task (own purpose, reason, keyword levels) only against "another purpose".
const SIGNS = {
  raise: REVIEW_FEATURE_NAMES.map((n) => ({ supportMax: 1, supportMin: 1, supportMean: 1, contradictMax: -1 })[n]),
  lower: REVIEW_FEATURE_NAMES.map((n) => ({ supportMax: -1, supportMin: -1, supportMean: -1, contradictMax: 1 })[n]),
  offTask: OFF_TASK_FEATURE_NAMES.map(() => -1),
};
const candidates = {
  raise: (rows) => rows.filter((r) => r.keywordLevel < 2),
  lower: (rows) => rows.filter((r) => r.keywordLevel > 0),
  offTask: (rows) => rows,
};

// Lowest score from which every row scored at least as high is right often enough (weighted), or null if none is.
function thresholdAtPrecision(scored, target) {
  const ranked = [...scored].sort((a, b) => b.p - a.p);
  let hit = 0;
  let all = 0;
  let best = null;
  ranked.forEach((r) => { hit += r.y * r.weight; all += r.weight; if (hit / all >= target) best = r.p; });
  return best;
}
// Just above every letter some examiner found on task: no letter on task is voided in the fold that set it.
function thresholdNoFalseVoids(scored) {
  const onTask = scored.filter((r) => !r.y).map((r) => r.p);
  return onTask.length ? Math.max(...onTask) + 1e-6 : null;
}
const thresholdOf = (name, scored) => (name === 'offTask' ? thresholdNoFalseVoids(scored) : thresholdAtPrecision(scored, PRECISION[name]));

function fitHead(name, rows) {
  const fit = candidates[name](rows);
  if (!fit.some((r) => r[name]) || fit.every((r) => r[name])) return null;
  return trainLogistic(fit, name, { lambda: LAMBDA, signs: SIGNS[name] });
}
function outOfFoldScores(name, rows, foldTasks) {
  const scored = [];
  for (const task of foldTasks) {
    const head = fitHead(name, rows.filter((r) => r.letter.task !== task));
    for (const r of candidates[name](rows.filter((x) => x.letter.task === task))) {
      scored.push({ row: r, p: head ? applyLogisticHead(r.features, head) : -Infinity, y: r[name], weight: r.weight });
    }
  }
  return scored;
}
// A decision = head on all given rows + threshold from those rows' own leave-one-task-out scores.
function trainDecision(name, rows) {
  const rowTasks = [...new Set(rows.map((r) => r.letter.task))];
  const head = fitHead(name, rows);
  const threshold = thresholdOf(name, outOfFoldScores(name, rows, rowTasks).filter((s) => Number.isFinite(s.p)));
  return head && threshold !== null ? { head, threshold } : null;
}
function trainReview(rowsLp, rowsLetter) {
  return { raise: trainDecision('raise', rowsLp), lower: trainDecision('lower', rowsLp), offTask: trainDecision('offTask', rowsLetter) };
}

// --- honest measurement: everything for a task is decided by a review trained without that task -----------------------
const isVoidedByKeywords = (keyword) => keyword.voidReason === 'OFF_TOPIC';
const otherVoid = (keyword) => Boolean(keyword.voidReason) && !isVoidedByKeywords(keyword);
const effective = (levels, voided) => (voided ? levels.map(() => 0) : levels);
const outcome = { keyword: [], review: [] };
const foldReviews = {};
for (const task of tasks) {
  const review = trainReview(lpRows.filter((r) => r.letter.task !== task), letterRows.filter((r) => r.letter.task !== task));
  foldReviews[task] = review;
  for (const letter of graded.filter((l) => l.task === task)) {
    const { keyword, features } = letterRows.find((r) => r.letter === letter);
    const offTask = isOffTaskByReview(features, review);
    const reviewed = keyword.levels.map((lv, k) => {
      const row = lpRows.find((r) => r.letter === letter && r.k === k);
      return row ? reviewedLevel(row.features, review) : lv;
    });
    outcome.keyword.push({ letter, levels: effective(keyword.levels, Boolean(keyword.voidReason)), voided: Boolean(keyword.voidReason) });
    outcome.review.push({ letter, levels: effective(reviewed, offTask || otherVoid(keyword)), voided: offTask || otherVoid(keyword) });
  }
}

// Each Leitpunkt decision is compared with both examiners, each counting half.
function measure(results) {
  const m = { agree: 0, over: 0, under: 0, twoOff: 0, falseVoids: 0, decisions: 0 };
  for (const { letter, levels, voided } of results) {
    for (const v of letter.verdicts) {
      const w = 1 / letter.verdicts.length;
      levels.forEach((lv, k) => {
        m.decisions += w;
        if (lv === v.lp[k]) m.agree += w;
        if (lv > v.lp[k]) m.over += w;
        if (lv < v.lp[k]) m.under += w;
        if (Math.abs(lv - v.lp[k]) === 2) m.twoOff += w;
      });
      if (voided && v.lp.some((l) => l > 0)) m.falseVoids += w;
    }
  }
  return m;
}
const pct = (x, n) => `${((100 * x) / n).toFixed(1)}%`;
const kw = measure(outcome.keyword);
const rv = measure(outcome.review);
let fixed = 0;
let broken = 0;
outcome.review.forEach((r, i) => {
  const b = outcome.keyword[i];
  r.letter.verdicts.forEach((v) => r.levels.forEach((lv, k) => {
    const w = 1 / r.letter.verdicts.length;
    if (lv === v.lp[k] && b.levels[k] !== v.lp[k]) fixed += w;
    if (lv !== v.lp[k] && b.levels[k] === v.lp[k]) broken += w;
  }));
});

console.log(`Letters: ${graded.length} graded (two examiners), ${purpose.length} on/off purpose · Leitpunkt rows ${lpRows.length} · code ${sourceHash}`);
console.log(`Sentence model ${sentenceModel.oofHash}; examiners agree on ${pct(graded.reduce((s, l) => s + l.verdicts[0].lp.filter((x, k) => x === l.verdicts[1].lp[k]).length, 0), graded.length * 3)} of Leitpunkt decisions`);
console.log('\nLeave one task out (thresholds chosen without the task), against both examiners:');
console.log(`                       keyword stage   with review`);
console.log(`  agreement            ${pct(kw.agree, kw.decisions).padStart(13)}   ${pct(rv.agree, rv.decisions).padStart(11)}`);
console.log(`  over-credit          ${pct(kw.over, kw.decisions).padStart(13)}   ${pct(rv.over, rv.decisions).padStart(11)}`);
console.log(`  under-credit         ${pct(kw.under, kw.decisions).padStart(13)}   ${pct(rv.under, rv.decisions).padStart(11)}`);
console.log(`  2↔0 errors           ${kw.twoOff.toFixed(1).padStart(13)}   ${rv.twoOff.toFixed(1).padStart(11)}`);
console.log(`  false voids          ${kw.falseVoids.toFixed(1).padStart(13)}   ${rv.falseVoids.toFixed(1).padStart(11)}`);
console.log(`  decisions fixed ${fixed.toFixed(1)}, broken ${broken.toFixed(1)}`);
const offTaskLetters = graded.filter((l) => l.category === 'off_topic');
const caught = (kind) => outcome[kind].filter((r) => r.letter.category === 'off_topic' && r.voided).length;
console.log(`  off-purpose letters voided: keyword ${wilson(caught('keyword'), offTaskLetters.length)}, review ${wilson(caught('review'), offTaskLetters.length)}`);
const go = rv.agree >= kw.agree && rv.under <= kw.under + 0.02 * kw.decisions && rv.over < kw.over && rv.falseVoids === 0 && fixed > broken;
console.log(`\nGo criteria: ${go ? 'GO' : 'NO-GO'}`);

for (const name of ['raise', 'lower', 'offTask']) {
  const scored = outOfFoldScores(name, name === 'offTask' ? letterRows : lpRows, tasks).filter((s) => Number.isFinite(s.p));
  const active = Object.values(foldReviews).filter((r) => r[name]).length;
  console.log(`  ${name.padEnd(8)} AUC ${auc(scored.map((s) => [s.p, s.y])).toFixed(3)} · positives ${scored.filter((s) => s.y).length}/${scored.length} · on in ${active}/${tasks.length} folds`);
}

const final = trainReview(lpRows, letterRows);
console.log('\nFinal review (all tasks):', Object.fromEntries(Object.entries(final).map(([k, v]) => [k, v ? `threshold ${v.threshold.toFixed(3)}` : 'off'])));
for (const name of ['raise', 'lower']) {
  if (final[name]) console.log(`  ${name} weights: ${REVIEW_FEATURE_NAMES.map((n, i) => `${n} ${final[name].head.weights[i].toFixed(2)}`).join(', ')}`);
}
if (final.offTask) console.log(`  offTask weights: ${OFF_TASK_FEATURE_NAMES.map((n, i) => `${n} ${final.offTask.head.weights[i].toFixed(2)}`).join(', ')}`);

if (process.argv.includes('--save')) {
  fs.writeFileSync(REVIEW_FILE, JSON.stringify({
    version: 1, sentenceModel: sentenceModel.oofHash, code: sourceHash, go,
    features: REVIEW_FEATURE_NAMES, offTaskFeatures: OFF_TASK_FEATURE_NAMES, precision: PRECISION, ...final,
  }, null, 2) + '\n');
  console.log(`\nSaved ${REVIEW_FILE.pathname}`);
}
