/**
 * Trains the Leitpunkt evidence heads (support, contradiction) on the calibration sentences and reports them
 * against the plain nearest-example rule, task by task left out (leave-one-task-out cross-validation), then on the
 * held-out and adversarial sentences. Letters of the open and hidden sets are never read here.
 * Usage: node --import ./tests/support/loadLexiconData.js scripts/eval/train-evidence-model.mjs [--embedding old] [--save]
 *   --save writes the heads to src/services/schreiben/grading/policies/a1EvidenceModel.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createSentenceEmbedder } from '../../src/services/embeddings/embeddingService.js';
import { prepareEmbeddingVector } from '../../src/services/schreiben/grading/vectorMath.js';
import { computeEvidenceFeatures, applyLogisticHead, FEATURE_NAMES, MISS_TYPES } from '../../src/services/schreiben/grading/evidenceFeatures.js';
import { computeFallbackEvidence, partitionAspectKeywordsSync } from '../../src/services/schreiben/grading/rankerFallbackScorer.js';
import { detectSemanticInversion } from '../../src/services/schreiben/linguistic/semanticPolarityValidator.js';
import { resolveLevelContext } from '../../src/services/schreiben/levelContext.js';
import { learnerVariant } from './learnerNoise.mjs';

const ROOT = new URL('../../', import.meta.url);
const BANK_DIR = new URL('src/data/exams/example-bank/', ROOT);
const CALIBRATION_DIR = new URL('scripts/eval/calibration/', ROOT);
const MODEL_FILE = new URL('src/services/schreiben/grading/policies/a1EvidenceModel.json', ROOT);
const embeddingKind = process.argv.includes('--embedding') ? process.argv[process.argv.indexOf('--embedding') + 1] : 'sentence';
const DOC_PROMPT = embeddingKind === 'old' ? 'task: search result | text: ' : 'title: none | text: ';

const level = resolveLevelContext('A1');
await level.lexicon.load();
const { policy } = level;

// --- embeddings, cached on disk per embedding kind -------------------------------------------------------------
const cacheFile = path.join(os.homedir(), '.cache', 'telc-a1', `vectors-${embeddingKind}.json`);
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
let extractor = null;
async function embed(text) {
  const key = crypto.createHash('sha1').update(DOC_PROMPT + text).digest('hex');
  if (!cache[key]) {
    if (!extractor) {
      if (embeddingKind === 'old') {
        const { pipeline } = await import('@huggingface/transformers');
        const pipe = await pipeline('feature-extraction', 'onnx-community/embeddinggemma-300m-ONNX', { dtype: 'q4' });
        extractor = (prompt) => pipe(prompt, { pooling: 'mean', normalize: false });
      } else {
        extractor = await createSentenceEmbedder();
      }
    }
    cache[key] = Array.from(prepareEmbeddingVector((await extractor(DOC_PROMPT + text)).data, 256));
  }
  return cache[key];
}

// --- example bank, widened with deterministic learner-error variants ---------------------------------------------
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const withVariants = (phrases) => [...phrases, ...phrases.map((p, i) => learnerVariant(p, { seed: i + 1 }))];
const neutralVecs = await Promise.all(withVariants(readJson(new URL('neutral.json', BANK_DIR)).neutral).map(embed));
const banks = {};
for (const file of fs.readdirSync(BANK_DIR).filter((f) => /^s\d+-q6\.json$/.test(f))) {
  const bank = readJson(new URL(file, BANK_DIR));
  const units = {};
  for (const [key, unit] of Object.entries(bank.units)) {
    units[key] = {
      fulfils: await Promise.all(withVariants(unit.fulfils).map(embed)),
      misses: Object.fromEntries(await Promise.all(MISS_TYPES.map(async (t) => [t, await Promise.all(withVariants(unit.misses[t] || []).map(embed))]))),
    };
  }
  banks[bank.task] = { units, otherPurpose: await Promise.all(withVariants(bank.otherPurpose).map(embed)) };
}

// --- rubric criteria for the deterministic features ---------------------------------------------------------------
const criteriaByTask = {};
for (const task of Object.keys(banks)) {
  const n = task.match(/^s(\d+)-/)[1];
  const { questions } = await import(new URL(`src/data/exams/seeds/schreiben-modellsatz-${n}.js`, ROOT));
  criteriaByTask[task] = questions.find((q) => q.id === task).options_json.rubric.leitpunkte_criteria;
}
function deterministicFeatures(task, unitKey, text) {
  const [lpId, aspectLabel] = unitKey.split(':');
  const criterion = criteriaByTask[task].find((c) => c.id === lpId);
  const label = aspectLabel || criterion.label;
  const keywords = aspectLabel
    ? partitionAspectKeywordsSync(criterion, criterion.label.split(/\s+(?:und|sowie|\/)\s+/i), { policy })[aspectLabel] || []
    : criterion.keywords || [];
  const evidence = (criterion.aspects || []).find((a) => a.label === aspectLabel)?.evidence || criterion.evidence || null;
  const { lexical, structured } = computeFallbackEvidence({ label, keywords, evidence }, text, { policy });
  const negated = detectSemanticInversion(text, criterion, { lexicon: policy.lexicon })?.isInverted || false;
  return { lexical, structured, negated };
}

async function featureRows(items) {
  const rows = [];
  for (const item of items) {
    const bank = banks[item.task];
    if (!bank) continue;
    const vec = await embed(item.text);
    for (const [unitKey, label] of Object.entries(item.labels)) {
      if (!bank.units[unitKey]) continue;
      const rivalFulfils = Object.entries(bank.units).filter(([k]) => k.split(':')[0] !== unitKey.split(':')[0]).flatMap(([, u]) => u.fulfils);
      const features = computeEvidenceFeatures(vec, bank.units[unitKey], {
        rivalFulfils, otherPurpose: bank.otherPurpose, neutral: neutralVecs, ...deterministicFeatures(item.task, unitKey, item.text),
      });
      rows.push({ task: item.task, text: item.text, unitKey, features, support: label === 'support' ? 1 : 0, contradict: label === 'contradict' ? 1 : 0 });
    }
  }
  return rows;
}

// --- logistic regression with L2, standardised features, balanced classes -------------------------------------------
function trainHead(rows, target, { lambda = 1, epochs = 1500, rate = 0.1 } = {}) {
  const dim = FEATURE_NAMES.length;
  const mean = Array.from({ length: dim }, (_, i) => rows.reduce((s, r) => s + r.features[i], 0) / rows.length);
  const scale = mean.map((m, i) => Math.sqrt(rows.reduce((s, r) => s + (r.features[i] - m) ** 2, 0) / rows.length) || 1);
  const positives = rows.filter((r) => r[target]).length;
  const weightOf = (y) => (y ? rows.length / (2 * positives) : rows.length / (2 * (rows.length - positives)));
  const head = { weights: new Array(dim).fill(0), bias: 0, mean, scale };
  for (let epoch = 0; epoch < epochs; epoch++) {
    const grad = new Array(dim).fill(0);
    let gradBias = 0;
    for (const r of rows) {
      const err = (applyLogisticHead(r.features, head) - r[target]) * weightOf(r[target]);
      r.features.forEach((v, i) => { grad[i] += err * ((v - mean[i]) / scale[i]); });
      gradBias += err;
    }
    head.weights = head.weights.map((w, i) => w - rate * (grad[i] / rows.length + (lambda * w) / rows.length));
    head.bias -= rate * (gradBias / rows.length);
  }
  return head;
}

function auc(scores, labels) {
  const pos = scores.filter((_, i) => labels[i]); const neg = scores.filter((_, i) => !labels[i]);
  if (!pos.length || !neg.length) return NaN;
  let wins = 0;
  for (const p of pos) for (const n of neg) wins += p > n ? 1 : p === n ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}
const idx = (name) => FEATURE_NAMES.indexOf(name);
const ruleSupport = (r) => r.features[idx('fulfilTop1')];
const ruleContradict = (r) => -r.features[idx('missMarginTop1')];

function report(name, rows, scorer) {
  const s = auc(rows.map((r) => scorer.support(r)), rows.map((r) => r.support));
  const c = auc(rows.map((r) => scorer.contradict(r)), rows.map((r) => r.contradict));
  console.log(`${name.padEnd(44)} support AUC ${s.toFixed(3)}  contradiction AUC ${c.toFixed(3)}  (n=${rows.length})`);
}

// --- data -----------------------------------------------------------------------------------------------------------
const loadSentences = (file) => (fs.existsSync(new URL(file, CALIBRATION_DIR)) ? readJson(new URL(file, CALIBRATION_DIR)) : []);
const agreed = (items) => items.filter((it) => it.agreed !== false);
const trainItems = agreed([...loadSentences('sentences-b1.json'), ...loadSentences('sentences-b2.json')]);
const augmented = [...trainItems, ...trainItems.map((it, i) => ({ ...it, text: learnerVariant(it.text, { seed: 1000 + i }) }))];
const trainRows = await featureRows(augmented);
const heldoutRows = await featureRows(agreed(loadSentences('sentences-heldout.json')));
const adversarialRows = await featureRows(agreed(loadSentences('sentences-adversarial.json')));
fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
fs.writeFileSync(cacheFile, JSON.stringify(cache));

console.log(`Embedding: ${embeddingKind} · train ${trainItems.length} sentences (+ learner variants), ${trainRows.length} unit pairs`);
const rule = { support: ruleSupport, contradict: ruleContradict };
const cvScores = { support: [], contradict: [] };
for (const task of Object.keys(banks)) {
  const fit = trainRows.filter((r) => r.task !== task);
  const heads = { support: trainHead(fit, 'support'), contradict: trainHead(fit, 'contradict') };
  for (const r of trainRows.filter((x) => x.task === task)) {
    cvScores.support.push([applyLogisticHead(r.features, heads.support), r.support]);
    cvScores.contradict.push([applyLogisticHead(r.features, heads.contradict), r.contradict]);
  }
}
console.log('\nLeave one task out (train sentences):');
report('nearest-example rule', trainRows, rule);
console.log(`${'logistic heads'.padEnd(44)} support AUC ${auc(...unzip(cvScores.support)).toFixed(3)}  contradiction AUC ${auc(...unzip(cvScores.contradict)).toFixed(3)}`);
function unzip(pairs) { return [pairs.map((p) => p[0]), pairs.map((p) => p[1])]; }

const heads = { support: trainHead(trainRows, 'support'), contradict: trainHead(trainRows, 'contradict') };
const model = { support: (r) => applyLogisticHead(r.features, heads.support), contradict: (r) => applyLogisticHead(r.features, heads.contradict) };
console.log('\nHeld-out sentences (another writer):');
report('nearest-example rule', heldoutRows, rule);
report('logistic heads', heldoutRows, model);
console.log('\nAdversarial sentences:');
report('nearest-example rule', adversarialRows, rule);
report('logistic heads', adversarialRows, model);
console.log('\nWeights (standardised):');
FEATURE_NAMES.forEach((name, i) => console.log(`  ${name.padEnd(18)} support ${heads.support.weights[i].toFixed(2).padStart(6)}  contradict ${heads.contradict.weights[i].toFixed(2).padStart(6)}`));

if (process.argv.includes('--save')) {
  fs.writeFileSync(MODEL_FILE, JSON.stringify({
    version: 1, embedding: { model: 'onnx-community/embeddinggemma-300m-ONNX', dtype: 'q4', output: embeddingKind, prompt: DOC_PROMPT, dimension: 256 },
    features: FEATURE_NAMES, support: heads.support, contradict: heads.contradict,
  }, null, 2) + '\n');
  console.log(`\nSaved ${MODEL_FILE.pathname}`);
}
