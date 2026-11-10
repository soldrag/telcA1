/**
 * Trains the keyword-free evidence head (one softmax head over span–unit cosine features + letter thresholds).
 *   node --import ./tests/support/loadLexiconData.js scripts/eval/evidence-head/train.mjs --loto [--out file]
 *     leave one task out: for each task, head and thresholds from the other six, graded on that task's open and
 *     calibration letters — the honest accuracy for a new task; prints the measures, --out writes per-letter levels.
 *   ... train.mjs --save file   head and thresholds trained on all seven tasks (thresholds by leave one task out).
 * Training data: teacher/*.txt and calibration sentences only; evaluation letters are graded, never trained on.
 */

import fs from 'node:fs';
import { openVectorStore } from './vectorStore.mjs';
import { createLeakGuard, teacherRows, calibrationRows, readTeacherTask } from './trainingData.mjs';
import { loadTasks, trainingUnit, gradingUnits, unitTexts, vectorizeUnit, featureRows, fitHead, readLetter, TASK_IDS } from './headModel.mjs';
import { chooseThresholds } from './thresholdSearch.mjs';
import { loadEvaluationLetters, readEvaluationLetter, summarize } from './evaluationLetters.mjs';

const arg = (flag) => { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : null; };
const tasks = await loadTasks();
const letters = await loadEvaluationLetters(tasks);
const isLeak = createLeakGuard(letters.map((l) => l.text));
const bankKeys = (t) => Object.keys(tasks[t].bank.units);
const rowsOf = (ids) => [...ids.flatMap((t) => teacherRows(t, bankKeys(t), isLeak)), ...calibrationRows(ids, isLeak)];

const store = await openVectorStore();
const vec = new Map();
async function embedAll(texts) {
  const unique = [...new Set(texts)].filter((t) => !vec.has(t));
  (await store.embed(unique)).forEach((v, i) => vec.set(unique[i], v));
}

const trainingUnits = {};
const unitOf = (t, key) => (trainingUnits[`${t}|${key}`] ??= vectorizeUnit(trainingUnit(tasks[t], key), vec));
const gradingGroups = {};
const groupsOf = (t) => (gradingGroups[t] ??= gradingUnits(tasks[t]).map((g) => ({ ...g, units: g.units.map((u) => vectorizeUnit(u, vec)) })));

const allRows = rowsOf(TASK_IDS);
const teacher = Object.fromEntries(TASK_IDS.map((t) => [t, readTeacherTask(t, bankKeys(t))]));
await embedAll([
  ...allRows.map((r) => r.text),
  ...TASK_IDS.flatMap((t) => [...bankKeys(t).flatMap((k) => unitTexts(trainingUnit(tasks[t], k))), ...gradingUnits(tasks[t]).flatMap((g) => g.units.flatMap(unitTexts))]),
  ...Object.values(teacher).flatMap((x) => [...x.sentences.map((s) => s.text), ...x.letters.flatMap((l) => l.sentences.slice(1).map((i, k) => `${x.sentences[l.sentences[k]].text} ${x.sentences[i].text}`))]),
  ...letters.flatMap((l) => [...l.spans, l.text]),
  ...TASK_IDS.flatMap((t) => [...tasks[t].bank.purposeLetters.onTask, ...tasks[t].bank.purposeLetters.offTask]),
]);
store.close();
const featured = featureRows(allRows, unitOf, vec);

const headFor = (ids) => fitHead(featured.filter((r) => ids.includes(r.task)));

function teacherLetterReadings(head, t) {
  const { sentences, letters: tl } = teacher[t];
  return tl.map((l) => {
    const ss = l.sentences.map((i) => sentences[i].text);
    const spans = [...new Set([...ss, ...ss.slice(1).map((s, i) => `${ss[i]} ${s}`)])];
    return { readings: readLetter(head, groupsOf(t), { spans, whole: new Set(ss) }, vec), expected: teacherLevels(t, l, sentences) };
  });
}

// A teacher letter's expected levels follow from its sentence labels and the rubric's declared aspects.
function teacherLevels(t, letter, sentences) {
  const rank = { F: 2, P: 1, C: 0, I: 0 };
  const best = {};
  for (const i of letter.sentences) for (const [k, c] of Object.entries(sentences[i].labels)) best[k] = Math.max(best[k] ?? 0, rank[c]);
  return tasks[t].criteria.map((c) => {
    const aspects = (c.aspects || []).map((a) => best[`${c.id}:${a.label}`] ?? 0);
    if (aspects.length) return aspects.every((v) => v === 2) ? 2 : aspects.some((v) => v >= 1) ? 1 : 0;
    return Math.max(...Object.entries(best).filter(([k]) => k.split(':')[0] === c.id).map(([, v]) => v));
  });
}

function heldOutReadings(head, t) {
  const sentences = featured.filter((r) => r.task === t).map((r) => {
    const unit = unitOf(t, r.key);
    const { support, contradiction } = readLetter(head, [{ units: [unit] }], { spans: [r.text], whole: new Set([r.text]) }, vec)[0][0];
    return { support, contradiction, cls: r.cls };
  });
  return { letters: teacherLetterReadings(head, t), sentences };
}

function thresholdsFor(ids) {
  const parts = ids.map((g) => heldOutReadings(headFor(ids.filter((t) => t !== g)), g));
  return chooseThresholds({ letters: parts.flatMap((p) => p.letters), sentences: parts.flatMap((p) => p.sentences) });
}

if (process.argv.includes('--loto')) {
  const graded = [];
  for (const f of TASK_IDS) {
    const train = TASK_IDS.filter((t) => t !== f);
    const thresholds = thresholdsFor(train);
    const head = headFor(train);
    console.log(`fold ${f}: thresholds`, thresholds);
    for (const L of letters.filter((l) => l.task === f)) graded.push({ ...L, got: readEvaluationLetter({ head, thresholds, groups: groupsOf(f), task: tasks[f], letter: L, vec }) });
  }
  summarize(graded);
  if (arg('--out')) fs.writeFileSync(arg('--out'), JSON.stringify(Object.fromEntries(graded.map((g) => [g.id, g.got]))));
}

if (arg('--save')) {
  const thresholds = thresholdsFor(TASK_IDS);
  const { iterations, ...head } = headFor(TASK_IDS);
  fs.writeFileSync(arg('--save'), `${JSON.stringify({ version: 1, embedding: 'onnx-community/embeddinggemma-300m-ONNX q4 sentence_embedding, title: none | text:', head, thresholds }, null, 1)}\n`);
  console.log('saved', arg('--save'), thresholds, `(${iterations} iterations)`);
}
