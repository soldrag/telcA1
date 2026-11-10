/**
 * Training data of the keyword-free evidence head: teacher sentences and letters (teacher/*.txt, written from the task
 * texts by a model, see teacher/GUIDE.md) and the labelled calibration sentences (calibration/sentences-*.json).
 * Rows are (task, sentence, bank unit key, class F/P/C/I). A sentence that also occurs in an evaluation letter is left
 * out, so no evaluation wording is trained on.
 */

import fs from 'node:fs';

const TEACHER_DIR = new URL('./teacher/', import.meta.url);
const CALIBRATION_DIR = new URL('../calibration/', import.meta.url);
const CALIBRATION_FILES = ['b1', 'b2', 'adversarial', 'heldout'];
const CALIBRATION_CLASS = { support: 'F', contradict: 'C', none: 'I' };

const normalize = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** @param {string[]} letterTexts - evaluation letters; a training sentence inside one of them is a leak */
export function createLeakGuard(letterTexts) {
  const letters = letterTexts.map(normalize);
  return (text) => {
    const n = normalize(text);
    return n.length > 15 && letters.some((l) => l.includes(n));
  };
}

function parseAliases(line, bankKeys) {
  const aliases = Object.fromEntries([...line.slice('@alias '.length).matchAll(/(\w)=(.+?)(?=\s+\w=|$)/g)].map((m) => [m[1], m[2]]));
  const missing = bankKeys.filter((k) => !Object.values(aliases).includes(k));
  if (missing.length) throw new Error(`teacher aliases miss bank units ${missing.join(', ')}`);
  return aliases;
}

function parseLabels(field, aliases, bankKeys) {
  const labels = Object.fromEntries(bankKeys.map((k) => [k, 'I']));
  if (field.trim() === '-') return labels;
  for (const pair of field.trim().split(/\s+/)) {
    const [alias, cls] = pair.split('=');
    if (!aliases[alias] || !'FPC'.includes(cls)) throw new Error(`bad teacher label "${pair}"`);
    labels[aliases[alias]] = cls;
  }
  return labels;
}

/**
 * @returns {{ sentences: Array<{ text, labels, letter: number|null }>, letters: Array<{ kind: 'on'|'off', sentences: number[] }> }}
 */
export function readTeacherTask(taskId, bankKeys) {
  const lines = fs.readFileSync(new URL(`${taskId}.txt`, TEACHER_DIR), 'utf8').split('\n');
  const aliases = parseAliases(lines[0], bankKeys);
  const sentences = [];
  const letters = [];
  let letter = null;
  for (const line of lines.slice(1)) {
    if (!line.trim() || line.startsWith('| ')) continue;
    if (line.startsWith('@letter')) { letter = { kind: line.split(/\s+/)[1], sentences: [] }; continue; }
    if (line === '@end') { letters.push(letter); letter = null; continue; }
    const [field, text] = line.split(' :: ');
    if (letter) letter.sentences.push(sentences.length);
    sentences.push({ text: text.trim(), labels: parseLabels(field, aliases, bankKeys), letter: letter ? letters.length : null });
  }
  return { sentences, letters };
}

/** Teacher rows without the partial class (the head reads partial from its support band, not from a class). */
export function teacherRows(taskId, bankKeys, isLeak) {
  return readTeacherTask(taskId, bankKeys).sentences
    .filter((s) => !isLeak(s.text))
    .flatMap((s) => Object.entries(s.labels).filter(([, cls]) => cls !== 'P').map(([key, cls]) => ({ task: taskId, text: s.text, key, cls })));
}

/** Calibration sentence rows with the examiner's undisputed labels. */
export function calibrationRows(taskIds, isLeak) {
  return CALIBRATION_FILES.flatMap((f) => JSON.parse(fs.readFileSync(new URL(`sentences-${f}.json`, CALIBRATION_DIR), 'utf8')))
    .filter((s) => taskIds.includes(s.task) && !isLeak(s.text))
    .flatMap((s) => Object.entries(s.examinerLabels)
      .filter(([key]) => !s.disputed.includes(key))
      .map(([key, label]) => ({ task: s.task, text: s.text, key, cls: CALIBRATION_CLASS[label] })));
}
