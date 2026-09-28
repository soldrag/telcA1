/**
 * Client-side EmbeddingGemma service using @huggingface/transformers.
 * Computes 256-dim Matryoshka embeddings in the browser with WebGPU -> WASM fallback.
 */

import { prepareEmbeddingVector } from '../schreiben/grading/vectorMath.js';
import { isWebGPUAdapterAvailable } from '../../utils/webGpuSupport.js';
import { createDownloadReporter } from './modelDownloadProgress.js';
import { areModelFilesCached } from './modelCacheProbe.js';

const EMBEDDING_MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';
const EMBEDDING_DTYPE = 'q4';
const EMBEDDING_TASK = 'feature-extraction';
// The weights are what a download is about; transformers.js names them after the dtype.
const EMBEDDING_WEIGHT_FILES = [`onnx/model_${EMBEDDING_DTYPE}.onnx`, `onnx/model_${EMBEDDING_DTYPE}.onnx_data`];
export const EMBEDDING_DIMENSION = 256;

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
