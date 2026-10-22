/**
 * Another-purpose review over the keyword stage: a trained letter head (policies/a1PurposeReviewModel.json,
 * scripts/eval/train-letter-model.mjs) reads how close the letter's sentences are to the task and to other purposes,
 * on each task bank's own scale (unitEvidence.purposeMargin), with the units' support and the keyword levels. It only
 * adds an OFF_TOPIC void to the keyword stage's own; its threshold sits above every letter on task out of fold.
 */

import vectorsFile from '../../../data/exams/example-bank/vectors.json' with { type: 'json' };
import { decodeExampleBank } from './exampleBankVectors.js';
import { applyLogisticHead } from './evidenceFeatures.js';
import { assessLetterUnits, unitKeysOf } from './unitEvidence.js';
import { requireLevelPort } from './levelPorts.js';

let decodedBank = null;
const exampleBank = () => (decodedBank ??= decodeExampleBank(vectorsFile));

export const PURPOSE_FEATURE_NAMES = Object.freeze([
  'purposeMean', 'purposeMin', 'purposeMax', 'reasonSupport', 'supportMean', 'supportMax', 'keywordLevelSum', 'letterPurpose',
]);

/** Whether the review can run for this task: the level has a trained head and the task has a bank. */
export function canReviewPurpose(questionId, policy) {
  return Boolean(policy?.evidenceModel?.purposeReview?.head && questionId && exampleBank().tasks[questionId]);
}

const mean = (values) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0);

/**
 * Features in the order of PURPOSE_FEATURE_NAMES. The maxima carry the regulation's sense of the void: one sentence
 * that clearly serves the task keeps the letter on it; the whole letter's margin (unitEvidence.letterPurposeMargin)
 * says what the letter as a whole is written for, which no single sentence decides.
 */
export function purposeFeatures({ criteria, units, sentencePurposeMargins, letterPurposeMargin = 0, keywordLevels }) {
  const margins = sentencePurposeMargins;
  const supports = criteria.map((criterion) => Math.max(0, ...unitKeysOf(criterion).map((key) => units[key]?.support ?? 0)));
  return [
    mean(margins),
    margins.length ? Math.min(...margins) : 0,
    margins.length ? Math.max(...margins) : 0,
    supports[0],
    mean(supports),
    Math.max(...supports),
    keywordLevels.reduce((s, l) => s + l, 0),
    letterPurposeMargin,
  ];
}

export function isAnotherPurpose(features, review) {
  return applyLogisticHead(features, review.head) >= review.threshold;
}

/**
 * @param {{ keywordLevels: number[], criteria: object[], bodySentences: string[], letterText: string, questionId: string,
 *   embed: (text: string) => Promise<Float32Array>, policy: object }} input
 *   letterText: the whole letter as written
 *   embed: EmbeddingGemma sentence_embedding of a document text, the embedding the heads were trained on
 * @returns {Promise<{ anotherPurpose: boolean }>}
 */
export async function reviewLetterPurpose({ keywordLevels, criteria, bodySentences, letterText, questionId, embed, policy }) {
  const model = requireLevelPort(policy, 'reviewLetterPurpose: policy').evidenceModel;
  const { tasks, neutral } = exampleBank();
  const { units, sentencePurposeMargins, letterPurposeMargin } = await assessLetterUnits({
    sentences: bodySentences, letterText, embed, criteria, taskBank: tasks[questionId], neutral, policy, model,
  });
  const features = purposeFeatures({ criteria, units, sentencePurposeMargins, letterPurposeMargin, keywordLevels });
  return { anotherPurpose: isAnotherPurpose(features, model.purposeReview) };
}
