/**
 * Criterion speech acts and evidence kinds: task data declared on each rubric criterion
 * (`criterion.intent`, `criterion.evidence` / `aspect.evidence`), never guessed from label wording.
 */

export const INTENT_TYPES = Object.freeze({
  DEFECT_REPORT: 'DEFECT_REPORT',
  ACTION_REQUEST: 'ACTION_REQUEST',
  APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
  APPOINTMENT_PROPOSAL: 'APPOINTMENT_PROPOSAL',
  INFORMATION_REQUEST: 'INFORMATION_REQUEST',
  REASON_EXPLANATION: 'REASON_EXPLANATION',
  GENERAL: 'GENERAL'
});

// Evidence a detector can prove from the sentence form: a calendar expression or a person count.
export const EVIDENCE_KINDS = Object.freeze({ TEMPORAL: 'temporal', PERSON_COUNT: 'personCount' });

// Speech acts addressed to the reader: a question or an imperative is their natural form.
const ADDRESSEE_REQUEST_INTENTS = new Set([
  INTENT_TYPES.ACTION_REQUEST,
  INTENT_TYPES.APPOINTMENT_PROPOSAL,
  INTENT_TYPES.INFORMATION_REQUEST
]);

/** A criterion without a declared intent is judged by content only (GENERAL). */
export function resolveCriterionIntent(criterion = {}) {
  return INTENT_TYPES[criterion?.intent] || INTENT_TYPES.GENERAL;
}

export function isAddresseeRequestIntent(intent) {
  return ADDRESSEE_REQUEST_INTENTS.has(intent);
}

function findDeclaredAspect(criterion, aspectLabel) {
  const wanted = String(aspectLabel || '').trim().toLowerCase();
  const aspects = Array.isArray(criterion?.aspects) ? criterion.aspects : [];
  return aspects.find((a) => String(a?.label || '').trim().toLowerCase() === wanted) || null;
}

/**
 * Evidence kind for one aspect of a criterion: the aspect's own declaration, else the criterion's.
 * @returns {'temporal'|'personCount'|null}
 */
export function resolveAspectEvidence(criterion = {}, aspectLabel = '') {
  return findDeclaredAspect(criterion, aspectLabel)?.evidence || criterion?.evidence || null;
}

/** Whether any part of the criterion is proven by a time expression. */
export function hasTemporalEvidence(criterion = {}) {
  const aspects = Array.isArray(criterion?.aspects) ? criterion.aspects : [];
  return [criterion?.evidence, ...aspects.map((a) => a?.evidence)].includes(EVIDENCE_KINDS.TEMPORAL);
}
