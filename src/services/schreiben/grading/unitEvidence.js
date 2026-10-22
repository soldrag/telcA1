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
const rawPurposeMargin = (vector, fulfils, otherPurpose) => closest(vector, fulfils) - closest(vector, otherPurpose);

// The bank's own reference points: the mean margin of its fulfilling phrases and of its other-purpose phrases, each
// measured against the rest of the bank.
const purposeScales = new WeakMap();
function purposeScaleOf(taskBank) {
  if (!purposeScales.has(taskBank)) {
    const fulfils = Object.values(taskBank.units).flatMap((unit) => unit.fulfils);
    const apart = (vector, bank) => bank.filter((other) => cosineSimilarity(vector, other) < NEAR_COPY);
    const meanMargin = (phrases) => phrases.reduce((s, v) => s + rawPurposeMargin(v, apart(v, fulfils), apart(v, taskBank.otherPurpose)), 0) / phrases.length;
    const onPurpose = meanMargin(fulfils);
    const offPurpose = meanMargin(taskBank.otherPurpose);
    purposeScales.set(taskBank, { fulfils, middle: (onPurpose + offPurpose) / 2, spread: onPurpose - offPurpose || 1 });
  }
  return purposeScales.get(taskBank);
}

/**
 * How much closer a text is to the task's fulfilling phrases than to another purpose's, on the task's own scale:
 * 0 halfway between the bank's fulfilling and other-purpose phrases, +0.5 / -0.5 at their means. Raw cosine margins
 * differ from bank to bank, so only this scale carries over to a task the heads were not trained on.
 */
export function purposeMargin(vector, taskBank) {
  const { fulfils, middle, spread } = purposeScaleOf(taskBank);
  return (rawPurposeMargin(vector, fulfils, taskBank.otherPurpose) - middle) / spread;
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
 * @param {{ sentences: string[], embed: (text: string) => Promise<Float32Array>, criteria: object[], taskBank: object,
 *   neutral: Float32Array[], policy: object, model: object }} input
 * @returns {Promise<{ units: Record<string, { support: number, contradict: number, span: string, contradictedBy: string|null }>,
 *   sentencePurposeMargins: number[] }>} support from spans no whole sentence contradicts; margins of the whole sentences
 */
export async function assessLetterUnits({ sentences, embed, criteria, taskBank, neutral, policy, model }) {
  const spans = letterSpans(sentences, { lexicon: policy.lexicon });
  const vectors = await Promise.all(spans.map((span) => embed(span.text)));
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
  return { units, sentencePurposeMargins };
}
