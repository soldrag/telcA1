/**
 * The keyword-free evidence head: features of a (letter span, unit) pair from sentence-vector cosines, a softmax
 * head over them, and the letter-level reading of a unit. Level-free: the head's weights and thresholds are level
 * data passed in. Vectors are unit-length EmbeddingGemma `sentence_embedding`s with the document prompt.
 */

export const SPAN_FEATURE_NAMES = Object.freeze([
  'fulfils', 'misses', 'rivals', 'irrelevant', 'description',
  'fulfilsOverMisses', 'fulfilsOverRivals', 'fulfilsOverIrrelevant', 'descriptionOverIrrelevant',
]);

export const HEAD_CLASSES = Object.freeze({ FULFILS: 'F', CONTRADICTS: 'C', IRRELEVANT: 'I' });

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

const closest = (vector, refs) => (refs.length ? Math.max(...refs.map((ref) => dot(vector, ref))) : 0);

/**
 * @param {Float32Array} span - the span's vector
 * @param {{ fulfils: Float32Array[], misses: Float32Array[], rivals: Float32Array[], irr: Float32Array[], desc: Float32Array }} unit
 *   the unit's reference vectors
 * @returns {number[]} features in SPAN_FEATURE_NAMES order
 */
export function spanFeatures(span, unit) {
  const P = closest(span, unit.fulfils);
  const M = closest(span, unit.misses);
  const R = closest(span, unit.rivals);
  const O = closest(span, unit.irr);
  const D = dot(span, unit.desc);
  return [P, M, R, O, D, P - M, P - R, P - O, D - O];
}

/**
 * @param {number[]} features
 * @param {{ mean: number[], scale: number[], coef: number[][], intercept: number[], classes: string[] }} head
 * @returns {Record<string, number>} probability per class
 */
export function applySoftmaxHead(features, head) {
  const x = features.map((v, i) => (v - head.mean[i]) / head.scale[i]);
  const z = head.coef.map((w, k) => w.reduce((s, wi, i) => s + wi * x[i], head.intercept[k]));
  const top = Math.max(...z);
  const e = z.map((v) => Math.exp(v - top));
  const total = e.reduce((s, v) => s + v, 0);
  return Object.fromEntries(head.classes.map((c, k) => [c, e[k] / total]));
}

/**
 * Level 0/1/2 of one unit from its best support s (max P(F) over spans) and its strongest contradiction c (max P(C)
 * over whole sentences): a whole-sentence contradiction overrides support; a middle band of support is partial.
 * @param {{ support: number, contradiction: number }} reading
 * @param {{ full: number, partial: number, contradiction: number }} thresholds
 */
export function unitLevel({ support, contradiction }, thresholds) {
  if (contradiction >= thresholds.contradiction) return 0;
  if (support >= thresholds.full) return 2;
  return support >= thresholds.partial ? 1 : 0;
}
