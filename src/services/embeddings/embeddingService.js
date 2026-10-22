/**
 * Client-side EmbeddingGemma service using @huggingface/transformers.
 * Computes 256-dim Matryoshka embeddings in the browser with WebGPU -> WASM fallback.
 */

import { prepareEmbeddingVector } from '../schreiben/grading/vectorMath.js';
import { isWebGPUAdapterAvailable } from '../../utils/webGpuSupport.js';
import { createDownloadReporter } from './modelDownloadProgress.js';
import { areModelFilesCached } from './modelCacheProbe.js';
import { pointOrtToOwnAssets } from './ortRuntimeAssets.js';

const EMBEDDING_MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';
const EMBEDDING_DTYPE = 'q4';
const EMBEDDING_TASK = 'feature-extraction';
// The weights are what a download is about; transformers.js names them after the dtype.
const EMBEDDING_WEIGHT_FILES = [`onnx/model_${EMBEDDING_DTYPE}.onnx`, `onnx/model_${EMBEDDING_DTYPE}.onnx_data`];
const EMBEDDING_DIMENSION = 256;

// Task prefixes verified against EmbeddingGemma model card
const TASK_PREFIX_QUERY = 'task: search result | query: ';
export const TASK_PREFIX_TEXT = 'task: search result | text: ';

let extractorInstance = null;
let isInitializing = false;
const lpEmbeddingCache = new Map();

function formatEmbeddingPrompt(text = '', isQuery = false) {
  const prefix = isQuery ? TASK_PREFIX_QUERY : TASK_PREFIX_TEXT;
  return `${prefix}${String(text || '').trim()}`;
}

async function getDeviceTarget() {
  return await isWebGPUAdapterAvailable() ? 'webgpu' : 'wasm';
}

/**
 * EmbeddingGemma's trained sentence vector: the model's `sentence_embedding` output (mean pooling and the dense
 * projection the Matryoshka truncation is trained on), not the pooled hidden states the feature-extraction
 * pipeline returns. One factory for the app and the Node scripts, so both embed alike.
 * @param {object} [options] - transformers.js model options (device, progress_callback)
 * @returns {Promise<Function>} extractor(prompt) -> { data }, with dispose()
 */
export async function createSentenceEmbedder(options = {}) {
  const { AutoModel, AutoTokenizer } = await import('@huggingface/transformers');
  const [tokenizer, model] = await Promise.all([
    AutoTokenizer.from_pretrained(EMBEDDING_MODEL_ID, { progress_callback: options.progress_callback }),
    AutoModel.from_pretrained(EMBEDDING_MODEL_ID, { dtype: EMBEDDING_DTYPE, ...options }),
  ]);
  // Output tensors hold native (WebGPU/WASM/ONNX) memory: copy the vector and release them on every call.
  const extractor = async (prompt) => {
    const inputs = tokenizer([prompt], { padding: true, truncation: true });
    const outputs = await model(inputs);
    const data = Float32Array.from(outputs.sentence_embedding.data);
    [...Object.values(outputs), ...Object.values(inputs)].forEach((tensor) => tensor?.dispose?.());
    return { data };
  };
  extractor.dispose = () => model.dispose();
  return extractor;
}

// The document prompt of the EmbeddingGemma model card; the evidence heads were trained on it.
const DOCUMENT_PROMPT = 'title: none | text: ';

/** Sentence vector of a letter span for the evidence heads, from a sentence_embedding extractor. */
export async function computeDocumentVector(text, extractor) {
  const output = await extractor(`${DOCUMENT_PROMPT}${String(text || '').trim()}`);
  return prepareEmbeddingVector(output?.data || output, EMBEDDING_DIMENSION);
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
    const { pipeline, env } = await import('@huggingface/transformers');
    if (env?.useBrowserCache !== undefined) {
      env.useBrowserCache = true;
    }

    const device = await getDeviceTarget();
    await pointOrtToOwnAssets(env, device);
    const options = { device, dtype: EMBEDDING_DTYPE };
    const isCached = await areModelFilesCached({ env, modelId: EMBEDDING_MODEL_ID, files: EMBEDDING_WEIGHT_FILES });
    extractorInstance = await pipeline(EMBEDDING_TASK, EMBEDDING_MODEL_ID, {
      ...options,
      progress_callback: isCached ? undefined : createDownloadReporter(onProgress),
    });
    return extractorInstance;
  } finally {
    isInitializing = false;
  }
}

/**
 * Loads the model ahead of the first embedding, reporting its download ({ loadedBytes }); a cached model
 * loads without a download. Rejects when the model cannot load (offline before the first download).
 */
export async function loadEmbeddingModel(onProgress = null) {
  await initEmbeddingService(onProgress);
}

export async function computeEmbedding(text = '', isQuery = false, customExtractor = null) {
  const extractor = customExtractor || await initEmbeddingService();
  const prompt = formatEmbeddingPrompt(text, isQuery);
  const output = await extractor(prompt, { pooling: 'mean', normalize: false });
  const rawData = output?.data || output?.[0]?.data || output;
  return prepareEmbeddingVector(rawData, EMBEDDING_DIMENSION);
}

export async function getCachedLpEmbedding(lpId = '', lpText = '', customExtractor = null) {
  const cacheKey = `${lpId}:::${lpText}`;
  if (lpEmbeddingCache.has(cacheKey)) {
    return lpEmbeddingCache.get(cacheKey);
  }
  const vec = await computeEmbedding(lpText, true, customExtractor);
  lpEmbeddingCache.set(cacheKey, vec);
  return vec;
}

/** Rubric example phrases are embedded as documents, like the letter's sentences they are compared with. */
export async function getCachedExampleEmbedding(text = '', customExtractor = null) {
  const cacheKey = `example:::${text}`;
  if (lpEmbeddingCache.has(cacheKey)) {
    return lpEmbeddingCache.get(cacheKey);
  }
  const vec = await computeEmbedding(text, false, customExtractor);
  lpEmbeddingCache.set(cacheKey, vec);
  return vec;
}

export function clearEmbeddingCache() {
  lpEmbeddingCache.clear();
}

export async function unloadEmbeddingService() {
  if (extractorInstance) {
    try {
      if (typeof extractorInstance.dispose === 'function') {
        await extractorInstance.dispose();
      } else if (extractorInstance.model?.dispose) {
        await extractorInstance.model.dispose();
      }
    } catch (err) {
      console.warn('[EmbeddingService] Dispose notice:', err);
    }
  }
  extractorInstance = null;
  isInitializing = false;
}
