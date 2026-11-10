/**
 * MicroRankerProvider: the letter is read with the shared multilingual EmbeddingGemma model (the evidence head,
 * grading/assessors/evidenceHeadAssessor.js). The id stays `micro_ranker`: saved attempts and the results screen
 * name the grading mode by it.
 */

import { AIProvider } from '../AIProvider.js';
import { PROVIDER_IDS } from '../types.js';
import { unloadEmbeddingService } from '../../embeddings/embeddingService.js';

export class MicroRankerProvider extends AIProvider {
  constructor() {
    super(PROVIDER_IDS.MICRO_RANKER, '⚡ Micro-Ranker (EmbeddingGemma)');
  }

  /**
   * Available in a browser — on the main thread or inside the grading worker (WebGPU or WASM).
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return typeof window !== 'undefined' || typeof WorkerGlobalScope !== 'undefined';
  }

  /** Releases model resources and WebGPU/WASM buffers. */
  async dispose() {
    await unloadEmbeddingService();
  }
}
