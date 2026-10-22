/**
 * Precomputed EmbeddingGemma vectors of the example bank (src/data/exams/example-bank/), stored as int8 next to the
 * phrases. The training script writes them with the very embedder the app uses, so the evidence heads are trained
 * and graded on identical bank vectors and the browser never embeds hundreds of phrases per letter.
 */

import { MISS_TYPES } from './evidenceFeatures.js';

const SCALE = 127;

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

/**
 * @param {{ meta: object, neutral: string[], tasks: Record<string, { units: object, otherPurpose: string[] }> }} stored
 * @returns {{ meta: object, neutral: Float32Array[], tasks: Record<string, { units: Record<string, { fulfils: Float32Array[], misses: Record<string, Float32Array[]> }>, otherPurpose: Float32Array[] }> }}
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
  }
  return { meta: stored.meta, neutral: decodeAll(stored.neutral), tasks };
}
