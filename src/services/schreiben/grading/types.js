/**
 * Constants, schemas, and configurations for the two-model hybrid grading pipeline.
 * All inference runs 100% in-browser (WebGPU / WASM) on static hosting.
 */

export const EMBEDDING_MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';
export const QWEN3_MODEL_ID = 'Qwen3-0.6B-q4f16_1-MLC';

// Matryoshka dimension truncation for EmbeddingGemma
export const EMBEDDING_DIMENSION = 256;

// Explicit documented thresholds for Leitpunkt cosine similarity scoring
export const SIMILARITY_T2 = 0.65; // >= T2 -> 2 points (full coverage)
export const SIMILARITY_T1 = 0.45; // >= T1 -> 1 point (partial coverage)
export const GRAY_ZONE_DELTA = 0.06; // +/- Delta triggers Qwen3 arbitration

// Task prefixes verified from EmbeddingGemma model card
export const TASK_PREFIX_QUERY = 'task: search result | query: ';
export const TASK_PREFIX_TEXT = 'task: search result | text: ';
export const TASK_PREFIX_DOC = 'title: none | text: ';

// JSON Schema for Qwen3 single-Leitpunkt binary coverage arbitration
export const LEITPUNKT_COVERAGE_SCHEMA = {
  type: 'object',
  properties: {
    coverage: {
      type: 'string',
      enum: ['full', 'partial', 'no']
    }
  },
  required: ['coverage'],
  additionalProperties: false
};

// JSON Schema for Qwen3 single-sentence grammar candidates
export const SENTENCE_GRAMMAR_SCHEMA = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          correction: { type: 'string' },
          explanation: { type: 'string' }
        },
        required: ['original', 'correction', 'explanation']
      }
    }
  },
  required: ['errors'],
  additionalProperties: false
};

// JSON Schema for optional Qwen3 feedback polish
export const FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    feedback: {
      type: 'string',
      description: 'Polite A1 examiner feedback based only on provided facts'
    }
  },
  required: ['feedback'],
  additionalProperties: false
};
