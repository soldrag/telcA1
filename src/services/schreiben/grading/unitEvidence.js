/**
 * Evidence for each Leitpunkt unit (a Leitpunkt, or one aspect of a compound one) in a letter, read by the trained
 * heads (policies/a1EvidenceModel.json) over evidenceFeatures.js. Shared by the training script and grading, so the
 * heads see the same features in both. A unit is supported by its best span (a sentence, a clause of it, or two
 * adjacent sentences together); a contradiction counts only from a whole sentence.
 */

import { computeEvidenceFeatures, applyLogisticHead, FEATURE_NAMES } from './evidenceFeatures.js';
import { computeFallbackEvidence, partitionAspectKeywordsSync } from './rankerFallbackScorer.js';
import { splitCompoundCriterion, isCompoundCriterion } from './compoundCriterionDecomposer.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';
import { parseSentencePropositions } from '../linguistic/clauseStructureParser.js';

const UNIT_SEPARATOR = ':';
const OTHER_PURPOSE_FEATURE = FEATURE_NAMES.indexOf('marginOverOtherPurpose');

/** Unit keys of the task's criteria: "lp1", or "lp2:Personen" for each aspect of a compound Leitpunkt. */
export function unitKeysOf(criterion) {
  return isCompoundCriterion(criterion.label)
    ? splitCompoundCriterion(criterion.label).map((aspect) => `${criterion.id}${UNIT_SEPARATOR}${aspect}`)
    : [criterion.id];
}

export function splitUnitKey(unitKey) {
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
export function deterministicEvidence(criterion, aspectLabel, text, policy) {
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

// Spans of a letter body: every sentence, the clauses of a sentence that has several, and adjacent sentence pairs
// ("Wir haben einen Hund. Darf er mitkommen?" only asks about the dog together).
export function letterSpans(sentences, { lexicon }) {
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
 *   sentenceOtherPurposeMargins: number[] }>}
 */
export async function assessLetterUnits({ sentences, embed, criteria, taskBank, neutral, policy, model }) {
  const spans = letterSpans(sentences, { lexicon: policy.lexicon });
  const vectors = await Promise.all(spans.map((span) => embed(span.text)));
  const units = {};
  const otherPurposeMargin = sentences.map(() => -Infinity);
  for (const criterion of criteria) {
    for (const unitKey of unitKeysOf(criterion)) {
      if (!taskBank.units[unitKey]) continue;
      const verdict = { support: 0, contradict: 0, span: '', contradictedBy: null, contradictedSupport: 0 };
      spans.forEach((span, i) => {
        const scored = scoreUnitSpan({ vector: vectors[i], text: span.text, unitKey, criterion, taskBank, neutral, policy, model });
        if (span.whole) {
          otherPurposeMargin[span.sentence] = Math.max(otherPurposeMargin[span.sentence], scored.features[OTHER_PURPOSE_FEATURE]);
          if (scored.contradict > verdict.contradict) { verdict.contradict = scored.contradict; verdict.contradictedBy = span.text; }
        }
        // A sentence that contradicts the unit cannot support it at the same time.
        const contradicted = span.whole && scored.contradict >= (model?.thresholds?.contradict ?? Infinity);
        if (contradicted) verdict.contradictedSupport = Math.max(verdict.contradictedSupport, scored.support);
        else if (scored.support > verdict.support) { verdict.support = scored.support; verdict.span = span.text; }
      });
      units[unitKey] = verdict;
    }
  }
  return { units, sentenceOtherPurposeMargins: otherPurposeMargin };
}

// A contradicted sentence gives at most partial support: until the hidden set shows no false voids, a contradiction
// caps a unit, it never voids it. Uncontradicted spans decide as usual.
function unitLevel(verdict, thresholds) {
  const level = verdict.support >= thresholds.full ? 2 : (verdict.support >= thresholds.partial ? 1 : 0);
  return Math.max(level, verdict.contradictedSupport >= thresholds.partial ? 1 : 0);
}

/**
 * Leitpunkt level from its units: a compound Leitpunkt is full only when every aspect is, partial when one is at least
 * partial (A ∧ B).
 */
export function leitpunktLevel(criterion, units, thresholds) {
  const levels = unitKeysOf(criterion).filter((key) => units[key]).map((key) => unitLevel(units[key], thresholds));
  if (levels.length === 0) return 0;
  if (levels.every((l) => l === 2)) return 2;
  return levels.some((l) => l >= 1) ? 1 : 0;
}

/** Letter-level features of the another-purpose decision, in the order of model.offTask.features. */
export function offTaskFeatures({ criteria, units, sentenceOtherPurposeMargins, thresholds }) {
  const margins = sentenceOtherPurposeMargins.filter(Number.isFinite);
  const reasonSupport = Math.max(0, ...unitKeysOf(criteria[0]).map((key) => units[key]?.support ?? 0));
  const fullLeitpunkte = criteria.filter((c) => leitpunktLevel(c, units, thresholds) === 2).length;
  return {
    values: [
      margins.length ? margins.reduce((s, m) => s + m, 0) / margins.length : 0,
      margins.length ? Math.min(...margins) : 0,
      reasonSupport,
    ],
    fullLeitpunkte,
  };
}

/**
 * Whether the letter was written for another purpose. Tuned for no false voids: it never says so while two or
 * more Leitpunkte are fully supported.
 */
export function isOffTaskLetter(features, offTaskModel) {
  if (!offTaskModel || features.fullLeitpunkte >= 2) return false;
  return applyLogisticHead(features.values, offTaskModel.head) >= offTaskModel.threshold;
}
