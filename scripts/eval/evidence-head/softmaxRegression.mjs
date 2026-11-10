/**
 * Multinomial logistic regression for the evidence head, the same objective as scikit-learn's
 * `make_pipeline(StandardScaler(), LogisticRegression(C, class_weight='balanced'))`: standardised features
 * (population std), balanced class weights n / (k · n_c), L2 on the weights (not the intercepts) with strength 1/C.
 * Full-batch gradient descent with momentum to a gradient-norm tolerance; the problem is small and convex.
 */

import { applySoftmaxHead } from '../../../src/services/schreiben/grading/evidenceHead/spanEvidence.js';

function standardize(X) {
  const n = X.length;
  const dim = X[0].length;
  const mean = Array.from({ length: dim }, (_, j) => X.reduce((s, x) => s + x[j], 0) / n);
  const scale = mean.map((m, j) => Math.sqrt(X.reduce((s, x) => s + (x[j] - m) ** 2, 0) / n) || 1);
  return { mean, scale, Z: X.map((x) => x.map((v, j) => (v - mean[j]) / scale[j])) };
}

function gradient({ Z, y, w, coef, intercept, lambda }) {
  const k = coef.length;
  const gCoef = coef.map((row) => row.map((v) => lambda * v));
  const gIntercept = new Array(k).fill(0);
  Z.forEach((z, i) => {
    const logits = coef.map((row, c) => row.reduce((s, v, j) => s + v * z[j], intercept[c]));
    const top = Math.max(...logits);
    const e = logits.map((v) => Math.exp(v - top));
    const total = e.reduce((s, v) => s + v, 0);
    for (let c = 0; c < k; c++) {
      const err = w[i] * (e[c] / total - (y[i] === c ? 1 : 0));
      gIntercept[c] += err;
      for (let j = 0; j < z.length; j++) gCoef[c][j] += err * z[j];
    }
  });
  return { gCoef, gIntercept };
}

/**
 * @param {number[][]} X - feature rows
 * @param {string[]} labels - class per row
 * @param {{ classes: string[], C?: number, rate?: number, maxIterations?: number, tolerance?: number }} options
 * @returns {{ mean, scale, coef, intercept, classes, iterations }}
 */
export function fitSoftmaxRegression(X, labels, { classes, C = 1, rate = 0.5, maxIterations = 20000, tolerance = 1e-7 }) {
  const { mean, scale, Z } = standardize(X);
  const y = labels.map((l) => classes.indexOf(l));
  const counts = classes.map((_, c) => y.filter((v) => v === c).length);
  const n = y.length;
  const w = y.map((c) => n / (classes.length * counts[c]) / n);
  const lambda = 1 / (C * n);
  const coef = classes.map(() => new Array(Z[0].length).fill(0));
  const intercept = new Array(classes.length).fill(0);
  const velocity = { coef: coef.map((r) => r.map(() => 0)), intercept: intercept.map(() => 0) };
  let iterations = 0;
  for (; iterations < maxIterations; iterations++) {
    const { gCoef, gIntercept } = gradient({ Z, y, w, coef, intercept, lambda });
    const norm = Math.hypot(...gCoef.flat(), ...gIntercept);
    if (norm < tolerance) break;
    coef.forEach((row, c) => row.forEach((_, j) => {
      velocity.coef[c][j] = 0.9 * velocity.coef[c][j] - rate * gCoef[c][j];
      row[j] += velocity.coef[c][j];
    }));
    intercept.forEach((_, c) => {
      velocity.intercept[c] = 0.9 * velocity.intercept[c] - rate * gIntercept[c];
      intercept[c] += velocity.intercept[c];
    });
  }
  return { mean, scale, coef, intercept, classes: [...classes], iterations };
}

export const predictSoftmax = (head, features) => applySoftmaxHead(features, head);
