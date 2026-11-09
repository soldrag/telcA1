/**
 * Thresholds of the evidence head's letter reading, chosen without evaluation letters: inner leave-one-task-out over
 * the training tasks, scoring each held-out task's teacher letters (exact Leitpunkt level) and its sentence rows
 * (class-balanced unit accuracy, F → 2, C/I → 0). Ties prefer a higher full threshold, then contradiction, then partial.
 */

import { leitpunktLevels } from './headModel.mjs';

const range = (from, step, count) => Array.from({ length: count }, (_, i) => Math.round((from + step * i) * 100) / 100);
const FULL = range(0.30, 0.05, 14);
const CONTRADICTION = [...range(0.50, 0.05, 10), 9];

export function* thresholdGrid() {
  for (const full of FULL) {
    for (const partial of range(0.10, 0.05, Math.round((full - 0.10) / 0.05) + 1)) {
      for (const contradiction of CONTRADICTION) yield { full, partial, contradiction };
    }
  }
}

function isLexicallyGreater(a, b) {
  const i = a.findIndex((v, k) => v !== b[k]);
  return i > -1 && a[i] > b[i];
}

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

function sentenceScore(sentences, th) {
  const byClass = {};
  for (const { support, contradiction, cls } of sentences) {
    const level = contradiction >= th.contradiction ? 0 : support >= th.full ? 2 : support >= th.partial ? 1 : 0;
    (byClass[cls] ??= []).push(level === (cls === 'F' ? 2 : 0) ? 1 : 0);
  }
  return mean(Object.values(byClass).map(mean));
}

function letterScore(letters, th) {
  const hits = letters.flatMap(({ readings, expected }) => leitpunktLevels(readings, th).map((l, i) => (l === expected[i] ? 1 : 0)));
  return mean(hits);
}

/**
 * @param {{ letters: Array<{ readings, expected }>, sentences: Array<{ support, contradiction, cls }> }} heldOut
 *   readings of the inner-held-out tasks by heads trained without them
 */
export function chooseThresholds(heldOut) {
  let best = null;
  for (const th of thresholdGrid()) {
    const objective = Math.round(((sentenceScore(heldOut.sentences, th) + letterScore(heldOut.letters, th)) / 2) * 1e6) / 1e6;
    const key = [objective, th.full, th.contradiction, th.partial];
    if (!best || isLexicallyGreater(key, best.key)) best = { th, key };
  }
  return { ...best.th, objective: best.key[0] };
}
