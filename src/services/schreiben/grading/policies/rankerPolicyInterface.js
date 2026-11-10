/**
 * Contract of a CEFR level's grading policy (DIP): the level data the engine is given — the lexicon port, the
 * keyword-free evidence head and its reading without a model — and the examiner feedback selection. Points are
 * decided by the level's exam regulation (regulations/), never here.
 */

import { buildExaminerFeedbackDescriptor } from '../../feedback/examinerFeedbackBuilder.js';

export class IRankerPolicy {
  get level() {
    throw new Error('IRankerPolicy.level getter must be implemented');
  }

  /** Lexicon port of the level ({ lookup, findForms, tag }) for clause parsing and lemmas. */
  get lexicon() {
    throw new Error('IRankerPolicy.lexicon getter must be implemented');
  }

  /**
   * The keyword-free evidence head (grading/assessors/evidenceHeadAssessor.js): softmax head weights and letter
   * thresholds, or null when the level has none (the assessor then reads the letter by reference alignment).
   * @returns {{ head: object, thresholds: { full: number, partial: number, contradiction: number } }|null}
   */
  get evidenceHead() {
    return null;
  }

  /**
   * Reference alignment without a model (grading/referenceAlignment/): thresholds and the IDF table over the
   * level's reference phrases, or null when the level has none.
   * @returns {{ thresholds: { full: number, partial: number }, idf: { N: number, df: Record<string, number> } }|null}
   */
  get referenceAlignment() {
    return null;
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
