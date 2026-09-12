import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIProvider,
  NoneProvider,
  WindowAiProvider,
  ClientWebGpuProvider,
  AIProviderRegistry,
  PROVIDER_IDS
} from '../src/services/ai/index.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';

describe('AI Providers Contract & Unit Tests', () => {
  let originalLanguageModel;

  beforeEach(() => {
    originalLanguageModel = globalThis.LanguageModel;
  });

  afterEach(() => {
    globalThis.LanguageModel = originalLanguageModel;
  });

  it('AIProvider base class enforces contract and rejects empty arguments', () => {
    assert.throws(() => new AIProvider(), /requires id and name/);
    const base = new AIProvider('test_id', 'Test Provider');
    assert.equal(base.id, 'test_id');
    assert.equal(base.name, 'Test Provider');
  });

  it('NoneProvider implements all micro-tasks and is always available', async () => {
    const none = new NoneProvider();
    assert.equal(none.id, PROVIDER_IDS.NONE);
    assert.equal(await none.isAvailable(), true);

    const cov = await none.classifyCoverage('lp1', 'Sentences');
    assert.equal(cov.coverage, 'fallback');

    const errs = await none.proposeGrammarCandidates('Ich lerne Deutsch.');
    assert.deepEqual(errs, []);

    const feedback = await none.polishFeedback({ anredeScore: 2, lpScore: 6, grussScore: 2, grammarErrorCount: 0 });
    assert.ok(feedback.includes('Die Anrede ist passend'));
  });

  it('WindowAiProvider detects LanguageModel availability and runs micro-tasks', async () => {
    globalThis.LanguageModel = {
      availability: async () => 'readily',
      create: async () => ({
        prompt: async () => JSON.stringify({ coverage: 'full', errors: [{ original: 'ein', correction: 'einen', explanation: 'Akkusativ' }] }),
        destroy: () => {}
      })
    };

    const windowAi = new WindowAiProvider();
    assert.equal(await windowAi.isAvailable(), true);

    const cov = await windowAi.classifyCoverage('Termin', 'Geht es morgen?');
    assert.equal(cov.coverage, 'full');

    const errs = await windowAi.proposeGrammarCandidates('Ich mache ein Kurs.');
    assert.equal(errs.length, 1);
    assert.equal(errs[0].original, 'ein');
  });

  it('ClientWebGpuProvider executes micro-tasks with JSON schema constraints', async () => {
    let capturedOptions = null;
    const mockEngine = {
      chat: {
        completions: {
          create: async (opts) => {
            capturedOptions = opts;
            return {
              choices: [{ message: { content: JSON.stringify({ coverage: 'partial' }) } }]
            };
          }
        }
      }
    };

    const gpuProvider = new ClientWebGpuProvider(mockEngine);
    assert.equal(gpuProvider.id, PROVIDER_IDS.CLIENT_WEBGPU);

    const cov = await gpuProvider.classifyCoverage('Kosten', 'Wie viel kostet?');
    assert.equal(cov.coverage, 'partial');
    assert.ok(capturedOptions.response_format);
    assert.equal(capturedOptions.temperature, 0);
  });

  it('AIProviderRegistry obeys priority order: window_ai -> client_webgpu -> none', async () => {
    const registry = new AIProviderRegistry();
    // In node environment without mocks, window_ai & webgpu are unavailable -> falls back to none
    const active = await registry.detectBestAvailableProvider();
    assert.equal(active.id, PROVIDER_IDS.NONE);

    // With manual override
    registry.setActiveProvider(PROVIDER_IDS.WINDOW_AI);
    assert.equal(registry.activeProviderId, PROVIDER_IDS.WINDOW_AI);
    registry.clearOverride();
    assert.equal(registry.activeProviderId, null);
  });

  it('Pipeline degrades gracefully when provider throws or times out mid-grading', async () => {
    const failingProvider = {
      id: 'failing_ai',
      name: 'Failing Provider',
      isAvailable: async () => true,
      classifyCoverage: async () => { throw new Error('GPU crash'); },
      proposeGrammarCandidates: async () => { throw new Error('Timeout'); },
      polishFeedback: async () => { throw new Error('OOM'); }
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
    assert.equal(res.breakdown.leitpunkte, 2);
    assert.equal(res.breakdown.gruss, 2);
  });
});
