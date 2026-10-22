/**
 * Trains the another-purpose review over the keyword stage (grading/purposeReview.js) on calibration letters and
 * reports it honestly: leave one task out, threshold included (chosen inside each fold on the other tasks only).
 * The head is stored only when it passes its go criteria: no OFF_TOPIC void added on a letter an examiner found on
 * task, and at least 4 more of the graded off-topic letters caught than by the keyword stage alone.
 * Open and hidden letters are never read here.
 * Usage: node --max-old-space-size=6144 --import ./tests/support/loadLexiconData.js scripts/eval/train-letter-model.mjs [--save]
 *   [--drop <feature>] [--records <file>]
 *   needs the sentence heads of train-evidence-model.mjs; --save writes policies/a1PurposeReviewModel.json;
 *   --drop zeroes one feature (ablation), --records writes each letter's out-of-fold verdicts (calibration letters only)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';
import { createEmbeddingExtractors, clearEmbeddingCache } from '../../src/services/embeddings/embeddingService.js';
import { prepareEmbeddingVector } from '../../src/services/schreiben/grading/vectorMath.js';
import { applyLogisticHead } from '../../src/services/schreiben/grading/evidenceFeatures.js';
import { decodeExampleBank } from '../../src/services/schreiben/grading/exampleBankVectors.js';
import { assessLetterUnits } from '../../src/services/schreiben/grading/unitEvidence.js';
import { PURPOSE_FEATURE_NAMES, purposeFeatures, isAnotherPurpose } from '../../src/services/schreiben/grading/purposeReview.js';
import { runStage0Preprocessing } from '../../src/services/schreiben/grading/stage0Preprocessing.js';
import { resolveLeitpunktCriteria } from '../../src/services/schreiben/leitpunktCriteria.js';
import { resolveLevelContext } from '../../src/services/schreiben/levelContext.js';
import { MicroRankerProvider } from '../../src/services/ai/providers/MicroRankerProvider.js';
import { trainLogistic, auc, wilson } from './logistic.mjs';

const ROOT = new URL('../../', import.meta.url);
const CALIBRATION_DIR = new URL('scripts/eval/calibration/', ROOT);
const REVIEW_FILE = new URL('src/services/schreiben/grading/policies/a1PurposeReviewModel.json', ROOT);
const DOC_PROMPT = 'title: none | text: ';
const LAMBDA = 0.01;
// A void zeroes the whole task, so the threshold keeps room above the highest letter some examiner found on task
// (the highest of a hundred scores is itself noisy): VOID_ROOM in log-odds.
const VOID_ROOM = 1;

const argValue = (flag) => { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : null; };
const DROPPED = argValue('--drop') ? PURPOSE_FEATURE_NAMES.indexOf(argValue('--drop')) : -1;
if (argValue('--drop') && DROPPED < 0) throw new Error(`--drop: no feature ${argValue('--drop')}`);

const level = resolveLevelContext('A1');
await level.lexicon.load();
const { policy } = level;
const sentenceModel = policy.evidenceModel;
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const sha = (text) => crypto.createHash('sha1').update(text).digest('hex');

// --- letters -----------------------------------------------------------------------------------------------------------
// Letters carry both examiners where there are two: where they differ, each verdict counts half (soft label).
const graded = ['l1', 'l2', 'l3', 'l4'].flatMap((f) => readJson(new URL(`letters-levels-${f}.json`, CALIBRATION_DIR)).map((l, i) => ({
  id: `${f}-${i}`, task: l.seedQuestionId, text: l.text, category: l.category,
  verdicts: [{ lp: l.expected.lp, offTask: l.category === 'off_topic' }, { lp: l.examiner2.lp, offTask: l.examiner2.offTask }],
})));
const purposeFiles = fs.readdirSync(CALIBRATION_DIR).filter((f) => /^letters-purpose.*\.json$/.test(f)).sort();
const purpose = purposeFiles.flatMap((f) => readJson(new URL(f, CALIBRATION_DIR)).map((l, i) => ({
  id: `${f.replace(/^letters-|\.json$/g, '')}-${i}`, task: l.task, text: l.text, category: l.type,
  verdicts: [{ lp: null, offTask: l.offTask }, ...(l.examiner2 ? [{ lp: null, offTask: l.examiner2.offTask }] : [])],
})));
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
    else if (!p.endsWith('a1PurposeReviewModel.json')) hash.update(p).update(fs.readFileSync(p));
  });
  ['src/services', 'src/data/exams'].forEach((d) => walk(new URL(d, ROOT).pathname));
  return hash.digest('hex').slice(0, 16);
})();
const keywordCacheFile = path.join(os.homedir(), '.cache', 'telc-a1', 'keyword-verdicts.json');
const keywordCache = fs.existsSync(keywordCacheFile) ? readJson(keywordCacheFile) : {};
// One model session, as in the app: the keyword stage reads the pooled vectors, the review the sentence ones.
let extractors = null;
const loadExtractors = async () => (extractors ??= await createEmbeddingExtractors());
async function keywordVerdict(letter) {
  const key = `${sourceHash}:${sha(letter.task + letter.text)}`;
  if (!keywordCache[key]) {
    const { pooled } = await loadExtractors();
    clearEmbeddingCache();
    const result = await gradeSchreibenSubmission({
      userText: letter.text, question: await questionOf(letter.task), provider: new MicroRankerProvider(),
      options: { customExtractor: pooled },
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
async function embed(text) {
  const key = sha(DOC_PROMPT + text);
  if (!vectorCache[key]) {
    const { sentence } = await loadExtractors();
    vectorCache[key] = Array.from(prepareEmbeddingVector((await sentence(DOC_PROMPT + text)).data, 256));
  }
  return Float32Array.from(vectorCache[key]);
}
const bank = decodeExampleBank(readJson(new URL('src/data/exams/example-bank/vectors.json', ROOT)));

// --- rows: one per letter and examiner, each examiner counting half where there are two ---------------------------------
const rows = [];
for (const letter of letters) {
  const criteria = resolveLeitpunktCriteria(await questionOf(letter.task));
  const { bodySentences, rawText } = runStage0Preprocessing(letter.text, level);
  const keyword = await keywordVerdict(letter);
  const { units, sentencePurposeMargins, letterPurposeMargin } = await assessLetterUnits({
    sentences: bodySentences, letterText: rawText, embed, criteria,
    taskBank: bank.tasks[letter.task], neutral: bank.neutral, policy, model: sentenceModel,
  });
  const features = purposeFeatures({ criteria, units, sentencePurposeMargins, letterPurposeMargin, keywordLevels: keyword.levels });
  if (DROPPED >= 0) features[DROPPED] = 0;
  rows.push(...letter.verdicts.map((v) => ({ letter, keyword, features, weight: 1 / letter.verdicts.length, offTask: v.offTask ? 1 : 0 })));
}
fs.mkdirSync(path.dirname(vectorCacheFile), { recursive: true });
fs.writeFileSync(vectorCacheFile, JSON.stringify(vectorCache));
fs.writeFileSync(keywordCacheFile, JSON.stringify(keywordCache));

// --- head and threshold --------------------------------------------------------------------------------------------------
// A stronger fit to the task (purpose margins, support, keyword levels) can only argue against another purpose.
const SIGNS = PURPOSE_FEATURE_NAMES.map(() => -1);
const fitHead = (fit) => trainLogistic(fit, 'offTask', { lambda: LAMBDA, signs: SIGNS });
const tasksOf = (fit) => [...new Set(fit.map((r) => r.letter.task))].sort();

function outOfFoldScores(fit) {
  return tasksOf(fit).flatMap((task) => {
    const head = fitHead(fit.filter((r) => r.letter.task !== task));
    return fit.filter((r) => r.letter.task === task).map((r) => ({ row: r, p: applyLogisticHead(r.features, head), y: r.offTask }));
  });
}
// Room above the highest letter some examiner found on task, so no such letter is voided in the fold that set it.
function thresholdAboveOnTask(scored) {
  const top = Math.min(Math.max(...scored.filter((s) => !s.y).map((s) => s.p)), 1 - 1e-9);
  return 1 / (1 + Math.exp(-(Math.log(top / (1 - top)) + VOID_ROOM)));
}
// The review for some letters: a head on them and a threshold from their own leave-one-task-out scores.
const trainReview = (fit) => ({ head: fitHead(fit), threshold: thresholdAboveOnTask(outOfFoldScores(fit)) });

// --- honest measurement: every letter of a task is decided by a review trained without that task ---------------------
const records = tasks.flatMap((task) => {
  const review = trainReview(rows.filter((r) => r.letter.task !== task));
  return letters.filter((l) => l.task === task).map((letter) => {
    const { keyword, features } = rows.find((r) => r.letter === letter);
    return { letter, keyword, keywordVoid: Boolean(keyword.voidReason), reviewVoid: isAnotherPurpose(features, review) };
  });
});
const offTopic = (letter) => letter.verdicts.every((v) => v.offTask);
const gradedRecords = records.filter((r) => r.letter.verdicts[0].lp);
const offTopicGraded = gradedRecords.filter((r) => offTopic(r.letter));
const offTopicAll = records.filter((r) => offTopic(r.letter));
const caught = (some, withReview) => some.filter((r) => r.keywordVoid || (withReview && r.reviewVoid)).length;
const added = records.filter((r) => r.reviewVoid && !r.keywordVoid);
const addedFalse = added.filter((r) => !offTopic(r.letter));
const keywordFalse = records.filter((r) => r.keywordVoid && !offTopic(r.letter));

console.log(`Letters: ${graded.length} graded (two examiners), ${purpose.length} on/off purpose · code ${sourceHash} · sentence model ${sentenceModel.oofHash}`);
console.log('\nAnother purpose, leave one task out (threshold chosen without the task):');
console.log(`  graded off-topic letters voided: keyword ${wilson(caught(offTopicGraded, false), offTopicGraded.length)}, + review ${wilson(caught(offTopicGraded, true), offTopicGraded.length)}`);
console.log(`  all off-purpose letters voided: keyword ${wilson(caught(offTopicAll, false), offTopicAll.length)}, + review ${wilson(caught(offTopicAll, true), offTopicAll.length)}`);
console.log(`  voids the review adds on letters an examiner found on task: ${addedFalse.length} of ${records.length - offTopicAll.length}`);
addedFalse.forEach((r) => console.log(`    ${r.letter.id} ${r.letter.task} ${r.letter.category ?? 'purpose letter'}`));
console.log(`  (the keyword stage itself voids ${keywordFalse.length} such letters: ${keywordFalse.map((r) => `${r.letter.id} ${r.keyword.voidReason}`).join(', ') || '—'})`);
console.log(`  AUC ${auc(outOfFoldScores(rows).map((s) => [s.p, s.y])).toFixed(3)}`);

// Leitpunkt agreement with both examiners at a realistic share of off-topic letters (the calibration letters
// over-represent them); letters on task are untouched by the review.
const OFF_TOPIC_SHARE = 0.05;
function agreement(some, voided) {
  let agree = 0;
  let all = 0;
  for (const r of some) {
    for (const v of r.letter.verdicts) {
      const levels = voided(r) ? [0, 0, 0] : r.keyword.levels;
      levels.forEach((lv, k) => { all += 1 / r.letter.verdicts.length; if (lv === v.lp[k]) agree += 1 / r.letter.verdicts.length; });
    }
  }
  return agree / all;
}
const onTaskGraded = gradedRecords.filter((r) => r.letter.verdicts.every((v) => !v.offTask));
const blend = (voided) => (100 * ((1 - OFF_TOPIC_SHARE) * agreement(onTaskGraded, voided) + OFF_TOPIC_SHARE * agreement(offTopicGraded, voided))).toFixed(1);
console.log(`  Leitpunkt agreement at ${OFF_TOPIC_SHARE * 100}% off-topic letters: keyword ${blend((r) => r.keywordVoid)}%, + review ${blend((r) => r.keywordVoid || r.reviewVoid)}%`);

if (argValue('--records')) {
  fs.writeFileSync(argValue('--records'), JSON.stringify(records.map((r) => ({
    id: r.letter.id, task: r.letter.task, category: r.letter.category, text: r.letter.text,
    offTopic: offTopic(r.letter), keywordVoid: r.keywordVoid, reviewVoid: r.reviewVoid,
  })), null, 1));
}
const extraCaught = caught(offTopicGraded, true) - caught(offTopicGraded, false);
const go = addedFalse.length === 0 && extraCaught >= 4;
console.log(`\nGo criteria (no added void on a letter on task, at least 4 more graded off-topic letters caught): ${go ? 'GO' : 'NO-GO'}`);

const final = trainReview(rows);
console.log(`Final head: threshold ${final.threshold.toFixed(3)}; weights ${PURPOSE_FEATURE_NAMES.map((n, i) => `${n} ${final.head.weights[i].toFixed(2)}`).join(', ')}`);

if (process.argv.includes('--save') && DROPPED < 0) {
  // A head that failed its go criteria is stored as off (null), so the app keeps the keyword stage's voids alone.
  fs.writeFileSync(REVIEW_FILE, JSON.stringify({
    version: 1, sentenceModel: sentenceModel.oofHash, code: sourceHash, features: PURPOSE_FEATURE_NAMES,
    head: go ? final.head : null, threshold: go ? final.threshold : null,
  }, null, 2) + '\n');
  console.log(`\nSaved ${REVIEW_FILE.pathname}${go ? '' : ' (head off: NO-GO)'}`);
}
