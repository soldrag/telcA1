/**
 * Evidence review of the keyword stage: the keyword level of each Leitpunkt stays the verdict unless the trained
 * letter heads (policies/a1EvidenceReviewModel.json, scripts/eval/train-letter-model.mjs) are sure enough to move it
 * one level, and the letter is void as another-purpose only when its head says so. The heads read the units'
 * evidence (unitEvidence.js) next to the keyword level; their thresholds were set out of fold for precision, and a
 * head that never reached it was not stored (null), so it leaves the keyword level alone.
 */

import vectorsFile from '../../../data/exams/example-bank/vectors.json' with { type: 'json' };
import { decodeExampleBank } from './exampleBankVectors.js';
import { applyLogisticHead } from './evidenceFeatures.js';
import { assessLetterUnits, unitKeysOf } from './unitEvidence.js';
import { resolveLpDiagnosticCode } from '../feedback/feedbackContracts.js';
import { requireLevelPort } from './levelPorts.js';

let decodedBank = null;
const exampleBank = () => (decodedBank ??= decodeExampleBank(vectorsFile));

export const REVIEW_FEATURE_NAMES = Object.freeze([
  'keywordLevel', 'supportMax', 'supportMin', 'supportMean', 'contradictMax', 'contradictedSupport', 'compound',
]);
export const OFF_TASK_FEATURE_NAMES = Object.freeze([
  'otherPurposeMean', 'otherPurposeMin', 'reasonSupport', 'supportMean', 'keywordLevelSum',
]);

/** Whether the evidence review can run for this task: the level has trained heads and the task has a bank. */
export function canReviewByEvidence(questionId, policy) {
  return Boolean(policy?.evidenceModel?.review && questionId && exampleBank().tasks[questionId]);
}

const mean = (values) => values.reduce((s, v) => s + v, 0) / values.length;

/** Features of one Leitpunkt, in the order of REVIEW_FEATURE_NAMES. */
export function leitpunktReviewFeatures(criterion, units, keywordLevel) {
  const own = unitKeysOf(criterion).map((key) => units[key]).filter(Boolean);
  if (own.length === 0) return null;
  const supports = own.map((u) => u.support);
  return [
    keywordLevel, Math.max(...supports), Math.min(...supports), mean(supports),
    Math.max(...own.map((u) => u.contradict)), Math.max(...own.map((u) => u.contradictedSupport)), own.length > 1 ? 1 : 0,
  ];
}

/** Features of the another-purpose decision, in the order of OFF_TASK_FEATURE_NAMES. */
export function offTaskReviewFeatures({ criteria, units, sentenceOtherPurposeMargins, keywordLevels }) {
  const margins = sentenceOtherPurposeMargins.filter(Number.isFinite);
  const supportOf = (criterion) => Math.max(0, ...unitKeysOf(criterion).map((key) => units[key]?.support ?? 0));
  return [
    margins.length ? mean(margins) : 0,
    margins.length ? Math.min(...margins) : 0,
    supportOf(criteria[0]),
    mean(criteria.map(supportOf)),
    keywordLevels.reduce((s, l) => s + l, 0),
  ];
}

const clears = (features, decision) => Boolean(decision) && applyLogisticHead(features, decision.head) >= decision.threshold;

/** The reviewed level: one up or one down from the keyword level when that head clears its threshold, else unchanged. */
export function reviewedLevel(features, review) {
  const keywordLevel = features[0];
  if (keywordLevel < 2 && clears(features, review.raise)) return keywordLevel + 1;
  if (keywordLevel > 0 && clears(features, review.lower)) return keywordLevel - 1;
  return keywordLevel;
}

export function isOffTaskByReview(features, review) {
  return clears(features, review.offTask);
}

function reviseItem(item, level, unitsOfItem) {
  const evidence = { keywordLevel: item.score, units: unitsOfItem };
  if (level === item.score) return { ...item, evidenceReview: evidence };
  return {
    ...item,
    score: level,
    diagnosticCode: resolveLpDiagnosticCode(level, null, true),
    evidenceReview: { ...evidence, reviewedLevel: level },
  };
}

/**
 * @param {{ items: object[], criteria: object[], bodySentences: string[], questionId: string,
 *   embed: (text: string) => Promise<Float32Array>, policy: object }} input
 *   items: the keyword stage's items; embed: EmbeddingGemma sentence_embedding of a document text
 * @returns {Promise<{ items: object[], servesTaskPurpose: boolean }>}
 */
export async function reviewLeitpunkteByEvidence({ items, criteria, bodySentences, questionId, embed, policy }) {
  const model = requireLevelPort(policy, 'reviewLeitpunkteByEvidence: policy').evidenceModel;
  const { tasks, neutral } = exampleBank();
  const { units, sentenceOtherPurposeMargins } = await assessLetterUnits({
    sentences: bodySentences, embed, criteria, taskBank: tasks[questionId], neutral, policy, model,
  });
  const reviewed = criteria.map((criterion, i) => {
    const features = leitpunktReviewFeatures(criterion, units, items[i].score);
    const unitsOfItem = Object.fromEntries(unitKeysOf(criterion).filter((key) => units[key]).map((key) => [key, units[key]]));
    return features ? reviseItem(items[i], reviewedLevel(features, model.review), unitsOfItem) : items[i];
  });
  const offTask = isOffTaskByReview(offTaskReviewFeatures({
    criteria, units, sentenceOtherPurposeMargins, keywordLevels: items.map((it) => it.score),
  }), model.review);
  return { items: reviewed, servesTaskPurpose: !offTask };
}
