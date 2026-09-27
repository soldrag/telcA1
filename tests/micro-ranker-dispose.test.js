import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

describe('MicroRankerProvider resource disposal', () => {
  test('MicroRankerProvider implements dispose without error', async () => {
    const provider = new MicroRankerProvider();
    assert.equal(provider.id, PROVIDER_IDS.MICRO_RANKER);
    assert.equal(typeof provider.dispose, 'function');

    // Should successfully execute dispose and clean up
    await assert.doesNotReject(async () => {
      await provider.dispose();
    });
  });
});
