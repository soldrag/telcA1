/**
 * Client-side EmbeddingGemma service using @huggingface/transformers.
 * Computes 256-dim Matryoshka embeddings in the browser with WebGPU -> WASM fallback.
 */

import { prepareEmbeddingVector } from '../schreiben/grading/vectorMath.js';
import { isWebGPUSupported } from '../schreiben/grading/modelManager.js';

export const EMBEDDING_MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';
export const EMBEDDING_DIMENSION = 256;

// Task prefixes verified against EmbeddingGemma model card
export const TASK_PREFIX_QUERY = 'task: search result | query: ';
export const TASK_PREFIX_TEXT = 'task: search result | text: ';

let extractorInstance = null;
let isInitializing = false;
const lpEmbeddingCache = new Map();

export function formatEmbeddingPrompt(text = '', isQuery = false) {
  const prefix = isQuery ? TASK_PREFIX_QUERY : TASK_PREFIX_TEXT;
  return `${prefix}${String(text || '').trim()}`;
}

export function getDeviceTarget() {
  return isWebGPUSupported() ? 'webgpu' : 'wasm';
}

export async function initEmbeddingService(onProgress = null) {
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

    const device = getDeviceTarget();
    extractorInstance = await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
      device,
      dtype: 'q4',
      progress_callback: (report) => {
        if (!onProgress || !report) return;
        const pct = report.progress ? ` (${Math.round(report.progress)}%)` : '';
        onProgress(`EmbeddingGemma: ${report.file || 'Initialisiere'}${pct}`, report.progress);
      }
    });
    return extractorInstance;
  } finally {
    isInitializing = false;
  }
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

export async function precomputeTaskCriteria(criteria = [], customExtractor = null) {
  const results = {};
  for (const crit of criteria) {
    const text = crit.label || crit.id;
    const vec = await getCachedLpEmbedding(crit.id, text, customExtractor);
    results[crit.id] = vec;
  }
  return results;
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
