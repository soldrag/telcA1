/**
 * Leitpunkt similarity thresholds and the embedding size shared by the grading pipeline.
 */

// Matryoshka dimension truncation for EmbeddingGemma
export const EMBEDDING_DIMENSION = 256;

// Explicit documented thresholds for Leitpunkt cosine similarity scoring
export const SIMILARITY_T2 = 0.65; // >= T2 -> 2 points (full coverage)
export const SIMILARITY_T1 = 0.45; // >= T1 -> 1 point (partial coverage)
