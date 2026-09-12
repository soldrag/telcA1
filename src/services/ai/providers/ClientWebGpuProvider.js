/**
 * ClientWebGpuProvider: In-browser inference via WebLLM and WebGPU (Qwen3-0.6B).
 * Executes structured JSON micro-tasks with temperature 0 and no-think reasoning disabled.
 */

import { AIProvider } from '../AIProvider.js';
import {
  PROVIDER_IDS,
  LEITPUNKT_COVERAGE_SCHEMA,
  SENTENCE_GRAMMAR_SCHEMA,
  FEEDBACK_POLISH_SCHEMA
} from '../types.js';
import { isWebGPUSupported } from '../../schreiben/grading/modelManager.js';
import { executeQwen3Prompt, initQwen3 } from '../../schreiben/grading/qwen3Service.js';
import { buildArbiterPrompt } from '../../schreiben/grading/stage2Leitpunkte.js';
import { buildGrammarPrompt } from '../../schreiben/grading/stage3Grammar.js';
import { assembleDeterministicFeedback } from '../../schreiben/grading/stage4Feedback.js';

export class ClientWebGpuProvider extends AIProvider {
  constructor(customEngine = null) {
    super(PROVIDER_IDS.CLIENT_WEBGPU, 'On-Device Modell (WebGPU, Qwen3-0.6B)');
    this.engine = customEngine;
  }

  async isAvailable() {
    if (this.engine) return true;
    if (typeof navigator === 'undefined' || !navigator.gpu) return false;
    try {
      if (typeof navigator.gpu.requestAdapter === 'function') {
        const adapter = await navigator.gpu.requestAdapter();
        return Boolean(adapter);
      }
      return true;
    } catch {
      return false;
    }
  }

  async getEngine() {
    if (this.engine) return this.engine;
    return await initQwen3();
  }

  async classifyCoverage(lp, relevantSentences) {
    const lpLabel = typeof lp === 'string' ? lp : (lp?.label || lp?.id || '');
    const prompt = buildArbiterPrompt(lpLabel, relevantSentences);
    try {
      const activeEngine = await this.getEngine();
      const parsed = await executeQwen3Prompt({
        prompt,
        schema: LEITPUNKT_COVERAGE_SCHEMA,
        maxTokens: 64,
        engine: activeEngine
      });
      return { coverage: parsed?.coverage || 'fallback' };
    } catch (err) {
      console.warn('[ClientWebGpuProvider] Coverage error:', err?.message || err);
      return { coverage: 'fallback' };
    }
  }

  async proposeGrammarCandidates(sentence) {
    const trimmed = String(sentence || '').trim();
    if (!trimmed) return [];
    const prompt = buildGrammarPrompt(trimmed);
    try {
      const activeEngine = await this.getEngine();
      const parsed = await executeQwen3Prompt({
        prompt,
        schema: SENTENCE_GRAMMAR_SCHEMA,
        maxTokens: 128,
        engine: activeEngine
      });
      return Array.isArray(parsed?.errors) ? parsed.errors : [];
    } catch (err) {
      console.warn('[ClientWebGpuProvider] Grammar error:', err?.message || err);
      return [];
    }
  }

  async polishFeedback(facts = {}) {
    const templateText = assembleDeterministicFeedback(facts);
    const prompt = `You are a friendly German A1 examiner.\nFacts: "${templateText}"\nRewrite into 2 motivating sentences in simple German (level A1).\nStrict rule: Rely ONLY on the facts above.\nAnswer strictly in JSON: {"feedback": "..."}`;
    try {
      const activeEngine = await this.getEngine();
      const parsed = await executeQwen3Prompt({
        prompt,
        schema: FEEDBACK_POLISH_SCHEMA,
        maxTokens: 160,
        engine: activeEngine
      });
      return String(parsed?.feedback || '').trim() || templateText;
    } catch {
      return templateText;
    }
  }

  async dispose() {
    try {
      if (this.engine) {
        if (typeof this.engine.unload === 'function') {
          await this.engine.unload();
        }
      } else {
        const { unloadQwen3 } = await import('../../schreiben/grading/qwen3Service.js');
        await unloadQwen3();
      }
      const { unloadEmbeddingService } = await import('../../embeddings/embeddingService.js');
      await unloadEmbeddingService();
    } catch (err) {
      console.warn('[ClientWebGpuProvider] Dispose warning:', err);
    }
  }
}
