/**
 * Provider IDs of the client-only grading providers.
 */

export const PROVIDER_IDS = {
  MICRO_RANKER: 'micro_ranker',
  NONE: 'none',
};

/**
 * How a Schreiben letter was actually graded — the fact the results screen reports.
 * RANKER_WITHOUT_MODEL: the Micro-Ranker was chosen, but the embedding model gave no vectors
 * (offline before the download, a WebGPU/WASM failure), so its verdicts are the deterministic fallback.
 */
export const GRADING_MODES = {
  RANKER: 'ranker',
  RANKER_WITHOUT_MODEL: 'ranker_without_model',
  LIMITED: 'limited',
};
