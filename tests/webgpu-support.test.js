import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isWebGPUAdapterAvailable } from '../src/utils/webGpuSupport.js';

const navigatorWithAdapter = (requestAdapter) => ({ gpu: { requestAdapter } });

describe('isWebGPUAdapterAvailable (runtime feature detection)', () => {
  it('is false without a navigator or without navigator.gpu', async () => {
    assert.equal(await isWebGPUAdapterAvailable(undefined), false);
    assert.equal(await isWebGPUAdapterAvailable({}), false);
  });

  it('is false when navigator.gpu exists but no adapter is granted', async () => {
    assert.equal(await isWebGPUAdapterAvailable(navigatorWithAdapter(async () => null)), false);
  });

  it('is false when the adapter request throws', async () => {
    const nav = navigatorWithAdapter(async () => { throw new Error('GPU process crashed'); });
    assert.equal(await isWebGPUAdapterAvailable(nav), false);
  });

  it('is true when an adapter is granted', async () => {
    assert.equal(await isWebGPUAdapterAvailable(navigatorWithAdapter(async () => ({ features: new Set() }))), true);
  });
});
