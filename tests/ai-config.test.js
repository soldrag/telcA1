import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPrimaryAiProviderId } from '../src/config/aiConfig.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

describe('AI Configuration', () => {
  it('defaults primary provider to micro_ranker (System 1)', () => {
    assert.equal(getPrimaryAiProviderId(), PROVIDER_IDS.MICRO_RANKER);
  });
});
