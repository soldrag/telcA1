import { isWebGPUSupported } from './grading/index.js';
import { gradeSchreibenSubmission } from './gradingPipeline.js';
import { aiProviderRegistry } from '../ai/aiProviderRegistry.js';

export { isWebGPUSupported };

export async function isWindowAIAvailable() {
  const windowAi = aiProviderRegistry.getProvider('window_ai');
  return windowAi ? await windowAi.isAvailable() : false;
}

export async function evaluateWithClientAI(userText = '', question = {}, onProgress = null) {
  return gradeSchreibenSubmission({
    userText,
    question,
    onProgress
  });
}
