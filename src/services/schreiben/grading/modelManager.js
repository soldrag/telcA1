/**
 * Model lifecycle manager for the two-model hybrid architecture.
 * Enforces sequential lazy-loading (EmbeddingGemma first, then Qwen3),
 * reports unified progress, checks WebGPU support, and manages fallback state.
 */

import { initEmbeddingGemma, unloadEmbeddingGemma } from './embeddingGemmaService.js';
import { initQwen3, unloadQwen3 } from './qwen3Service.js';

import { isWebGPUAdapterAvailable, isWebGPUSupported } from '../../../utils/webGpuSupport.js';

export { isWebGPUSupported, isWebGPUAdapterAvailable };

export const ESTIMATED_MODEL_SIZES = {
  embeddingGemmaMB: 185,
  qwen3MB: 380,
  totalBudgetMB: 700
};

export class ModelManager {
  constructor() {
    this.modelsLoaded = false;
    this.embeddingLoaded = false;
    this.qwenLoaded = false;
    this.loadingError = null;
  }

  async loadEmbeddingModel(onProgress = null) {
    const supported = await isWebGPUAdapterAvailable();
    if (!supported) {
      return { success: false, limitedMode: true, reason: 'no_webgpu' };
    }
    try {
      onProgress?.('Lade Embedding-Modell (EmbeddingGemma 300M)...', 0.15);
      const embedder = await initEmbeddingGemma((msg, prog) => {
        const scaledProg = prog ? 0.15 + prog * 0.2 : 0.2;
        onProgress?.(msg, scaledProg);
      });
      this.embeddingLoaded = true;
      return { success: true, embedder };
    } catch (err) {
      this.loadingError = err;
      console.warn('[ModelManager] Embedding load failed:', err);
      return { success: false, limitedMode: true, error: err?.message || String(err) };
    }
  }

  async unloadEmbeddingModel() {
    await unloadEmbeddingGemma();
    this.embeddingLoaded = false;
  }

  async loadLanguageModel(onProgress = null) {
    const supported = await isWebGPUAdapterAvailable();
    if (!supported) {
      return { success: false, limitedMode: true, reason: 'no_webgpu' };
    }
    try {
      onProgress?.('Lade Sprachmodell (Qwen3-0.6B)...', 0.45);
      const engine = await initQwen3((msg, prog) => {
        const scaledProg = prog ? 0.45 + prog * 0.45 : 0.6;
        onProgress?.(msg, scaledProg);
      });
      this.qwenLoaded = true;
      return { success: true, engine };
    } catch (err) {
      this.loadingError = err;
      console.warn('[ModelManager] Qwen3 load failed:', err);
      return { success: false, limitedMode: true, error: err?.message || String(err) };
    }
  }

  async unloadLanguageModel() {
    await unloadQwen3();
    this.qwenLoaded = false;
  }

  async unloadAll() {
    await Promise.allSettled([
      this.unloadEmbeddingModel(),
      this.unloadLanguageModel()
    ]);
    this.modelsLoaded = false;
  }

  async ensureModelsLoaded(onProgress = null) {
    if (this.modelsLoaded) return { success: true, limitedMode: false };
    const embRes = await this.loadEmbeddingModel(onProgress);
    if (!embRes.success) return embRes;

    const qwenRes = await this.loadLanguageModel(onProgress);
    if (!qwenRes.success) return qwenRes;

    this.modelsLoaded = true;
    onProgress?.('Alle KI-Modelle einsatzbereit', 1.0);
    return { success: true, limitedMode: false };
  }

  getStatus() {
    return {
      webGpuSupported: isWebGPUSupported(),
      modelsLoaded: this.modelsLoaded,
      embeddingLoaded: this.embeddingLoaded,
      qwenLoaded: this.qwenLoaded,
      sizes: ESTIMATED_MODEL_SIZES
    };
  }
}

export const modelManager = new ModelManager();

