/**
 * Refusal of a Leitpunkt target inside one parsed clause.
 * Purely structural: the negation scope (kein / nicht) and the clause role of the rubric target.
 * What counts as a target comes from rubric data (criterionRequestTargets), never from this module.
 */

import { isTargetAction, isTargetNoun } from './criterionRequestTargets.js';

const NO_REFUSAL = Object.freeze({ isRefusal: false, reason: null });

const refusal = (reason) => ({ isRefusal: true, reason });

// Without an infinitive the finite verb is the whole predicate ("Einen neuen Termin möchte ich nicht",
// "Ich frage nicht nach Kosten"): negating it negates its objects, including the prepositional object
// its valency names. With an infinitive the objects belong to the negated action instead.
function isNegatedFullVerbObject(predicateCore, args, targets) {
  if (predicateCore.nonFinVerb) return false;
  const governed = predicateCore.finVerb?.prepObject || [];
  const prepositionalObjects = (args.prepositionalPhrases || [])
    .filter((pp) => governed.includes(pp.preposition)).map((pp) => pp.noun);
  return [...(args.directObjects || []), ...prepositionalObjects].some((n) => isTargetNoun(n, targets));
}

// Adverbial prepositional phrases under "nicht" are left out on purpose: "nicht am Montag" contrasts, it does not refuse.
export function detectTargetRefusal(clauseProps = {}, targets = new Set()) {
  const { polarity = {}, predicateCore = {}, arguments: args = {} } = clauseProps;
  if ((polarity.negatedNouns || []).some((n) => isTargetNoun(n, targets))) {
    return refusal('negated_entity');
  }
  if (!polarity.isSentenceNegated) return NO_REFUSAL;
  if (isTargetAction(predicateCore, targets)) return refusal('negated_action');
  if (args.subject && isTargetNoun(args.subject, targets)) return refusal('negated_participant');
  if (isNegatedFullVerbObject(predicateCore, args, targets)) return refusal('negated_object');
  return NO_REFUSAL;
}
