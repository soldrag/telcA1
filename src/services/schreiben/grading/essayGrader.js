/**
 * Grades a Schreiben letter with the provider the registry picks — the Micro-Ranker whenever it is
 * available — inside the grading worker (CLAUDE.md §11). The provider is chosen on the calling thread,
 * where the developer override in localStorage is readable; the worker gets only the resulting fact.
 */
import { aiProviderRegistry } from '../../ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { gradeSchreibenWithWorker } from './gradingWorkerClient.js';
import { LEITPUNKT_ENGINES } from './assessors/leitpunktEngines.js';

// Developer switch for the Leitpunkt engine while the keyword-free head is checked against its gate.
const ENGINE_OVERRIDE_KEY = 'telc_leitpunkt_engine';

function readEngineOverride() {
  try {
    const value = globalThis.localStorage?.getItem(ENGINE_OVERRIDE_KEY);
    return Object.values(LEITPUNKT_ENGINES).includes(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** @returns {Promise<object>} the pipeline result (gradeSchreibenSubmission), `provider_id` included */
export async function gradeEssayWithActiveProvider({ userText = '', question = {}, onProgress = null } = {}) {
  const provider = await aiProviderRegistry.getActiveProvider();
  return gradeSchreibenWithWorker({
    userText,
    question,
    options: { forceLimitedMode: provider.id === PROVIDER_IDS.NONE, leitpunktEngine: readEngineOverride() },
    onProgress,
  });
}
