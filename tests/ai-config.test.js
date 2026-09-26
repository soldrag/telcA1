import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_CONFIG,
  isGenerativeLlmEnabled,
  isAbTestingUiEnabled,
  getPrimaryAiProviderId,
} from '../src/config/aiConfig.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

describe('AI Configuration & Feature Flags', () => {
  it('defaults primary provider to micro_ranker (System 1)', () => {
    assert.equal(AI_CONFIG.PRIMARY_PROVIDER, PROVIDER_IDS.MICRO_RANKER);
    assert.equal(getPrimaryAiProviderId(), PROVIDER_IDS.MICRO_RANKER);
  });

  it('disables heavy generative LLM by default at project config level', () => {
    assert.equal(AI_CONFIG.ENABLE_GENERATIVE_LLM, false);
    assert.equal(isGenerativeLlmEnabled(), false);
  });

  it('disables comparative A/B testing UI by default', () => {
    assert.equal(AI_CONFIG.ENABLE_AB_TESTING_UI, false);
    assert.equal(isAbTestingUiEnabled(), false);
  });
});
