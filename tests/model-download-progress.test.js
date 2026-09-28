import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDownloadReporter } from '../src/services/embeddings/modelDownloadProgress.js';
import { areModelFilesCached } from '../src/services/embeddings/modelCacheProbe.js';
import { env as transformersEnv } from '@huggingface/transformers';

// The first Schreiben grading downloads the embedding model; the submit dialog shows how much has arrived.

describe('model download progress', () => {
  it('sums the files transformers.js reports, so the loaded amount never goes back when a new file starts', () => {
    const reports = [];
    const report = createDownloadReporter((event) => reports.push(event.loadedBytes));
    report({ status: 'progress', file: 'model.onnx', loaded: 50e6, total: 180e6 });
    report({ status: 'progress', file: 'tokenizer.json', loaded: 1e6, total: 20e6 });
    report({ status: 'progress', file: 'model.onnx', loaded: 120e6, total: 180e6 });
    assert.deepEqual(reports, [50e6, 51e6, 121e6]);
  });

  it('reports at most once per megabyte and ignores the other statuses', () => {
    const reports = [];
    const report = createDownloadReporter((event) => reports.push(event.loadedBytes));
    report({ status: 'initiate', file: 'model.onnx' });
    report({ status: 'progress', file: 'model.onnx', loaded: 2.1e6 });
    report({ status: 'progress', file: 'model.onnx', loaded: 2.9e6 });
    report({ status: 'done', file: 'model.onnx' });
    report({ status: 'ready' });
    assert.deepEqual(reports, [2.1e6]);
  });

  it('without a listener there is no callback for transformers.js', () => {
    assert.equal(createDownloadReporter(null), undefined);
  });
});


// transformers.js reads cached weights with the same progress events as a download; the cache decides which it is.
describe('model cache probe', () => {
  const env = { useBrowserCache: true, cacheKey: 'test-cache', remoteHost: transformersEnv.remoteHost, remotePathTemplate: transformersEnv.remotePathTemplate };
  const request = { env, modelId: 'onnx-community/embeddinggemma-300m-ONNX', files: ['onnx/model_q4.onnx', 'onnx/model_q4.onnx_data'] };
  // The keys transformers.js stores in the browser (seen in Cache Storage after a real download).
  const storedKeys = [
    'https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/main/onnx/model_q4.onnx',
    'https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX/resolve/main/onnx/model_q4.onnx_data',
  ];

  function withCachedUrls(urls, run) {
    const opened = [];
    globalThis.caches = { open: async (name) => { opened.push(name); return { match: async (url) => (urls.includes(url) ? {} : undefined) }; } };
    return run(opened).finally(() => { delete globalThis.caches; });
  }

  it('is cached when every weight file is under the key transformers.js stores it with', () => withCachedUrls(storedKeys, async (opened) => {
    assert.equal(await areModelFilesCached(request), true);
    assert.deepEqual(opened, ['test-cache']);
  }));

  it('is not cached when a weight file is missing', () => withCachedUrls(storedKeys.slice(0, 1), async () => {
    assert.equal(await areModelFilesCached(request), false);
  }));

  it('is not cached without the Cache API or with the browser cache switched off', async () => {
    assert.equal(await areModelFilesCached(request), false);
    await withCachedUrls(storedKeys, async () => assert.equal(await areModelFilesCached({ ...request, env: { ...env, useBrowserCache: false } }), false));
  });
});
