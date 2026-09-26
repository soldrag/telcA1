/**
 * Ranker Embedder Port adapter over the shared EmbeddingGemma service.
 * Port contract: { embedQuery(cacheKey, text), embedText(text) } -> Promise<Float32Array>.
 * Reuses Stage 2 sentence vectors so the ranker never re-embeds the same sentence
 * and never loads a second copy of the model.
 */

import { computeEmbedding, getCachedLpEmbedding } from './embeddingService.js';

export function buildSentenceVectorMap(sentences = [], vectors = []) {
  const map = new Map();
  sentences.forEach((sentence, i) => {
    if (vectors[i]) map.set(sentence, vectors[i]);
  });
  return map;
}

/**
 * @param {{ customExtractor?: object|false|null, sentenceVectors?: Map<string, Float32Array> }} options
 * @returns {{ embedQuery: Function, embedText: Function }|null} null when embeddings are disabled
 */
export function createRankerEmbedder({ customExtractor = null, sentenceVectors = null } = {}) {
  if (customExtractor === false) return null;
  const knownVectors = sentenceVectors instanceof Map ? sentenceVectors : new Map();

  return {
    embedQuery: (cacheKey, text) => getCachedLpEmbedding(cacheKey, text, customExtractor),
    embedText: async (text) => {
      if (knownVectors.has(text)) return knownVectors.get(text);
      const vec = await computeEmbedding(text, false, customExtractor);
      knownVectors.set(text, vec);
      return vec;
    },
  };
}
