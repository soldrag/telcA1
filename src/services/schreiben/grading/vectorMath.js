/**
 * L2 normalisation of an EmbeddingGemma vector (all dimensions: the evidence head is trained on the full length).
 */

function computeSumOfSquares(vector, length) {
  let sumSq = 0;
  for (let i = 0; i < length; i++) {
    const val = vector[i];
    sumSq += val * val;
  }
  return sumSq;
}

/**
 * Normalises a raw embedding with a single Float32Array allocation, optionally truncated to `dim` dimensions.
 * @param {number[]|ArrayBufferView} rawVector
 * @param {number} [dim=Infinity]
 * @returns {Float32Array}
 */
export function prepareEmbeddingVector(rawVector = [], dim = Infinity) {
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
