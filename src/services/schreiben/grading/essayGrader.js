/**
 * Grades a Schreiben letter with the provider the registry picks — the Micro-Ranker whenever it is
 * available — inside the grading worker (CLAUDE.md §11). The provider is chosen on the calling thread,
 * where the developer override in localStorage is readable; the worker gets only the resulting fact.
 */
import { aiProviderRegistry } from '../../ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { gradeSchreibenWithWorker } from './gradingWorkerClient.js';

/** @returns {Promise<object>} the pipeline result (gradeSchreibenSubmission), `provider_id` included */
export async function gradeEssayWithActiveProvider({ userText = '', question = {}, onProgress = null } = {}) {
  const provider = await aiProviderRegistry.getActiveProvider();
  return gradeSchreibenWithWorker({
    userText,
    question,
    options: { forceLimitedMode: provider.id === PROVIDER_IDS.NONE },
    onProgress,
  });
}
