import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AIProviderRegistry, aiProviderRegistry } from '../src/services/ai/aiProviderRegistry.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import { submitLocalExamAnswers } from '../src/services/localDataService.js';
import { needsPipelineGrading } from '../src/hooks/useSchreibenAiChecker.js';

// The Micro-Ranker must grade the letter whenever it is available: at submission, in the saved attempt,
// with no rules-only grade in between. The limited mode is only for environments without the ranker.

const EXAM_ID = 'schreiben-modellsatz-1';
const ANSWERS = {
  's1-q6': 'Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. '
    + 'Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs?\nMit freundlichen Grüßen\nAnna',
};

// An available ranker that records its calls; the real one needs the browser model.
class RecordingRanker extends MicroRankerProvider {
  constructor() {
    super({ embedder: null });
    this.calls = 0;
  }

  async isAvailable() { return true; }

  async classifyCoverage(...args) {
    this.calls += 1;
    return super.classifyCoverage(...args);
  }
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
    const ranker = new RecordingRanker();
    useRegistryProvider(ranker);

    const item = await submitLetter();

    assert.ok(ranker.calls > 0, 'the ranker scored the Leitpunkte');
    assert.equal(item.provider_id, PROVIDER_IDS.MICRO_RANKER);
    assert.ok(item.criteria_breakdown && item.examiner_feedback);
    assert.equal(needsPipelineGrading(item), false, 'the results screen shows the saved ranker grade as is');
  });

  it('without the ranker the letter is graded in the limited mode and says so', async () => {
    const item = await submitLetter();
    assert.equal(item.provider_id, PROVIDER_IDS.NONE);
  });
});
