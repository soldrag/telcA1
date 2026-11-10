/**
 * Client-side EmbeddingGemma service using @huggingface/transformers: the model's trained `sentence_embedding`
 * for the keyword-free evidence head, in the browser with WebGPU -> WASM fallback.
 */

import { prepareEmbeddingVector } from '../schreiben/grading/vectorMath.js';
import { isWebGPUAdapterAvailable } from '../../utils/webGpuSupport.js';
import { createDownloadReporter } from './modelDownloadProgress.js';
import { areModelFilesCached } from './modelCacheProbe.js';
import { pointOrtToOwnAssets } from './ortRuntimeAssets.js';

const EMBEDDING_MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';
const EMBEDDING_DTYPE = 'q4';
// The weights are what a download is about; transformers.js names them after the dtype.
const EMBEDDING_WEIGHT_FILES = [`onnx/model_${EMBEDDING_DTYPE}.onnx`, `onnx/model_${EMBEDDING_DTYPE}.onnx_data`];

// The app's model session (createSentenceEmbedder).
let extractorInstance = null;
let isInitializing = false;

async function getDeviceTarget() {
  return await isWebGPUAdapterAvailable() ? 'webgpu' : 'wasm';
}

/**
 * One EmbeddingGemma session reading the model's trained `sentence_embedding` (mean pooling plus the dense
 * projection). The weights load once. One factory for the app and the Node scripts.
 * @param {object} [options] - transformers.js model options (device, dtype, progress_callback)
 * @returns {Promise<Function>} extractor (prompt) -> { data }, with dispose()
 */
export async function createSentenceEmbedder(options = {}) {
  const { AutoModel, AutoTokenizer } = await import('@huggingface/transformers');
  const [tokenizer, model] = await Promise.all([
    AutoTokenizer.from_pretrained(EMBEDDING_MODEL_ID, { progress_callback: options.progress_callback }),
    AutoModel.from_pretrained(EMBEDDING_MODEL_ID, { dtype: EMBEDDING_DTYPE, ...options }),
  ]);
  // Output tensors hold native (WebGPU/WASM/ONNX) memory: copy the vector and release them on every call.
  const sentence = async (prompt) => {
    const inputs = tokenizer([prompt], { padding: true, truncation: true });
    const outputs = await model(inputs);
    const data = Float32Array.from(outputs.sentence_embedding.data);
    [...Object.values(outputs), ...Object.values(inputs)].forEach((tensor) => tensor?.dispose?.());
    return { data };
  };
  sentence.dispose = () => model.dispose();
  return sentence;
}

// The document prompt of the EmbeddingGemma model card; the evidence head was trained on it.
const DOCUMENT_PROMPT = 'title: none | text: ';

/** The full-length sentence vector of a letter span, for the keyword-free evidence head (trained on all dimensions). */
export async function computeFullDocumentVector(text, extractor) {
  const output = await extractor(`${DOCUMENT_PROMPT}${String(text || '').trim()}`);
  return prepareEmbeddingVector(output?.data || output, Infinity);
}

async function initEmbeddingService(onProgress = null) {
  if (extractorInstance) return extractorInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 40));
    }
    return extractorInstance;
  }

  isInitializing = true;
  try {
    const { env } = await import('@huggingface/transformers');
    if (env?.useBrowserCache !== undefined) {
      env.useBrowserCache = true;
    }

    const device = await getDeviceTarget();
    await pointOrtToOwnAssets(env, device);
    const isCached = await areModelFilesCached({ env, modelId: EMBEDDING_MODEL_ID, files: EMBEDDING_WEIGHT_FILES });
    extractorInstance = await createSentenceEmbedder({
      device,
      progress_callback: isCached ? undefined : createDownloadReporter(onProgress),
    });
    return extractorInstance;
  } finally {
    isInitializing = false;
  }
}

/** The loaded model's `sentence_embedding` reading, loading the model if needed. */
export async function getSentenceExtractor() {
  return initEmbeddingService();
}

/**
 * Loads the model ahead of the first embedding, reporting its download ({ loadedBytes }); a cached model
 * loads without a download. Rejects when the model cannot load (offline before the first download).
 */
export async function loadEmbeddingModel(onProgress = null) {
  await initEmbeddingService(onProgress);
}

export async function unloadEmbeddingService() {
  try {
    await extractorInstance?.dispose?.();
  } catch (err) {
    console.warn('[EmbeddingService] Dispose notice:', err);
  }
  extractorInstance = null;
  isInitializing = false;
}
