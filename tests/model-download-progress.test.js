import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDownloadReporter } from '../src/services/embeddings/modelDownloadProgress.js';

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
