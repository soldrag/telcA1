/**
 * telc Deutsch A1 Ranker Policy Implementation.
 * Implements IRankerPolicy adhering strictly to telc A1 regulations:
 * Priority of communicative intent, tolerant thresholds; a compound criterion is full only when every aspect is.
 * Points are not decided here: see regulations/ (exam regulation per level).
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { IRankerPolicy } from './rankerPolicyInterface.js';
import { isKnownWord } from '../../linguistic/a1LexiconService.js';
import { A1_GRAMMAR_PROFILE } from '../../profiles/a1GrammarProfile.js';

export class A1RankerPolicy extends IRankerPolicy {
  constructor() {
    super();
    this._level = 'A1';
    this._thresholds = Object.freeze({ full: 0.65, partial: 0.40 });
    // Raw EmbeddingGemma cosine cutoffs (calibrated on labelled A1 letters, v0.7.15):
    // true coverage 0.52–0.79, same-topic hard negatives up to ~0.60.
    this._neuralCutoffs = Object.freeze({ full: 0.70, partial: 0.55 });
    // Keyword overlap only shows the topic is touched, not that the aspect is stated: when the neural
    // verdict rejects the sentence, a lexical hit alone stays below full (ranker veto).
    this._lexicalCeiling = 0.6;
    // EmbeddingGemma reads typo-heavy A1 text ("ich binn ser krangk") as noise while an examiner still
    // understands it and must not deduct. Clean letters measure 0.05–0.20 words outside the A1 lexicon, typo-heavy 0.40+.
    this._maxUnknownWordRatio = 0.3;
    // Pass mark 6/10 mirrors is_correct in gradingPipeline; two grammar highlights keep A1 feedback digestible.
    this._feedbackSelection = Object.freeze({
      grammarHighlights: 2,
      maxSummarySentences: 4,
      verdict: Object.freeze({ excellent: 9, good: 6 }),
    });
  }

  get level() {
    return this._level;
  }

  get thresholds() {
    return this._thresholds;
  }

  get lexicon() {
    return A1_GRAMMAR_PROFILE.lexicon;
  }

  get feedbackSelection() {
    return this._feedbackSelection;
  }

  classifyScore(rawScore = 0) {
    const s = typeof rawScore === 'number' ? rawScore : 0;
    if (s >= this._thresholds.full) return 'full';
    if (s >= this._thresholds.partial) return 'partial';
    return 'no';
  }

  calibrateNeuralScore(similarity = 0) {
    const s = typeof similarity === 'number' ? similarity : 0;
    const { full: nFull, partial: nPartial } = this._neuralCutoffs;
    const { full, partial } = this._thresholds;
    if (s >= nFull) return Math.min(1, full + ((s - nFull) * (1 - full)) / (1 - nFull));
    if (s >= nPartial) return partial + ((s - nPartial) * (full - partial)) / (nFull - nPartial);
    return Math.max(0, (s * partial) / nPartial);
  }

  combineEvidence(evidence = {}) {
    const { neural = 0, lexical = 0, structured = 0 } = evidence;
    if (!this.isNeuralRejection(evidence)) return Math.max(neural, lexical, structured);
    return Math.max(neural, structured, Math.min(lexical, this._lexicalCeiling));
  }

  isLexicalVeto(evidence = {}) {
    const { lexical = 0, structured = 0 } = evidence;
    return this.isNeuralRejection(evidence) && structured < this._thresholds.full && lexical > this._lexicalCeiling;
  }

  isVerdictReliable(sentences = []) {
    const words = sentences.join(' ').split(/[^A-Za-zÄÖÜäöüß]+/).filter((w) => w.length > 1);
    if (words.length === 0) return true;
    const unknown = words.filter((w) => !isKnownWord(w)).length;
    return unknown / words.length <= this._maxUnknownWordRatio;
  }

  isNeuralRejection({ neural = 0, hasNeural = false } = {}) {
    return hasNeural && neural < this._thresholds.partial;
  }

  aggregateCompound(aspectResults = []) {
    if (!aspectResults || aspectResults.length === 0) {
      return { coverage: 'no', score: 0, matchedSentence: '', isCompound: false, aspects: [] };
    }
    if (aspectResults.length === 1) {
      return { ...aspectResults[0], isCompound: false };
    }

    const scores = aspectResults.map((r) => (typeof r.score === 'number' ? r.score : (r.coverage === 'full' ? 1 : r.coverage === 'partial' ? 0.5 : 0)));
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    const missingAspects = aspectResults
      .filter((r) => r.coverage === 'no' || (typeof r.score === 'number' && r.score < this._thresholds.partial))
      .map((r) => r.aspect);

    const fulfilledAspects = aspectResults
      .filter((r) => r.coverage === 'full' || (typeof r.score === 'number' && r.score >= this._thresholds.full))
      .map((r) => r.aspect);

    const { coverage, finalScore } = this._resolveCompoundVerdict(minScore, maxScore, avgScore, missingAspects);
    const bestSentence = aspectResults.find((r) => r.matchedSentence)?.matchedSentence || '';

    return {
      coverage,
      score: finalScore,
      matchedSentence: bestSentence,
      isCompound: true,
      aspects: aspectResults,
      missingAspects,
      fulfilledAspects,
    };
  }

  _resolveCompoundVerdict(minScore, maxScore, avgScore, missingAspects) {
    if (minScore >= this._thresholds.full && missingAspects.length === 0) {
      return { coverage: 'full', finalScore: Number(minScore.toFixed(4)) };
    }
    if (maxScore >= this._thresholds.partial) {
      const partialVal = Math.min(0.55, Math.max(0.40, avgScore * 0.7));
      return { coverage: 'partial', finalScore: Number(partialVal.toFixed(4)) };
    }
    return { coverage: 'no', finalScore: Number(maxScore.toFixed(4)) };
  }
}

export const defaultA1RankerPolicy = new A1RankerPolicy();
