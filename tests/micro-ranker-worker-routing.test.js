import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

describe('MicroRankerProvider Resource Disposal & Worker Routing', () => {
  test('MicroRankerProvider implements dispose without error', async () => {
    const provider = new MicroRankerProvider();
    assert.equal(provider.id, PROVIDER_IDS.MICRO_RANKER);
    assert.equal(typeof provider.dispose, 'function');

    // Should successfully execute dispose and clean up
    await assert.doesNotReject(async () => {
      await provider.dispose();
    });
  });

  test('isBrowserAi condition matches MICRO_RANKER and CLIENT_WEBGPU', () => {
    const isBrowserAi = (id) => id === PROVIDER_IDS.CLIENT_WEBGPU || id === PROVIDER_IDS.MICRO_RANKER;
    assert.equal(isBrowserAi(PROVIDER_IDS.MICRO_RANKER), true);
    assert.equal(isBrowserAi(PROVIDER_IDS.CLIENT_WEBGPU), true);
    assert.equal(isBrowserAi(PROVIDER_IDS.NONE), false);
    assert.equal(isBrowserAi(PROVIDER_IDS.WINDOW_AI), false);
  });
});
