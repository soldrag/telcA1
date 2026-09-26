/**
 * Abstract Interface Contract for CEFR Ranker Policies (DIP).
 * All CEFR level-specific regulations (A1, A2, B1) implement this contract.
 * Strictly adheres to McConnell limits (<= 90 lines, <= 15 lines per function).
 */

import { buildExaminerFeedbackDescriptor } from '../../feedback/examinerFeedbackBuilder.js';

/**
 * @typedef {Object} CoverageThresholds
 * @property {number} full - Minimum score for 'full' coverage
 * @property {number} partial - Minimum score for 'partial' coverage
 */

/**
 * @typedef {Object} AspectEvaluationResult
 * @property {string} aspect
 * @property {'full'|'partial'|'no'} coverage
 * @property {number} score
 * @property {string} [matchedSentence]
 */

/**
 * @typedef {Object} CompoundAggregationResult
 * @property {'full'|'partial'|'no'} coverage
 * @property {number} score
 * @property {string} matchedSentence
 * @property {boolean} isCompound
 * @property {AspectEvaluationResult[]} aspects
 * @property {string[]} missingAspects
 * @property {string[]} fulfilledAspects
 */

export class IRankerPolicy {
  get level() {
    throw new Error('IRankerPolicy.level getter must be implemented');
  }

  get thresholds() {
    throw new Error('IRankerPolicy.thresholds getter must be implemented');
  }

  /** Lexicon port of the level ({ lookup, findForms, tag }) for clause parsing. */
  get lexicon() {
    throw new Error('IRankerPolicy.lexicon getter must be implemented');
  }

  classifyScore(rawScore) {
    throw new Error('IRankerPolicy.classifyScore must be implemented');
  }

  aggregateCompound(aspectResults) {
    throw new Error('IRankerPolicy.aggregateCompound must be implemented');
  }

  /**
   * Maps a raw embedding cosine onto the policy score scale used by classifyScore.
   * Identity by default so policies without neural calibration keep working.
   * @param {number} similarity
   * @returns {number}
   */
  calibrateNeuralScore(similarity) {
    return similarity;
  }

  /**
   * Merges neural and deterministic evidence into one policy-scale score.
   * Default keeps the strongest signal; level policies may bound lexical hints when a neural verdict exists.
   * @param {{ neural: number, lexical: number, structured: number, hasNeural: boolean }} evidence
   * @returns {number}
   */
  combineEvidence({ neural = 0, lexical = 0, structured = 0 } = {}) {
    return Math.max(neural, lexical, structured);
  }

  /**
   * True when the neural verdict rejected a sentence that only keyword overlap supported.
   * @param {{ neural: number, lexical: number, structured: number, hasNeural: boolean }} evidence
   * @returns {boolean}
   */
  isLexicalVeto() {
    return false;
  }

  /**
   * Upper bound for lexical hints on an aspect whose declared evidence kind (e.g. 'personCount')
   * the detector did not prove. Identity by default: levels decide whether such an aspect can be full.
   * @param {string|null} evidenceKind
   * @param {number} lexical
   * @returns {number}
   */
  capUnprovenLexical(evidenceKind, lexical) {
    return lexical;
  }

  /**
   * Whether the neural verdict on these sentences is trustworthy enough to lower a keyword baseline.
   * Levels define what "readable" means (e.g. share of words outside the level lexicon).
   * @param {string[]} sentences
   * @returns {boolean}
   */
  isVerdictReliable() {
    return true;
  }

  /**
   * Level-specific selection rules for the examiner feedback (verdict thresholds, highlight counts).
   * @returns {{ grammarHighlights: number, maxSummarySentences: number, verdict: { excellent: number, good: number } }}
   */
  get feedbackSelection() {
    throw new Error('IRankerPolicy.feedbackSelection getter must be implemented');
  }

  /**
   * Builds the language-neutral examiner feedback descriptor for this level.
   * @param {object} facts - Locked grading facts (see buildExaminerFeedbackFacts in grading/pipelineFeedback.js)
   * @returns {{ version: number, summary: Array, bullets: Array }}
   */
  buildExaminerFeedback(facts) {
    return buildExaminerFeedbackDescriptor(facts, this.feedbackSelection);
  }
}
