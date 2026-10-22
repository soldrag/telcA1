/**
 * Precomputed EmbeddingGemma vectors of the example bank (src/data/exams/example-bank/), stored as int8 next to the
 * phrases. The training script writes them with the very embedder the app uses, so the evidence heads are trained
 * and graded on identical bank vectors and the browser never embeds hundreds of phrases per letter.
 */

import { MISS_TYPES } from './evidenceFeatures.js';
import { cosineSimilarity } from './vectorMath.js';

const SCALE = 127;
// Another task's fulfilling phrase this close to one of the task's own says the same thing: it is no other purpose.
const SAME_PURPOSE = 0.9;

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(text) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(text, 'base64'));
  return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
}

/** A unit-length vector as int8 (one byte per dimension, cosine error well below 0.01). */
export function encodeVector(vector) {
  return toBase64(Int8Array.from(vector, (v) => Math.max(-SCALE, Math.min(SCALE, Math.round(v * SCALE)))).buffer);
}

/** Decodes and re-normalises, so cosines stay true cosines. */
function decodeVector(text) {
  const values = Float32Array.from(new Int8Array(fromBase64(text).buffer), (v) => v / SCALE);
  const norm = Math.hypot(...values) || 1;
  return values.map((v) => v / norm);
}

const fulfilsOf = (bank) => Object.values(bank.units).flatMap((unit) => unit.fulfils);

/**
 * @param {{ meta: object, neutral: string[], tasks: Record<string, { units: object, otherPurpose: string[] }> }} stored
 * @returns {{ meta: object, neutral: Float32Array[], tasks: Record<string, { units: Record<string, { fulfils: Float32Array[], misses: Record<string, Float32Array[]> }>,
 *   otherPurpose: Float32Array[], foreignPurpose: Float32Array[], purposeLetters?: { onTask, offTask, foreign: Float32Array[] } }> }}
 *   foreignPurpose: the task's other-purpose phrases plus the other tasks' fulfilling phrases that differ from its own;
 *   purposeLetters: prototype letters of the task's purpose and of other purposes, foreign adding the other tasks' own
 */
export function decodeExampleBank(stored) {
  const decodeAll = (list = []) => list.map(decodeVector);
  const tasks = {};
  for (const [task, bank] of Object.entries(stored.tasks)) {
    const units = {};
    for (const [key, unit] of Object.entries(bank.units)) {
      units[key] = {
        fulfils: decodeAll(unit.fulfils),
        misses: Object.fromEntries(MISS_TYPES.map((type) => [type, decodeAll(unit.misses?.[type])])),
      };
    }
    tasks[task] = { units, otherPurpose: decodeAll(bank.otherPurpose) };
    if (bank.purposeLetters) {
      tasks[task].purposeLetters = { onTask: decodeAll(bank.purposeLetters.onTask), offTask: decodeAll(bank.purposeLetters.offTask) };
    }
  }
  for (const [task, bank] of Object.entries(tasks)) {
    const own = fulfilsOf(bank);
    const foreign = Object.entries(tasks).filter(([other]) => other !== task).flatMap(([, other]) => fulfilsOf(other))
      .filter((vector) => own.every((mine) => cosineSimilarity(vector, mine) < SAME_PURPOSE));
    bank.foreignPurpose = [...bank.otherPurpose, ...foreign];
    if (bank.purposeLetters) {
      const otherTasksLetters = Object.entries(tasks).filter(([other]) => other !== task).flatMap(([, other]) => other.purposeLetters?.onTask ?? []);
      bank.purposeLetters.foreign = [...bank.purposeLetters.offTask, ...otherTasksLetters];
    }
  }
  return { meta: stored.meta, neutral: decodeAll(stored.neutral), tasks };
}
