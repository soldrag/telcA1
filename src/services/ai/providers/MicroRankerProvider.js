/**
 * MicroRankerProvider: High-throughput System 1 decision provider.
 * Scores Leitpunkt coverage with the shared multilingual EmbeddingGemma model
 * (query+keywords vs. sentence cosine) plus the deterministic fallback scorer.
 * Primary evaluator for all Leitpunkte when selected (see pipelineStageScorers.js).
 * Adheres strictly to Clean Architecture and DIP via embedder port + IRankerPolicy injection.
 */

import { AIProvider } from '../AIProvider.js';
import { PROVIDER_IDS } from '../types.js';
import { classifyCriterionCoverage } from '../../schreiben/grading/microRankerService.js';
import { createRankerEmbedder } from '../../embeddings/rankerEmbedder.js';
import { assembleDeterministicFeedback } from '../../schreiben/grading/stage4Feedback.js';
import { defaultA1RankerPolicy } from '../../schreiben/grading/policies/a1RankerPolicy.js';
import { clearEmbeddingCache, unloadEmbeddingService } from '../../embeddings/embeddingService.js';

export class MicroRankerProvider extends AIProvider {
  /**
   * @param {{ embedder?: object|null, policy?: import('../../schreiben/grading/policies/rankerPolicyInterface.js').IRankerPolicy }} options
   *   embedder: ranker embedder port; `null` forces deterministic-only scoring (tests / limited mode).
   */
  constructor({ embedder, policy } = {}) {
    super(PROVIDER_IDS.MICRO_RANKER, '⚡ Micro-Ranker (EmbeddingGemma)');
    this.embedder = embedder === undefined ? createRankerEmbedder() : embedder;
    this.policy = policy || defaultA1RankerPolicy;
  }

  /**
   * Available in modern browsers (WebGPU or WASM), or anywhere in deterministic-only mode.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return this.embedder === null || typeof window !== 'undefined';
  }

  /**
   * Micro-task 1: Classify Leitpunkt coverage.
   * @param {string|object} lp - Leitpunkt criterion (label, keywords, optional aspects)
   * @param {string|string[]} relevantSentences - Candidate sentences
   * @param {{ embedder?: object|null, rivalCriteria?: object[], policy?: object }} context - Per-run embedder with
   *   precomputed sentence vectors, the task's other Leitpunkte for the competitive gate, and the task level's policy
   * @returns {Promise<{coverage: 'full'|'partial'|'no', score?: number}>}
   */
  async classifyCoverage(lp, relevantSentences, context = {}) {
    const embedder = context.embedder !== undefined ? context.embedder : this.embedder;
    const policy = context.policy || this.policy;
    try {
      return await classifyCriterionCoverage(lp, relevantSentences, { embedder, policy, rivalCriteria: context.rivalCriteria });
    } catch (err) {
      console.warn('[MicroRankerProvider] Neural scoring error, using System 1 deterministic analyzer:', err?.message || err);
      return classifyCriterionCoverage(lp, relevantSentences, { embedder: null, policy });
    }
  }

  /**
   * Whether this ranker's verdict on the sentences may overrule the keyword baseline (level policy decides).
   * @param {string[]} sentences
   * @param {object} [policy] - the task level's policy; the provider's own otherwise
   * @returns {boolean}
   */
  canOverruleBaseline(sentences = [], policy = this.policy) {
    return policy.isVerdictReliable(sentences);
  }

  /**
   * Micro-task 2: Grammar candidates.
   * Pure System 1: leaves grammar analysis to deterministic linguistic engine.
   * @returns {Promise<Array>}
   */
  async proposeGrammarCandidates() {
    return [];
  }

  /**
   * Micro-task 3: Verbal feedback polish.
   * Pure System 1: produces deterministic, authenticated telc feedback.
   * @param {object} facts
   * @returns {Promise<string>}
   */
  async polishFeedback(facts = {}) {
    return assembleDeterministicFeedback(facts);
  }

  /**
   * Releases model resources, WebGPU/WASM buffers and clears embedding vector cache.
   */
  async dispose() {
    clearEmbeddingCache();
    await unloadEmbeddingService();
  }
}
