/**
 * Training and grading pieces of the keyword-free evidence head shared by train.mjs: task data, unit views,
 * feature rows, the head fit, letter readings and the Leitpunkt levels of a letter.
 */

import fs from 'node:fs';
import { collectBankUnits, viewUnit, letterUnits } from '../../../src/services/schreiben/grading/evidenceHead/unitReferences.js';
import { spanFeatures, unitLevel, HEAD_CLASSES } from '../../../src/services/schreiben/grading/evidenceHead/spanEvidence.js';
import { fitSoftmaxRegression, predictSoftmax } from './softmaxRegression.mjs';

const DATA = new URL('../../../src/data/exams/', import.meta.url);
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
export const CLASSES = [HEAD_CLASSES.FULFILS, HEAD_CLASSES.CONTRADICTS, HEAD_CLASSES.IRRELEVANT];
export const TASK_IDS = ['s1-q6', 's2-q6', 's3-q6', 's4-q6', 's5-q6', 's6-q6', 's7-q6'];

/** Teil 2 task data: situation, rubric criteria (declared aspects), bank, example phrases. */
export async function loadTasks() {
  const examples = readJson(new URL('schreiben-leitpunkt-examples.json', DATA));
  const neutral = readJson(new URL('example-bank/neutral.json', DATA)).neutral;
  const tasks = {};
  for (const id of TASK_IDS) {
    const { questions } = await import(new URL(`seeds/schreiben-modellsatz-${id.match(/^s(\d+)/)[1]}.js`, DATA));
    const q = questions.find((x) => x.id === id);
    const bank = readJson(new URL(`example-bank/${id}.json`, DATA));
    tasks[id] = { id, question: q, situation: q.situation, criteria: q.options_json.rubric.leitpunkte_criteria, bank, examples: examples[id] || {}, neutral };
  }
  return tasks;
}

/** The unit a training row is labelled on: a bank unit, read as an aspect of its Leitpunkt. */
export function trainingUnit(task, bankKey) {
  const bankUnits = collectBankUnits(task.bank, task.examples);
  const [lp, aspect = null] = bankKey.split(/:(.*)/s);
  const criterion = task.criteria.find((c) => c.id === lp);
  return viewUnit({ task, criterion, aspect, phrases: bankUnits[bankKey], bankUnits, irrelevant: [...(task.bank.otherPurpose || []), ...task.neutral] });
}

export const gradingUnits = (task) => letterUnits({ task, bank: task.bank, examples: task.examples, neutral: task.neutral });

/** Every reference text of a unit view, for embedding. */
export const unitTexts = (u) => [...u.fulfils, ...u.misses, ...u.rivals, ...u.irr, u.desc];

/** A unit view with its phrases replaced by vectors, from a text→vector map. */
export function vectorizeUnit(u, vec) {
  const v = (list) => list.map((t) => vec.get(t));
  return { ...u, fulfils: v(u.fulfils), misses: v(u.misses), rivals: v(u.rivals), irr: v(u.irr), desc: vec.get(u.desc) };
}

/** @param {Array<{ task, text, key, cls }>} rows @param {(task, key) => vectorized unit} unitOf */
export function featureRows(rows, unitOf, vec) {
  return rows.map((r) => ({ ...r, features: spanFeatures(vec.get(r.text), unitOf(r.task, r.key)) }));
}

export const fitHead = (featured) => fitSoftmaxRegression(featured.map((r) => r.features), featured.map((r) => r.cls), { classes: CLASSES });

/** Support s (max P(F) over spans) and contradiction c (max P(C) over whole sentences) of one unit. */
export function readUnit(head, unit, { spans, whole }, vec) {
  let support = 0;
  let contradiction = 0;
  for (const span of spans) {
    const p = predictSoftmax(head, spanFeatures(vec.get(span), unit));
    support = Math.max(support, p.F);
    if (whole.has(span)) contradiction = Math.max(contradiction, p.C);
  }
  return { support, contradiction };
}

/** Readings per Leitpunkt per unit. */
export const readLetter = (head, groups, spanSet, vec) => groups.map((g) => g.units.map((u) => readUnit(head, u, spanSet, vec)));

/** Leitpunkt levels; a compound point is full only when every declared aspect is (reglament §6). */
export function leitpunktLevels(readings, thresholds) {
  return readings.map((units) => {
    const levels = units.map((r) => unitLevel(r, thresholds));
    if (levels.length === 1) return levels[0];
    if (levels.every((l) => l === 2)) return 2;
    return levels.some((l) => l >= 1) ? 1 : 0;
  });
}
