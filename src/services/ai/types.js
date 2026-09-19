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

export {
  LEITPUNKT_COVERAGE_SCHEMA,
  SENTENCE_GRAMMAR_SCHEMA,
  FEEDBACK_SCHEMA as FEEDBACK_POLISH_SCHEMA
} from '../schreiben/grading/types.js';
