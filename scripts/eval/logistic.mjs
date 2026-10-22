/**
 * Logistic heads for the evaluation scripts: standardised features, balanced classes, optional row weights, L2 and
 * sign constraints, plus the measures used to report them honestly (AUC, Wilson intervals).
 */

import { applyLogisticHead } from '../../src/services/schreiben/grading/evidenceFeatures.js';

/**
 * @param {Array<{ features: number[], weight?: number }>} rows
 * @param {string} target - name of the 0/1 field to predict
 * @param {{ lambda: number, signs?: Array<1|-1|undefined>, epochs?: number, rate?: number }} options
 *   signs: 1 keeps a weight ≥ 0, -1 keeps it ≤ 0
 */
export function trainLogistic(rows, target, { lambda, signs = [], epochs = 1500, rate = 0.1 }) {
  const dim = rows[0].features.length;
  const weightOf = (r) => r.weight ?? 1;
  const total = rows.reduce((s, r) => s + weightOf(r), 0);
  const mean = Array.from({ length: dim }, (_, i) => rows.reduce((s, r) => s + weightOf(r) * r.features[i], 0) / total);
  const scale = mean.map((m, i) => Math.sqrt(rows.reduce((s, r) => s + weightOf(r) * (r.features[i] - m) ** 2, 0) / total) || 1);
  const positive = rows.filter((r) => r[target]).reduce((s, r) => s + weightOf(r), 0);
  const balance = (y) => (y ? total / (2 * positive) : total / (2 * (total - positive)));
  const head = { weights: new Array(dim).fill(0), bias: 0, mean, scale };
  for (let epoch = 0; epoch < epochs; epoch++) {
    const grad = new Array(dim).fill(0);
    let gradBias = 0;
    for (const r of rows) {
      const err = (applyLogisticHead(r.features, head) - r[target]) * balance(r[target]) * weightOf(r);
      r.features.forEach((v, i) => { grad[i] += err * ((v - mean[i]) / scale[i]); });
      gradBias += err;
    }
    head.weights = head.weights.map((w, i) => {
      const next = w - rate * (grad[i] / total + lambda * w);
      return signs[i] === 1 ? Math.max(0, next) : signs[i] === -1 ? Math.min(0, next) : next;
    });
    head.bias -= rate * (gradBias / total);
  }
  return head;
}

export function auc(pairs) {
  const pos = pairs.filter(([, y]) => y).map(([s]) => s);
  const neg = pairs.filter(([, y]) => !y).map(([s]) => s);
  if (!pos.length || !neg.length) return NaN;
  let wins = 0;
  for (const p of pos) for (const n of neg) wins += p > n ? 1 : p === n ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}

/** Wilson score interval for a proportion, formatted with the counts. */
export function wilson(k, n, z = 1.96) {
  if (n === 0) return '—';
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return `${p.toFixed(2)} [${Math.max(0, c - h).toFixed(2)}–${Math.min(1, c + h).toFixed(2)}] (${k}/${n})`;
}
