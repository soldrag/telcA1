/**
 * telc Deutsch A1 grading policy: the A1 lexicon, the evidence head trained for A1 and its reading without a model,
 * and the A1 feedback selection. Points are decided by the A1 regulation (regulations/telcA1Regulation.js).
 */

import { IRankerPolicy } from './rankerPolicyInterface.js';
import { A1_GRAMMAR_PROFILE } from '../../profiles/a1GrammarProfile.js';
import A1_EVIDENCE_HEAD from './a1EvidenceHead.json' with { type: 'json' };
import A1_REFERENCE_ALIGNMENT from './a1ReferenceAlignment.json' with { type: 'json' };

export class A1RankerPolicy extends IRankerPolicy {
  constructor() {
    super();
    // Pass mark 6/10 mirrors is_correct in gradingPipeline; two grammar highlights keep A1 feedback digestible.
    this._feedbackSelection = Object.freeze({
      grammarHighlights: 2,
      maxSummarySentences: 4,
      verdict: Object.freeze({ excellent: 9, good: 6 }),
    });
  }

  get level() {
    return 'A1';
  }

  /** The keyword-free evidence head trained by scripts/eval/evidence-head/train.mjs. */
  get evidenceHead() {
    return A1_EVIDENCE_HEAD;
  }

  /** Reference alignment thresholds and IDF (scripts/eval/evidence-head/calibrateAlignment.mjs, reference phrases only). */
  get referenceAlignment() {
    return A1_REFERENCE_ALIGNMENT;
  }

  get lexicon() {
    return A1_GRAMMAR_PROFILE.lexicon;
  }

  get feedbackSelection() {
    return this._feedbackSelection;
  }
}

export const defaultA1RankerPolicy = new A1RankerPolicy();
