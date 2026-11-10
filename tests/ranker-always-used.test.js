import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AIProviderRegistry, aiProviderRegistry } from '../src/services/ai/aiProviderRegistry.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { PROVIDER_IDS, GRADING_MODES } from '../src/services/ai/types.js';
import { submitLocalExamAnswers } from '../src/services/localDataService.js';
import { needsPipelineGrading } from '../src/hooks/useSchreibenAiChecker.js';

// The model-backed provider must grade the letter whenever it is available: at submission, in the saved attempt,
// with no rules-only grade in between. The limited mode is only for environments without it. The test never
// downloads the model: without a local copy the grading falls back and says so, which is still that provider's grade.

const EXAM_ID = 'schreiben-modellsatz-1';
const ANSWERS = {
  's1-q6': 'Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. '
    + 'Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs?\nMit freundlichen Grüßen\nAnna',
};

// The model-backed provider as a browser has it; Node has no window, so it reports itself available here.
class AvailableModelProvider extends MicroRankerProvider {
  async isAvailable() { return true; }
}

function useRegistryProvider(provider) {
  aiProviderRegistry.register(provider);
  aiProviderRegistry.activeProviderId = null;
}

async function submitLetter() {
  const { reviewItems } = await submitLocalExamAnswers(EXAM_ID, { answers: ANSWERS });
  return reviewItems.find((item) => item.id === 's1-q6');
}

describe('the Micro-Ranker grades the letter whenever it is available', () => {
  afterEach(() => {
    useRegistryProvider(new MicroRankerProvider());
    delete globalThis.WorkerGlobalScope;
  });

  it('the registry picks the Micro-Ranker in a browser, on the main thread and in the grading worker', async () => {
    globalThis.WorkerGlobalScope = function WorkerGlobalScope() {};
    const provider = await new AIProviderRegistry().detectBestAvailableProvider();
    assert.equal(provider.id, PROVIDER_IDS.MICRO_RANKER);
  });

  it('the submitted letter is graded by the ranker and saved with its provider', async () => {
    const { env } = await import('@huggingface/transformers');
    env.allowRemoteModels = false;
    useRegistryProvider(new AvailableModelProvider());

    const item = await submitLetter();

    assert.equal(item.provider_id, PROVIDER_IDS.MICRO_RANKER);
    assert.ok([GRADING_MODES.RANKER, GRADING_MODES.RANKER_WITHOUT_MODEL].includes(item.grading_mode));
    assert.ok(item.criteria_breakdown && item.examiner_feedback);
    assert.equal(needsPipelineGrading(item), false, 'the results screen shows the saved ranker grade as is');
  });

  it('without the ranker the letter is graded in the limited mode and says so', async () => {
    const item = await submitLetter();
    assert.equal(item.provider_id, PROVIDER_IDS.NONE);
  });
});
