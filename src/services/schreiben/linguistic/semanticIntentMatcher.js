/**
 * Semantic Intent & Proposition Matcher for German A1 Schreiben.
 * Matches structural clause propositions against Leitpunkt criteria contracts.
 * Strictly adheres to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { parseSentencePropositions } from './clauseStructureParser.js';

export const INTENT_TYPES = {
  DEFECT_REPORT: 'DEFECT_REPORT',
  ACTION_REQUEST: 'ACTION_REQUEST',
  APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
  APPOINTMENT_PROPOSAL: 'APPOINTMENT_PROPOSAL',
  REASON_EXPLANATION: 'REASON_EXPLANATION',
  GENERAL: 'GENERAL'
};

export function inferCriterionIntent(criterion = {}) {
  const text = `${criterion.label || ''} ${(criterion.keywords || []).join(' ')}`.toLowerCase();
  if (/absag|stornier|nicht\s+kommen|absage/i.test(text)) return INTENT_TYPES.APPOINTMENT_CANCEL;
  if (/handwerker|techniker|reparier|reparatur|hilfe|bitten|schick/i.test(text)) return INTENT_TYPES.ACTION_REQUEST;
  if (/heizung|kaputt|problem|kalt|wasser|strom|licht/i.test(text)) return INTENT_TYPES.DEFECT_REPORT;
  if (/neuer?\s+termin|terminvorschlag|neue\s+zeit|zeit|wann\s+haben|passt/i.test(text) || (text.includes('termin') && /dienstag|mittwoch|donnerstag|freitag|nächste/i.test(text))) {
    return INTENT_TYPES.APPOINTMENT_PROPOSAL;
  }
  if (/warum|grund|überstunden|arbeit|krank/i.test(text)) return INTENT_TYPES.REASON_EXPLANATION;
  return INTENT_TYPES.GENERAL;
}

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

function evaluateRequestPolarity(clauseProps) {
  const { polarity, arguments: args } = clauseProps;
  if (polarity.negatedNouns.some(n => ['handwerker', 'techniker', 'hilfe', 'reparatur'].includes(n))) {
    return { isMatch: false, isInverted: true, reason: 'negated_entity' };
  }
  if (polarity.negatedActions.some(a => ['kommen', 'reparieren', 'vorbeikommen', 'schicken'].includes(a))) {
    return { isMatch: false, isInverted: true, reason: 'negated_action' };
  }
  const hasTargetEntity = args.objects.some(o => ['handwerker', 'techniker', 'hilfe', 'reparatur'].includes(o));
  const hasTargetAction = ['kommen', 'reparieren', 'vorbeikommen', 'schicken'].includes(clauseProps.predicateCore.baseAction);
  return { isMatch: hasTargetEntity || hasTargetAction, isInverted: false };
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

export function matchPropositionToIntent(clauseProps, intentType) {
  switch (intentType) {
    case INTENT_TYPES.DEFECT_REPORT:
      return evaluateDefectPolarity(clauseProps);
    case INTENT_TYPES.ACTION_REQUEST:
      return evaluateRequestPolarity(clauseProps);
    case INTENT_TYPES.APPOINTMENT_CANCEL:
      return evaluateCancellationPolarity(clauseProps);
    case INTENT_TYPES.APPOINTMENT_PROPOSAL:
      return evaluateProposalPolarity(clauseProps);
    default:
      return { isMatch: false, isInverted: false };
  }
}

export function evaluateSentenceAgainstCriterion(sentence = '', criterion = {}) {
  const clauses = parseSentencePropositions(sentence);
  if (clauses.length === 0) return { isInverted: false, isMatch: false };

  const intentType = inferCriterionIntent(criterion);
  let isInverted = false;
  let inversionReason = null;
  let isMatch = false;

  for (const c of clauses) {
    const res = matchPropositionToIntent(c, intentType);
    if (res.isInverted) {
      isInverted = true;
      inversionReason = res.reason;
    }
    if (res.isMatch) {
      isMatch = true;
    }
  }

  return { isInverted, reason: inversionReason, isMatch, intentType };
}
