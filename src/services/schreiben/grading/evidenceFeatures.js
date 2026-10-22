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

// Every similarity enters as a margin: how much closer the sentence is to a fulfilling phrase than to the rival
// phrase, so each weight has one meaning (a positive weight trusts the fulfilling side) and the features do not
// repeat each other's information.
export const FEATURE_NAMES = Object.freeze([
  'fulfilTop1', 'fulfilTop3', ...MISS_TYPES.map((t) => `marginOver_${t}`),
  'marginOverRival', 'marginOverOtherPurpose', 'marginOverNeutral', 'lexical', 'structured', 'negated',
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
  const best = top1(fulfils);
  const marginOver = (bank) => best - top1(similarities(sentenceVec, bank));
  return [
    best,
    topMean(fulfils, 3),
    ...MISS_TYPES.map((type) => marginOver(unit.misses?.[type] || [])),
    marginOver(context.rivalFulfils),
    marginOver(context.otherPurpose),
    marginOver(context.neutral),
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
