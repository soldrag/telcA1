/**
 * Provider IDs, statuses, and schema contracts for client-only AI providers.
 */

export const PROVIDER_IDS = {
  WINDOW_AI: 'window_ai',
  CLIENT_WEBGPU: 'client_webgpu',
  NONE: 'none',
};

export const PROVIDER_STATUSES = {
  READY: 'ready',
  UNAVAILABLE: 'unavailable',
  INITIALIZING: 'initializing',
  ERROR: 'error',
};

export const LEITPUNKT_COVERAGE_SCHEMA = {
  type: 'object',
  properties: {
    coverage: {
      type: 'string',
      enum: ['full', 'partial', 'no'],
    },
  },
  required: ['coverage'],
  additionalProperties: false,
};

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
          explanation: { type: 'string' },
        },
        required: ['original', 'correction', 'explanation'],
      },
    },
  },
  required: ['errors'],
  additionalProperties: false,
};

export const FEEDBACK_POLISH_SCHEMA = {
  type: 'object',
  properties: {
    feedback: { type: 'string' },
  },
  required: ['feedback'],
  additionalProperties: false,
};
