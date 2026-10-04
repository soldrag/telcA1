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
/**
 * Progress of a Schreiben grading, reported as { stage, fraction, loadedBytes? } — the UI words it.
 * MODEL_DOWNLOAD carries loadedBytes and happens on the first grading only (the model is cached after it).
 */
export const GRADING_STAGES = {
  PREPROCESSING: 'preprocessing',
  MODEL_DOWNLOAD: 'model_download',
  LEITPUNKTE: 'leitpunkte',
  GRAMMAR: 'grammar',
  FEEDBACK: 'feedback',
  DONE: 'done',
};

export const GRADING_MODES = {
  RANKER: 'ranker',
  RANKER_WITHOUT_MODEL: 'ranker_without_model',
  LIMITED: 'limited',
};

/**
 * Why a grading fell back from the model, as the named fact `grading_fallback` of the result: `{ reason, detail }`.
 * MODEL_FAILED: the embedding model did not run (stage 2); WORKER_FAILED: the grading worker failed or timed out
 * and the letter was graded again on the main thread in the limited mode. `detail` is the failure's own message.
 * @typedef {{ reason: string, detail: string }} GradingFallback
 */
export const GRADING_FALLBACK_REASONS = {
  MODEL_FAILED: 'model_failed',
  WORKER_FAILED: 'worker_failed',
};
