/**
 * Deterministic ranker embedder mocks implementing the { embedQuery, embedText } port.
 * Keep tests offline: no EmbeddingGemma download.
 */

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return Float32Array.from(norm > 0 ? vec.map((v) => v / norm) : vec);
}

/** Every query/text pair has exactly the given cosine similarity. */
export function createFixedSimilarityEmbedder(similarity) {
  const orthogonal = Math.sqrt(Math.max(0, 1 - similarity * similarity));
  return {
    embedQuery: async () => [1, 0],
    embedText: async () => [similarity, orthogonal],
  };
}

/**
 * Bag-of-concepts embedder: each concept is one dimension, activated when any of its
 * word prefixes appears in the text. Counts calls so tests can assert vector reuse.
 */
export function createConceptEmbedder(concepts = {}) {
  const names = Object.keys(concepts);
  const calls = { embedQuery: 0, embedText: 0 };
  const embed = (text) => {
    const words = String(text).toLowerCase().split(/[^a-zäöüß0-9]+/).filter(Boolean);
    const vec = names.map((name) => (concepts[name].some((p) => words.some((w) => w.startsWith(p))) ? 1 : 0));
    return normalize([...vec, 0.15]);
  };
  return {
    calls,
    embedQuery: async (_key, text) => { calls.embedQuery++; return embed(text); },
    embedText: async (text) => { calls.embedText++; return embed(text); },
  };
}
