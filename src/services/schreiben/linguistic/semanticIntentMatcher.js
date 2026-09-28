/**
 * Semantic Intent & Proposition Matcher for German Schreiben.
 * Matches structural clause propositions against Leitpunkt criteria contracts.
 * Strictly adheres to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { parseSentencePropositions } from './clauseStructureParser.js';
import { INTENT_TYPES, resolveCriterionIntent } from './criterionIntents.js';
import { buildRequestTargets, isTargetAction, isTargetNoun } from './criterionRequestTargets.js';
import { detectTargetRefusal } from './criterionRefusalDetector.js';

export { INTENT_TYPES };

// Negations that express a speech act instead of refusing it. A defect is reported by negating
// the function ("funktioniert nicht"), never by negating the problem ("kein Problem"); a cancellation
// or a reason is carried by any negation ("kann nicht kommen", "habe keine Zeit").
const ANY_NEGATION = Object.freeze(['negated_entity', 'negated_action', 'negated_participant', 'negated_object']);
const INTENT_POLARITY = Object.freeze({
  [INTENT_TYPES.DEFECT_REPORT]: { contentNegations: ['negated_action', 'negated_participant'] },
  [INTENT_TYPES.APPOINTMENT_CANCEL]: { contentNegations: ANY_NEGATION },
  [INTENT_TYPES.REASON_EXPLANATION]: { contentNegations: ANY_NEGATION },
  [INTENT_TYPES.ACTION_REQUEST]: { contentNegations: [] },
  [INTENT_TYPES.APPOINTMENT_PROPOSAL]: { contentNegations: [] },
  [INTENT_TYPES.INFORMATION_REQUEST]: { contentNegations: [] },
  [INTENT_TYPES.GENERAL]: { contentNegations: [] }
});

function evaluateDefectPolarity(clauseProps) {
  const { polarity, arguments: args } = clauseProps;
  const hasDefectState = args.stateMarkers.some(s => s.isDefect);
  const hasPositiveState = args.stateMarkers.some(s => s.isPositive);
  const isFunctioningNegated = polarity.isSentenceNegated && clauseProps.predicateCore.baseAction === 'funktionieren';

  if (hasDefectState || isFunctioningNegated) {
    return { isMatch: true, isInverted: false };
  }
  if (hasPositiveState && !polarity.isSentenceNegated) {
    return { isMatch: false, isInverted: true, reason: 'inverted_problem' };
  }
  return { isMatch: false, isInverted: false };
}

function evaluateRequestPolarity(clauseProps, targets) {
  const { predicateCore, arguments: args } = clauseProps;
  const hasTargetEntity = args.objects.some(o => isTargetNoun(o, targets));
  return { isMatch: hasTargetEntity || isTargetAction(predicateCore, targets), isInverted: false };
}

function evaluateCancellationPolarity(clauseProps) {
  const { polarity, predicateCore, arguments: args } = clauseProps;
  const isNegatedAttendance = polarity.isSentenceNegated && predicateCore.baseAction === 'kommen';
  const isCancelAction = ['absagen', 'stornieren'].includes(predicateCore.baseAction);
  const isNoTime = polarity.negatedNouns.includes('zeit');

  if (isNegatedAttendance || isCancelAction || isNoTime) {
    return { isMatch: true, isInverted: false };
  }
  return { isMatch: false, isInverted: false };
}

function evaluateProposalPolarity(clauseProps) {
  const { polarity, predicateCore, arguments: args } = clauseProps;
  // If the clause negates coming to a past/current appointment, it is a cancellation, NOT a proposal!
  if (polarity.isSentenceNegated && predicateCore.baseAction === 'kommen') {
    return { isMatch: false, isInverted: false };
  }
  const hasTimeMarkers = args.temporalMarkers.length > 0;
  const isTimeQuestion = ['haben', 'passen', 'gehen', 'sein'].includes(predicateCore.baseAction);
  if (hasTimeMarkers || (isTimeQuestion && args.temporalMarkers.includes('zeit'))) {
    return { isMatch: true, isInverted: false };
  }
  return { isMatch: false, isInverted: false };
}

function evaluateIntentMatch(clauseProps, intentType, targets) {
  switch (intentType) {
    case INTENT_TYPES.DEFECT_REPORT:
      return evaluateDefectPolarity(clauseProps);
    case INTENT_TYPES.ACTION_REQUEST:
      return evaluateRequestPolarity(clauseProps, targets);
    case INTENT_TYPES.APPOINTMENT_CANCEL:
      return evaluateCancellationPolarity(clauseProps);
    case INTENT_TYPES.APPOINTMENT_PROPOSAL:
      return evaluateProposalPolarity(clauseProps);
    default:
      return { isMatch: false, isInverted: false };
  }
}

function matchPropositionToIntent(clauseProps, { intentType, targets = new Set() } = {}) {
  const refusal = detectTargetRefusal(clauseProps, targets);
  const isContent = INTENT_POLARITY[intentType]?.contentNegations.includes(refusal.reason);
  if (refusal.isRefusal && !isContent) return { isMatch: false, isInverted: true, reason: refusal.reason };
  return evaluateIntentMatch(clauseProps, intentType, targets);
}

/**
 * @param {string} sentence
 * @param {{ criterion: object, lexicon: object }} context - the rubric criterion and the level's lexicon port
 */
export function classifySentenceClauses(sentence = '', { criterion = {}, lexicon } = {}) {
  const intentType = resolveCriterionIntent(criterion);
  const targets = buildRequestTargets(criterion, lexicon);
  const clauses = parseSentencePropositions(sentence, { lexicon }).map((c) => ({
    text: c.rawText,
    ...matchPropositionToIntent(c, { intentType, targets })
  }));
  return { intentType, clauses };
}

export function evaluateSentenceAgainstCriterion(sentence = '', context = {}) {
  const { intentType, clauses } = classifySentenceClauses(sentence, context);
  if (clauses.length === 0) return { isInverted: false, isMatch: false };
  const lastRefusal = clauses.filter((c) => c.isInverted).pop();
  return {
    isInverted: Boolean(lastRefusal),
    reason: lastRefusal?.reason ?? null,
    isMatch: clauses.some((c) => c.isMatch),
    intentType
  };
}
