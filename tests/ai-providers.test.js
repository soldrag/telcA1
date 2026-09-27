import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AIProvider } from '../src/services/ai/AIProvider.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { AIProviderRegistry } from '../src/services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';

describe('AI Providers Contract & Unit Tests', () => {
  it('AIProvider base class enforces contract and rejects empty arguments', () => {
    assert.throws(() => new AIProvider(), /requires id and name/);
    const base = new AIProvider('test_id', 'Test Provider');
    assert.equal(base.id, 'test_id');
    assert.equal(base.name, 'Test Provider');
  });

  it('NoneProvider keeps the algorithmic score and is always available', async () => {
    const none = new NoneProvider();
    assert.equal(none.id, PROVIDER_IDS.NONE);
    assert.equal(await none.isAvailable(), true);

    const cov = await none.classifyCoverage('lp1', 'Sentences');
    assert.equal(cov.coverage, 'fallback');

  });

  it('AIProviderRegistry falls back to the limited mode where the Micro-Ranker is unavailable', async () => {
    const registry = new AIProviderRegistry();
    // In node without window the Micro-Ranker (browser model) is unavailable
    const active = await registry.detectBestAvailableProvider();
    assert.equal(active.id, PROVIDER_IDS.NONE);
    assert.equal(registry.getProvider('unknown').id, PROVIDER_IDS.NONE);
  });

  it('MicroRankerProvider is available inside a browser worker, where there is no window', async () => {
    const ranker = new MicroRankerProvider({ embedder: { embed: async () => [] } });
    assert.equal(await ranker.isAvailable(), false);
    globalThis.WorkerGlobalScope = function WorkerGlobalScope() {};
    try {
      assert.equal(await ranker.isAvailable(), true);
    } finally {
      delete globalThis.WorkerGlobalScope;
    }
  });

  it('Pipeline degrades gracefully when provider throws or times out mid-grading', async () => {
    const failingProvider = {
      id: PROVIDER_IDS.MICRO_RANKER,
      name: 'Failing Provider',
      isAvailable: async () => true,
      canOverruleBaseline: () => true,
      classifyCoverage: async () => { throw new Error('GPU crash'); }
    };

    const question = {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Termin absagen', keywords: ['termin', 'absagen'], requiredMatches: 1 }
          ]
        }
      }
    };

    const res = await gradeSchreibenSubmission({
      userText: 'Sehr geehrte Damen und Herren,\nich muss den Termin absagen.\nMit freundlichen Grüßen\nMax',
      question,
      provider: failingProvider
    });

    assert.ok(res.points_earned > 0);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.leitpunkte, 3);
    assert.equal(res.breakdown.gruss, 2);
  });
});
