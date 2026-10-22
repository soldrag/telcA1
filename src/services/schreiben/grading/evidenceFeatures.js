/**
 * Evidence features of one (sentence, Leitpunkt unit) pair and the logistic heads that read them.
 * The same code computes the features for training (scripts/eval/train-evidence-model.mjs) and for grading, so the
 * shipped weights see exactly what they were trained on. Cosines compare EmbeddingGemma sentence vectors with the
 * task's example bank (src/data/exams/example-bank/): a unit's fulfilling phrases, its near misses by type, the
 * other units' fulfilling phrases, phrases with another purpose to the same addressee and neutral letter phrases.
 * Deterministic detectors enter as features, not as rules.
 */

import { cosineSimilarity } from './vectorMath.js';

export const MISS_TYPES = Object.freeze(['refusal', 'opposite', 'past', 'vague', 'otherTopic']);

export const FEATURE_NAMES = Object.freeze([
  'fulfilTop1', 'fulfilTop3', ...MISS_TYPES.map((t) => `miss_${t}`), 'missMarginTop1',
  'rivalTop1', 'rivalMargin', 'otherPurposeTop1', 'neutralTop1', 'lexical', 'structured', 'negated',
]);

function similarities(vec, bank = []) {
  return bank.map((other) => cosineSimilarity(vec, other)).sort((a, b) => b - a);
}

const top1 = (sims) => sims[0] ?? 0;
const topMean = (sims, k) => (sims.length ? sims.slice(0, k).reduce((s, x) => s + x, 0) / Math.min(k, sims.length) : 0);

/**
 * @param {Float32Array|number[]} sentenceVec
 * @param {{ fulfils: Array, misses: Record<string, Array> }} unit - vectors of the unit's example phrases
 * @param {{ rivalFulfils: Array, otherPurpose: Array, neutral: Array, lexical?: number, structured?: number, negated?: boolean }} context
 * @returns {number[]} features in FEATURE_NAMES order
 */
export function computeEvidenceFeatures(sentenceVec, unit, context) {
  const fulfils = similarities(sentenceVec, unit.fulfils);
  const missTop = MISS_TYPES.map((type) => top1(similarities(sentenceVec, unit.misses?.[type] || [])));
  const rival = top1(similarities(sentenceVec, context.rivalFulfils));
  return [
    top1(fulfils),
    topMean(fulfils, 3),
    ...missTop,
    top1(fulfils) - Math.max(...missTop),
    rival,
    top1(fulfils) - rival,
    top1(similarities(sentenceVec, context.otherPurpose)),
    top1(similarities(sentenceVec, context.neutral)),
    context.lexical ?? 0,
    context.structured ?? 0,
    context.negated ? 1 : 0,
  ];
}

/**
 * @param {number[]} features
 * @param {{ weights: number[], bias: number, mean: number[], scale: number[] }} head - standardised logistic head
 * @returns {number} probability
 */
export function applyLogisticHead(features, head) {
  let z = head.bias;
  features.forEach((value, i) => { z += head.weights[i] * ((value - head.mean[i]) / head.scale[i]); });
  return 1 / (1 + Math.exp(-z));
}
