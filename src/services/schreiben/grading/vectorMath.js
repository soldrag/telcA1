/**
 * Vector operations for EmbeddingGemma embeddings:
 * Matryoshka dimension truncation (256 dims), L2 normalization, and cosine similarity.
 */

import { EMBEDDING_DIMENSION } from './types.js';

function computeSumOfSquares(vector, length) {
  let sumSq = 0;
  for (let i = 0; i < length; i++) {
    const val = vector[i];
    sumSq += val * val;
  }
  return sumSq;
}

export function cosineSimilarity(vecA = [], vecB = []) {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(-1, Math.min(1, dotProduct));
}

/**
 * Truncates raw embedding to Matryoshka dimensions and normalizes with a single Float32Array allocation.
 * @param {number[]|ArrayBufferView} rawVector
 * @param {number} [dim=EMBEDDING_DIMENSION]
 * @returns {Float32Array}
 */
export function prepareEmbeddingVector(rawVector = [], dim = EMBEDDING_DIMENSION) {
  if (!Array.isArray(rawVector) && !ArrayBuffer.isView(rawVector)) return new Float32Array(0);
  const targetLength = Math.min(rawVector.length, dim);
  if (targetLength === 0) return new Float32Array(0);

  const norm = Math.sqrt(computeSumOfSquares(rawVector, targetLength));
  const normalized = new Float32Array(targetLength);
  if (norm === 0 || !Number.isFinite(norm)) return normalized;

  const invNorm = 1 / norm;
  for (let i = 0; i < targetLength; i++) {
    normalized[i] = rawVector[i] * invNorm;
  }
  return normalized;
}
