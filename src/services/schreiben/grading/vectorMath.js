/**
 * Vector operations for EmbeddingGemma embeddings:
 * Matryoshka dimension truncation (256 dims), L2 normalization, and cosine similarity.
 */

import { EMBEDDING_DIMENSION } from './types.js';

export function truncateMatryoshka(vector = [], dim = EMBEDDING_DIMENSION) {
  if (!Array.isArray(vector) && !ArrayBuffer.isView(vector)) return [];
  const targetLength = Math.min(vector.length, dim);
  const truncated = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    truncated[i] = vector[i];
  }
  return truncated;
}

export function l2Normalize(vector = []) {
  if (!vector || vector.length === 0) return new Float32Array(0);
  let sumSq = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0 || !Number.isFinite(norm)) return new Float32Array(vector.length);

  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / norm;
  }
  return normalized;
}

export function cosineSimilarity(vecA = [], vecB = []) {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(-1, Math.min(1, dotProduct));
}

export function prepareEmbeddingVector(rawVector = [], dim = EMBEDDING_DIMENSION) {
  const truncated = truncateMatryoshka(rawVector, dim);
  return l2Normalize(truncated);
}
