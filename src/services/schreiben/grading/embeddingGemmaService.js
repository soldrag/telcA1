/**
 * Client-side EmbeddingGemma service using @huggingface/transformers.
 * Computes 256-dim Matryoshka embeddings in the browser using WebGPU / ONNX.
 */

import {
  EMBEDDING_MODEL_ID,
  EMBEDDING_DIMENSION,
  TASK_PREFIX_QUERY,
  TASK_PREFIX_TEXT
} from './types.js';
import { prepareEmbeddingVector } from './vectorMath.js';

let extractorInstance = null;
let isInitializing = false;

export function formatPrompt(text = '', isQuery = false) {
  const prefix = isQuery ? TASK_PREFIX_QUERY : TASK_PREFIX_TEXT;
  return `${prefix}${String(text || '').trim()}`;
}

export async function initEmbeddingGemma(onProgress = null) {
  if (extractorInstance) return extractorInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 50));
    }
    return extractorInstance;
  }

  isInitializing = true;
  try {
    const { pipeline, env } = await import('@huggingface/transformers');
    // Ensure browser caching is active
    if (env?.useBrowserCache !== undefined) {
      env.useBrowserCache = true;
    }

    extractorInstance = await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
      dtype: 'q4',
      progress_callback: (report) => {
        if (!onProgress || !report) return;
        const pct = report.progress ? ` (${Math.round(report.progress)}%)` : '';
        onProgress(`Lade EmbeddingGemma: ${report.file || 'Modell'}${pct}`, report.progress);
      }
    });
    return extractorInstance;
  } finally {
    isInitializing = false;
  }
}

export async function getEmbedding(text = '', isQuery = false, customExtractor = null) {
  const extractor = customExtractor || await initEmbeddingGemma();
  const prompt = formatPrompt(text, isQuery);
  const output = await extractor(prompt, { pooling: 'mean', normalize: false });
  const rawData = output?.data || output?.[0]?.data || output;
  return prepareEmbeddingVector(rawData, EMBEDDING_DIMENSION);
}

export async function getBatchEmbeddings(texts = [], isQuery = false, customExtractor = null) {
  const extractor = customExtractor || await initEmbeddingGemma();
  const results = [];
  for (const text of texts) {
    const vec = await getEmbedding(text, isQuery, extractor);
    results.push(vec);
  }
  return results;
}

export async function unloadEmbeddingGemma() {
  if (extractorInstance) {
    try {
      if (typeof extractorInstance.dispose === 'function') {
        await extractorInstance.dispose();
      } else if (extractorInstance.model && typeof extractorInstance.model.dispose === 'function') {
        await extractorInstance.model.dispose();
      }
    } catch (err) {
      console.warn('[EmbeddingGemma] Dispose warning:', err);
    }
  }
  extractorInstance = null;
  isInitializing = false;
}

export function resetEmbeddingService() {
  unloadEmbeddingGemma().catch(() => {});
  extractorInstance = null;
  isInitializing = false;
}

