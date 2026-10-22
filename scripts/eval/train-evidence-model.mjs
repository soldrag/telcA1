/**
 * Trains the Leitpunkt evidence heads (supports / contradicts a unit) and the another-purpose letter head, and
 * reports them honestly: leave one task out on the training writer, then another writer and adversarial sentences
 * at frozen thresholds. Open and hidden letters are never read here.
 * Usage: node --import ./tests/support/loadLexiconData.js scripts/eval/train-evidence-model.mjs [--save]
 *   --save writes policies/a1EvidenceModel.json and the bank vectors (example-bank/vectors.json)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createSentenceEmbedder } from '../../src/services/embeddings/embeddingService.js';
import { prepareEmbeddingVector } from '../../src/services/schreiben/grading/vectorMath.js';
import { applyLogisticHead, FEATURE_NAMES, MISS_TYPES } from '../../src/services/schreiben/grading/evidenceFeatures.js';
import { encodeVector, decodeExampleBank } from '../../src/services/schreiben/grading/exampleBankVectors.js';
import { scoreUnitSpan, assessLetterUnits, offTaskFeatures } from '../../src/services/schreiben/grading/unitEvidence.js';
import { runStage0Preprocessing } from '../../src/services/schreiben/grading/stage0Preprocessing.js';
import { resolveLevelContext } from '../../src/services/schreiben/levelContext.js';
import { learnerVariant } from './learnerNoise.mjs';

const ROOT = new URL('../../', import.meta.url);
const BANK_DIR = new URL('src/data/exams/example-bank/', ROOT);
const CALIBRATION_DIR = new URL('scripts/eval/calibration/', ROOT);
const MODEL_FILE = new URL('src/services/schreiben/grading/policies/a1EvidenceModel.json', ROOT);
const VECTORS_FILE = new URL('vectors.json', BANK_DIR);
const DOC_PROMPT = 'title: none | text: ';
const MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';

const level = resolveLevelContext('A1');
await level.lexicon.load();
const { policy } = level;
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));

// --- embeddings, cached on disk ---------------------------------------------------------------------------------------
const cacheFile = path.join(os.homedir(), '.cache', 'telc-a1', 'vectors-sentence.json');
const cache = fs.existsSync(cacheFile) ? readJson(cacheFile) : {};
let extractor = null;
async function embed(text) {
  const key = crypto.createHash('sha1').update(DOC_PROMPT + text).digest('hex');
  if (!cache[key]) {
    extractor ??= await createSentenceEmbedder();
    cache[key] = Array.from(prepareEmbeddingVector((await extractor(DOC_PROMPT + text)).data, 256));
  }
  return Float32Array.from(cache[key]);
}

// --- example bank: phrases + one deterministic learner-error variant each, stored as int8 like the app reads it -------
const withVariants = (phrases = []) => [...phrases, ...phrases.map((p, i) => learnerVariant(p, { seed: i + 1 }))];
const encodeAll = async (phrases) => Promise.all(withVariants(phrases).map(async (p) => encodeVector(await embed(p))));
const bankFiles = fs.readdirSync(BANK_DIR).filter((f) => /^s\d+-q6\.json$/.test(f)).sort();
const stored = { meta: {}, neutral: await encodeAll(readJson(new URL('neutral.json', BANK_DIR)).neutral), tasks: {} };
for (const file of bankFiles) {
  const taskBank = readJson(new URL(file, BANK_DIR));
  const units = {};
  for (const [key, unit] of Object.entries(taskBank.units)) {
    units[key] = { fulfils: await encodeAll(unit.fulfils), misses: {} };
    for (const type of MISS_TYPES) units[key].misses[type] = await encodeAll(unit.misses[type]);
  }
  stored.tasks[taskBank.task] = { units, otherPurpose: await encodeAll(taskBank.otherPurpose) };
}
const bankSources = [...bankFiles, 'neutral.json'].map((f) => fs.readFileSync(new URL(f, BANK_DIR), 'utf8')).join('\n')
  + fs.readFileSync(new URL('scripts/eval/learnerNoise.mjs', ROOT), 'utf8');
stored.meta = {
  model: MODEL_ID, dtype: 'q4', output: 'sentence_embedding', prompt: DOC_PROMPT, dimension: 256,
  dataHash: crypto.createHash('sha256').update(bankSources).digest('hex').slice(0, 16),
};
const bank = decodeExampleBank(stored);

const criteriaByTask = {};
for (const task of Object.keys(bank.tasks)) {
  const n = task.match(/^s(\d+)-/)[1];
  const { questions } = await import(new URL(`src/data/exams/seeds/schreiben-modellsatz-${n}.js`, ROOT));
  criteriaByTask[task] = questions.find((q) => q.id === task).options_json.rubric.leitpunkte_criteria;
}
const criterionOf = (task, unitKey) => criteriaByTask[task].find((c) => c.id === unitKey.split(':')[0]);

// --- calibration sentences ---------------------------------------------------------------------------------------------
const loadSentences = (file) => readJson(new URL(file, CALIBRATION_DIR)).map((item) => ({ ...item, source: file }));
const NEAR_DUPLICATE = 0.95;
const dropReport = {};
async function repeatsBank(item) {
  const vec = await embed(item.text);
  const taskBank = bank.tasks[item.task];
  const phrases = [...Object.values(taskBank.units).flatMap((u) => [...u.fulfils, ...Object.values(u.misses).flat()]), ...taskBank.otherPurpose];
  return phrases.some((p) => p.reduce((s, x, i) => s + x * vec[i], 0) > NEAR_DUPLICATE);
}
// A sentence that nearly repeats a bank phrase would test the bank on itself; its learner variant goes with it.
async function withoutBankCopies(items) {
  const kept = [];
  for (const item of items) {
    if (await repeatsBank(item)) {
      const labels = Object.values(item.labels);
      const kind = labels.includes('contradict') ? 'contradict' : labels.includes('support') ? 'support' : 'none';
      const key = `${item.source}:${kind}`;
      dropReport[key] = (dropReport[key] || 0) + 1;
    } else kept.push(item);
  }
  return kept;
}

async function rowsOf(items) {
  const rows = [];
  for (const item of items) {
    const vector = await embed(item.text);
    for (const [unitKey, label] of Object.entries(item.labels)) {
      if (!bank.tasks[item.task]?.units[unitKey] || item.disputed?.includes(unitKey)) continue;
      const { features } = scoreUnitSpan({
        vector, text: item.text, unitKey, criterion: criterionOf(item.task, unitKey),
        taskBank: bank.tasks[item.task], neutral: bank.neutral, policy, model: null,
      });
      rows.push({
        task: item.task, features, support: label === 'support' ? 1 : 0, contradict: label === 'contradict' ? 1 : 0,
        hardNegative: label === 'none' && features[FEATURE_NAMES.indexOf('lexical')] > 0,
      });
    }
  }
  return rows;
}

const trainItems = await withoutBankCopies([...loadSentences('sentences-b1.json'), ...loadSentences('sentences-b2.json')]);
const trainRows = await rowsOf([...trainItems, ...trainItems.map((it, i) => ({ ...it, text: learnerVariant(it.text, { seed: 1000 + i }) }))]);
const heldoutRows = await rowsOf(await withoutBankCopies(loadSentences('sentences-heldout.json')));
const adversarialRows = await rowsOf(await withoutBankCopies(loadSentences('sentences-adversarial.json')));

// --- logistic heads: standardised features, balanced classes, L2, sign constraints -----------------------------------
// Supporting evidence can only raise support; a closer refusal or opposite act can only raise a contradiction.
const SIGN = {
  support: FEATURE_NAMES.map((n) => (n === 'negated' ? -1 : 1)),
  contradict: FEATURE_NAMES.map((n) => ({ marginOver_refusal: -1, marginOver_opposite: -1, negated: 1 })[n]),
};

function trainHead(rows, target, { lambda, signs = SIGN[target], featureCount = FEATURE_NAMES.length, epochs = 1500, rate = 0.1 }) {
  const mean = Array.from({ length: featureCount }, (_, i) => rows.reduce((s, r) => s + r.features[i], 0) / rows.length);
  const scale = mean.map((m, i) => Math.sqrt(rows.reduce((s, r) => s + (r.features[i] - m) ** 2, 0) / rows.length) || 1);
  const positives = rows.filter((r) => r[target]).length;
  const weightOf = (y) => (y ? rows.length / (2 * positives) : rows.length / (2 * (rows.length - positives)));
  const head = { weights: new Array(featureCount).fill(0), bias: 0, mean, scale };
  for (let epoch = 0; epoch < epochs; epoch++) {
    const grad = new Array(featureCount).fill(0);
    let gradBias = 0;
    for (const r of rows) {
      const err = (applyLogisticHead(r.features, head) - r[target]) * weightOf(r[target]);
      r.features.forEach((v, i) => { grad[i] += err * ((v - mean[i]) / scale[i]); });
      gradBias += err;
    }
    head.weights = head.weights.map((w, i) => {
      const next = w - rate * (grad[i] / rows.length + lambda * w);
      return signs[i] === 1 ? Math.max(0, next) : signs[i] === -1 ? Math.min(0, next) : next;
    });
    head.bias -= rate * (gradBias / rows.length);
  }
  return head;
}

function auc(pairs) {
  const pos = pairs.filter(([, y]) => y).map(([s]) => s);
  const neg = pairs.filter(([, y]) => !y).map(([s]) => s);
  if (!pos.length || !neg.length) return NaN;
  let wins = 0;
  for (const p of pos) for (const n of neg) wins += p > n ? 1 : p === n ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}

// Wilson score interval for a proportion.
function wilson(k, n, z = 1.96) {
  if (n === 0) return '—';
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return `${p.toFixed(2)} [${Math.max(0, c - h).toFixed(2)}–${Math.min(1, c + h).toFixed(2)}] (${k}/${n})`;
}

function outOfFold(rows, lambda) {
  const oof = [];
  for (const task of Object.keys(bank.tasks)) {
    const fit = rows.filter((r) => r.task !== task);
    const heads = { support: trainHead(fit, 'support', { lambda }), contradict: trainHead(fit, 'contradict', { lambda }) };
    for (const r of rows.filter((x) => x.task === task)) {
      oof.push({ ...r, pSupport: applyLogisticHead(r.features, heads.support), pContradict: applyLogisticHead(r.features, heads.contradict) });
    }
  }
  return oof;
}

// Lowest score at which the precision of everything scored at least as high reaches the target.
function thresholdAtPrecision(pairs, target) {
  const ranked = [...pairs].sort((a, b) => b[0] - a[0]);
  let tp = 0;
  let best = Infinity;
  ranked.forEach(([score, y], i) => { if (y) tp += 1; if (tp / (i + 1) >= target) best = score; });
  return best;
}
// Score that balances precision and recall best (F1): under- and over-crediting a point cost the same.
function thresholdAtBestF1(pairs) {
  const ranked = [...pairs].sort((a, b) => b[0] - a[0]);
  const positives = ranked.filter(([, y]) => y).length;
  let tp = 0;
  let best = { f1: -1, score: Infinity };
  ranked.forEach(([score, y], i) => {
    if (y) tp += 1;
    const f1 = (2 * tp) / (i + 1 + positives);
    if (f1 > best.f1) best = { f1, score };
  });
  return best.score;
}
function thresholdAtRecall(pairs, target) {
  const positives = pairs.filter(([, y]) => y).map(([s]) => s).sort((a, b) => b - a);
  return positives[Math.max(0, Math.ceil(target * positives.length) - 1)] ?? 0;
}

// --- training --------------------------------------------------------------------------------------------------------
console.log(`Bank ${stored.meta.dataHash} · train ${trainItems.length} sentences (+ learner variants), ${trainRows.length} unit pairs`);
console.log('Left out as near copies of bank phrases (file:kind):', JSON.stringify(dropReport));

// L2 strength by leave-one-task-out; in practice the sign constraints regularise and λ barely matters.
const byLambda = [0.0001, 0.001, 0.01].map((lambda) => {
  const oof = outOfFold(trainRows, lambda);
  return { lambda, oof, support: auc(oof.map((r) => [r.pSupport, r.support])), contradict: auc(oof.map((r) => [r.pContradict, r.contradict])) };
});
byLambda.forEach((r) => console.log(`λ ${r.lambda}: leave-one-task-out support AUC ${r.support.toFixed(3)}, contradiction AUC ${r.contradict.toFixed(3)}`));
const chosen = byLambda.reduce((a, b) => (b.support + b.contradict > a.support + a.contradict ? b : a));
const { oof, lambda } = chosen;

const ruleSupport = (r) => r.features[0];
const ruleContradict = (r) => -Math.min(...MISS_TYPES.map((t) => r.features[FEATURE_NAMES.indexOf(`marginOver_${t}`)]));
console.log(`\nChosen λ ${lambda}. Leave one task out:`);
console.log(`  support AUC: rule ${auc(trainRows.map((r) => [ruleSupport(r), r.support])).toFixed(3)} · heads ${chosen.support.toFixed(3)}`);
console.log(`  contradiction AUC: rule ${auc(trainRows.map((r) => [ruleContradict(r), r.contradict])).toFixed(3)} · heads ${chosen.contradict.toFixed(3)}`);
const hard = oof.filter((r) => r.contradict || r.hardNegative);
console.log(`  contradiction AUC against hard negatives only (same unit, topic words, not supporting): ${auc(hard.map((r) => [r.pContradict, r.contradict])).toFixed(3)}`);
const perTask = Object.keys(bank.tasks).map((t) => [t, auc(oof.filter((r) => r.task === t).map((r) => [r.pSupport, r.support]))]);
const worst = perTask.reduce((a, b) => (b[1] < a[1] ? b : a));
console.log(`  worst task support AUC: ${worst[0]} ${worst[1].toFixed(3)}`);

const thresholds = {
  full: thresholdAtBestF1(oof.map((r) => [r.pSupport, r.support])),
  partial: thresholdAtRecall(oof.map((r) => [r.pSupport, r.support]), 0.90),
  contradict: thresholdAtPrecision(oof.map((r) => [r.pContradict, r.contradict]), 0.95),
};
console.log(`  thresholds from out-of-fold scores: full ${thresholds.full.toFixed(3)} (support F1 best), partial ${thresholds.partial.toFixed(3)} (support recall 0.90), contradiction ${thresholds.contradict.toFixed(3)} (precision 0.95)`);

const heads = { support: trainHead(trainRows, 'support', { lambda }), contradict: trainHead(trainRows, 'contradict', { lambda }) };
function frozenReport(name, rows) {
  const scored = rows.map((r) => ({ ...r, pSupport: applyLogisticHead(r.features, heads.support), pContradict: applyLogisticHead(r.features, heads.contradict) }));
  const full = scored.filter((r) => r.pSupport >= thresholds.full);
  const partialUp = scored.filter((r) => r.pSupport >= thresholds.partial);
  const contra = scored.filter((r) => r.pContradict >= thresholds.contradict);
  const supports = scored.filter((r) => r.support).length;
  const contradictions = scored.filter((r) => r.contradict).length;
  console.log(`\n${name} (n=${rows.length}): support AUC ${auc(scored.map((r) => [r.pSupport, r.support])).toFixed(3)}, contradiction AUC ${auc(scored.map((r) => [r.pContradict, r.contradict])).toFixed(3)}`);
  console.log(`  ≥ full: precision ${wilson(full.filter((r) => r.support).length, full.length)}, recall ${wilson(full.filter((r) => r.support).length, supports)}`);
  console.log(`  ≥ partial: precision ${wilson(partialUp.filter((r) => r.support).length, partialUp.length)}, recall ${wilson(partialUp.filter((r) => r.support).length, supports)}`);
  console.log(`  ≥ contradiction: precision ${wilson(contra.filter((r) => r.contradict).length, contra.length)}, recall ${wilson(contra.filter((r) => r.contradict).length, contradictions)}`);
}
frozenReport('Another writer', heldoutRows);
frozenReport('Adversarial', adversarialRows);
console.log('\nWeights (standardised):');
FEATURE_NAMES.forEach((name, i) => console.log(`  ${name.padEnd(24)} support ${heads.support.weights[i].toFixed(2).padStart(6)}  contradict ${heads.contradict.weights[i].toFixed(2).padStart(6)}`));

// --- another-purpose letters -----------------------------------------------------------------------------------------
const evidenceModel = { support: heads.support, contradict: heads.contradict, thresholds };
const letters = [];
for (const letter of readJson(new URL('letters-purpose.json', CALIBRATION_DIR))) {
  const sentences = runStage0Preprocessing(letter.text, level).bodySentences;
  const criteria = criteriaByTask[letter.task];
  const { units, sentenceOtherPurposeMargins } = await assessLetterUnits({
    sentences, embed, criteria, taskBank: bank.tasks[letter.task], neutral: bank.neutral, policy, model: evidenceModel,
  });
  const features = offTaskFeatures({ criteria, units, sentenceOtherPurposeMargins, thresholds });
  letters.push({ task: letter.task, features: features.values, fullLeitpunkte: features.fullLeitpunkte, offTask: letter.offTask ? 1 : 0 });
}
const OFF_TASK_FEATURES = ['meanOtherPurposeMargin', 'minOtherPurposeMargin', 'reasonSupport'];
// A sentence closer to the task than to another purpose, and a stated reason for writing, can only argue against.
const offTaskSigns = [-1, -1, -1];
const offTaskOof = [];
for (const task of Object.keys(bank.tasks)) {
  const head = trainHead(letters.filter((l) => l.task !== task), 'offTask', { lambda, signs: offTaskSigns, featureCount: OFF_TASK_FEATURES.length });
  letters.filter((l) => l.task === task).forEach((l) => offTaskOof.push({ ...l, p: applyLogisticHead(l.features, head) }));
}
// No valid letter may be voided: the threshold sits above every on-task letter's out-of-fold score.
const guarded = (l) => l.fullLeitpunkte < 2;
const offTaskThreshold = Math.max(...offTaskOof.filter((l) => !l.offTask && guarded(l)).map((l) => l.p)) + 1e-6;
const caught = offTaskOof.filter((l) => l.offTask && guarded(l) && l.p >= offTaskThreshold).length;
const offTaskTotal = offTaskOof.filter((l) => l.offTask).length;
console.log(`\nAnother-purpose letters (${letters.length}, leave one task out): AUC ${auc(offTaskOof.map((l) => [l.p, l.offTask])).toFixed(3)}; at zero false voids it finds ${wilson(caught, offTaskTotal)} of the off-task letters`);
const offTaskHead = trainHead(letters, 'offTask', { lambda, signs: offTaskSigns, featureCount: OFF_TASK_FEATURES.length });

fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
fs.writeFileSync(cacheFile, JSON.stringify(cache));

if (process.argv.includes('--save')) {
  const oofHash = crypto.createHash('sha256').update(JSON.stringify(oof.map((r) => [r.pSupport, r.pContradict]))).digest('hex').slice(0, 16);
  fs.writeFileSync(VECTORS_FILE, JSON.stringify(stored) + '\n');
  fs.writeFileSync(MODEL_FILE, JSON.stringify({
    version: 2, bank: stored.meta, lambda, oofHash, features: FEATURE_NAMES,
    support: heads.support, contradict: heads.contradict, thresholds,
    offTask: { features: OFF_TASK_FEATURES, head: offTaskHead, threshold: offTaskThreshold },
  }, null, 2) + '\n');
  console.log(`\nSaved ${MODEL_FILE.pathname} and ${VECTORS_FILE.pathname}`);
}
