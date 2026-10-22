/**
 * Stage 2 by the evidence heads: each Leitpunkt unit is read over the letter's spans against the task's example bank
 * (unitEvidence.js), units become Leitpunkt levels by the level policy's trained thresholds, and the letter-level
 * another-purpose head says whether the letter serves the task at all. Returns the same item shape as the keyword
 * stage, so feedback, highlights and the regulation read it unchanged.
 */

import vectorsFile from '../../../data/exams/example-bank/vectors.json' with { type: 'json' };
import { decodeExampleBank } from './exampleBankVectors.js';
import { assessLetterUnits, leitpunktLevel, offTaskFeatures, isOffTaskLetter, unitKeysOf, splitUnitKey } from './unitEvidence.js';
import { resolveLpDiagnosticCode } from '../feedback/feedbackContracts.js';
import { requireLevelPort } from './levelPorts.js';

let decodedBank = null;
const exampleBank = () => (decodedBank ??= decodeExampleBank(vectorsFile));

/** Whether the evidence heads can grade this task: the level has a trained model and the task has a bank. */
export function canGradeByEvidence(questionId, policy) {
  return Boolean(policy?.evidenceModel && questionId && exampleBank().tasks[questionId]);
}

function coverageOf(level) {
  return level >= 2 ? 'full' : (level === 1 ? 'partial' : 'no');
}

function buildItem(criterion, units, thresholds) {
  const score = leitpunktLevel(criterion, units, thresholds);
  const keys = unitKeysOf(criterion).filter((key) => units[key]);
  const aspects = keys.map((key) => {
    const level = leitpunktLevel({ ...criterion, label: splitUnitKey(key).aspectLabel || criterion.label }, { [criterion.id]: units[key] }, thresholds);
    return { aspect: splitUnitKey(key).aspectLabel || criterion.label, coverage: coverageOf(level), matchedSentence: units[key].span, evidence: units[key] };
  });
  const best = keys.map((key) => units[key]).reduce((a, b) => (b.support > a.support ? b : a), { support: -1, span: '' });
  return {
    id: criterion.id,
    label: criterion.label || criterion.id,
    score,
    baselineScore: score,
    arbitrated: false,
    rankerScore: null,
    isProtected: false,
    diagnosticCode: resolveLpDiagnosticCode(score, null, true),
    matchedSentence: score > 0 ? best.span : '',
    keywordSentences: [],
    frameErrors: [],
    rankerDetails: {
      isCompound: aspects.length > 1,
      coverage: coverageOf(score),
      aspects,
      missingAspects: aspects.filter((a) => a.coverage === 'no').map((a) => a.aspect),
    },
  };
}

/**
 * @param {{ criteria: object[], bodySentences: string[], questionId: string,
 *   embed: (text: string) => Promise<Float32Array>, policy: object }} input
 *   embed: EmbeddingGemma sentence_embedding of a document text, the embedding the heads were trained on
 * @returns {Promise<{ items: object[], semanticErrors: [], modelUsed: boolean, modelFailureDetail: string|null,
 *   servesTaskPurpose: boolean, hasEvidenceAnchor: boolean }>}
 */
export async function scoreLeitpunkteByEvidence({ criteria, bodySentences, questionId, embed, policy }) {
  const model = requireLevelPort(policy, 'scoreLeitpunkteByEvidence: policy').evidenceModel;
  const { tasks, neutral } = exampleBank();
  const { units, sentenceOtherPurposeMargins } = await assessLetterUnits({
    sentences: bodySentences, embed, criteria, taskBank: tasks[questionId], neutral, policy, model,
  });
  const { thresholds } = model;
  const items = criteria.map((criterion) => buildItem(criterion, units, thresholds));
  const offTask = isOffTaskLetter(offTaskFeatures({ criteria, units, sentenceOtherPurposeMargins, thresholds }), model.offTask);
  return {
    items,
    semanticErrors: [],
    modelUsed: true,
    modelFailureDetail: null,
    servesTaskPurpose: !offTask,
    hasEvidenceAnchor: items.some((item) => item.score >= 1),
  };
}
