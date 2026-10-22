/**
 * Evidence for each Leitpunkt unit (a Leitpunkt, or one aspect of a compound one) in a letter, read by the trained
 * heads (policies/a1EvidenceModel.json) over evidenceFeatures.js. Shared by the training script and grading, so the
 * heads see the same features in both. A unit is supported by its best span (a sentence, a clause of it, or two
 * adjacent sentences together); a contradiction counts only from a whole sentence.
 */

import { computeEvidenceFeatures, applyLogisticHead } from './evidenceFeatures.js';
import { cosineSimilarity } from './vectorMath.js';
import { computeFallbackEvidence, partitionAspectKeywordsSync } from './rankerFallbackScorer.js';
import { splitCompoundCriterion, isCompoundCriterion } from './compoundCriterionDecomposer.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';
import { parseSentencePropositions } from '../linguistic/clauseStructureParser.js';

const UNIT_SEPARATOR = ':';
// Phrases this close to the one being measured are its own learner variant or a near copy, not another reference.
const NEAR_COPY = 0.9;

/** Unit keys of the task's criteria: "lp1", or "lp2:Personen" for each aspect of a compound Leitpunkt. */
export function unitKeysOf(criterion) {
  return isCompoundCriterion(criterion.label)
    ? splitCompoundCriterion(criterion.label).map((aspect) => `${criterion.id}${UNIT_SEPARATOR}${aspect}`)
    : [criterion.id];
}

function splitUnitKey(unitKey) {
  const [lpId, aspectLabel = null] = unitKey.split(UNIT_SEPARATOR);
  return { lpId, aspectLabel };
}

// The other Leitpunkte's fulfilling phrases; the aspects of the same Leitpunkt are not its rivals.
function rivalFulfils(taskBank, unitKey) {
  const { lpId } = splitUnitKey(unitKey);
  return Object.entries(taskBank.units)
    .filter(([key]) => splitUnitKey(key).lpId !== lpId)
    .flatMap(([, unit]) => unit.fulfils);
}

/** Keyword, structured-detector and negation readings of the text for one unit. */
function deterministicEvidence(criterion, aspectLabel, text, policy) {
  const label = aspectLabel || criterion.label;
  const keywords = aspectLabel
    ? partitionAspectKeywordsSync(criterion, splitCompoundCriterion(criterion.label), { policy })[aspectLabel] || []
    : criterion.keywords || [];
  const evidence = (criterion.aspects || []).find((a) => a.label === aspectLabel)?.evidence || criterion.evidence || null;
  const { lexical, structured } = computeFallbackEvidence({ label, keywords, evidence }, text, { policy });
  const negated = detectSemanticInversion(text, criterion, { lexicon: policy.lexicon })?.isInverted || false;
  return { lexical, structured, negated };
}

/**
 * @returns {{ features: number[], support: number, contradict: number }}
 */
export function scoreUnitSpan({ vector, text, unitKey, criterion, taskBank, neutral, policy, model }) {
  const { aspectLabel } = splitUnitKey(unitKey);
  const features = computeEvidenceFeatures(vector, taskBank.units[unitKey], {
    rivalFulfils: rivalFulfils(taskBank, unitKey),
    otherPurpose: taskBank.otherPurpose,
    neutral,
    ...deterministicEvidence(criterion, aspectLabel, text, policy),
  });
  return {
    features,
    support: model ? applyLogisticHead(features, model.support) : 0,
    contradict: model ? applyLogisticHead(features, model.contradict) : 0,
  };
}

const closest = (vector, bank) => Math.max(-1, ...bank.map((other) => cosineSimilarity(vector, other)));
const rawMargin = (vector, onPurpose, offPurpose) => closest(vector, onPurpose) - closest(vector, offPurpose);

// A scale from the bank's own reference points: the mean margin of its on-purpose and of its off-purpose examples,
// each measured against the rest of the bank (itself and, for phrases, its near copies left out).
function scaleOf(onPurpose, offPurpose, nearCopy) {
  const apart = (vector, bank) => bank.filter((other) => other !== vector && cosineSimilarity(vector, other) < nearCopy);
  const meanMargin = (examples) => examples.reduce((s, v) => s + rawMargin(v, apart(v, onPurpose), apart(v, offPurpose)), 0) / examples.length;
  const on = meanMargin(onPurpose);
  const off = meanMargin(offPurpose);
  return { onPurpose, offPurpose, middle: (on + off) / 2, spread: on - off || 1 };
}
const scaled = (vector, { onPurpose, offPurpose, middle, spread }) => (rawMargin(vector, onPurpose, offPurpose) - middle) / spread;

const purposeScales = new WeakMap();
function purposeScalesOf(taskBank) {
  if (!purposeScales.has(taskBank)) {
    const fulfils = Object.values(taskBank.units).flatMap((unit) => unit.fulfils);
    // A bank not decoded by decodeExampleBank has only its own other-purpose phrases and letters.
    const foreign = taskBank.foreignPurpose ?? taskBank.otherPurpose;
    const letters = taskBank.purposeLetters;
    purposeScales.set(taskBank, {
      phrase: scaleOf(fulfils, foreign, NEAR_COPY),
      letter: letters?.onTask.length ? scaleOf(letters.onTask, letters.foreign ?? letters.offTask, Infinity) : null,
    });
  }
  return purposeScales.get(taskBank);
}

/**
 * How much closer a sentence is to the task's fulfilling phrases than to another purpose's (its own other-purpose
 * phrases and the other tasks' fulfilling ones, exampleBankVectors.foreignPurpose), on the task's own scale: 0 halfway
 * between the bank's fulfilling and other-purpose phrases, +0.5 / -0.5 at their means. Raw cosine margins differ from
 * bank to bank, so only this scale carries over to a task the heads were not trained on.
 */
export function purposeMargin(vector, taskBank) {
  return scaled(vector, purposeScalesOf(taskBank).phrase);
}

/**
 * The same margin for the whole letter against the task's prototype letters (exampleBankVectors purposeLetters):
 * one sentence on topic decides a sentence margin, not what the letter as a whole is written for. 0 without prototypes.
 */
export function letterPurposeMargin(vector, taskBank) {
  const { letter } = purposeScalesOf(taskBank);
  return letter ? scaled(vector, letter) : 0;
}

// Spans of a letter body: every sentence, the clauses of a sentence that has several, and adjacent sentence pairs
// ("Wir haben einen Hund. Darf er mitkommen?" only asks about the dog together).
function letterSpans(sentences, { lexicon }) {
  const spans = sentences.map((text, index) => ({ text, sentence: index, whole: true }));
  sentences.forEach((sentence, index) => {
    const clauses = parseSentencePropositions(sentence, { lexicon }).map((p) => p.rawText).filter(Boolean);
    if (clauses.length > 1) clauses.forEach((text) => spans.push({ text, sentence: index, whole: false }));
  });
  for (let i = 0; i + 1 < sentences.length; i++) spans.push({ text: `${sentences[i]} ${sentences[i + 1]}`, sentence: i, whole: false });
  return spans;
}

/**
 * Reads every unit of the task over the letter's spans.
 * @param {{ sentences: string[], letterText?: string, embed: (text: string) => Promise<Float32Array>, criteria: object[],
 *   taskBank: object, neutral: Float32Array[], policy: object, model: object }} input
 *   letterText: the whole letter as written (salutation and closing say whom it addresses); the body by default
 * @returns {Promise<{ units: Record<string, { support: number, contradict: number, span: string, contradictedBy: string|null }>,
 *   sentencePurposeMargins: number[], letterPurposeMargin: number }>} support from spans no whole sentence contradicts;
 *   margins of the whole sentences and of the whole letter
 */
export async function assessLetterUnits({ sentences, letterText = sentences.join(' '), embed, criteria, taskBank, neutral, policy, model }) {
  const spans = letterSpans(sentences, { lexicon: policy.lexicon });
  const [letterVector, ...vectors] = await Promise.all([embed(letterText), ...spans.map((span) => embed(span.text))]);
  const units = {};
  for (const criterion of criteria) {
    for (const unitKey of unitKeysOf(criterion)) {
      if (!taskBank.units[unitKey]) continue;
      const verdict = { support: 0, contradict: 0, span: '', contradictedBy: null };
      spans.forEach((span, i) => {
        const scored = scoreUnitSpan({ vector: vectors[i], text: span.text, unitKey, criterion, taskBank, neutral, policy, model });
        if (span.whole && scored.contradict > verdict.contradict) { verdict.contradict = scored.contradict; verdict.contradictedBy = span.text; }
        // A sentence that contradicts the unit cannot support it at the same time.
        const contradicted = span.whole && scored.contradict >= (model?.thresholds?.contradict ?? Infinity);
        if (!contradicted && scored.support > verdict.support) { verdict.support = scored.support; verdict.span = span.text; }
      });
      units[unitKey] = verdict;
    }
  }
  const sentencePurposeMargins = spans.flatMap((span, i) => (span.whole ? [purposeMargin(vectors[i], taskBank)] : []));
  return { units, sentencePurposeMargins, letterPurposeMargin: letterPurposeMargin(letterVector, taskBank) };
}
