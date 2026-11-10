/**
 * Refusal of a Leitpunkt target inside one parsed clause.
 * Purely structural: the negation scope (kein / nicht) and the clause role of the rubric target.
 * What counts as a target comes from rubric data (criterionRequestTargets), never from this module.
 */

import { isTargetAction, isTargetNoun } from './criterionRequestTargets.js';

const NO_REFUSAL = Object.freeze({ isRefusal: false, reason: null });

const refusal = (reason) => ({ isRefusal: true, reason });

// A negated verb of wanting or needing (lexicon `verbClass: 'DESIRE'`) without an infinitive refuses its
// object: "Einen neuen Termin möchte ich nicht", "Ich brauche den Termin nicht"; so does a negated verb that asks
// for its prepositional object ("Ich frage nicht nach den Kosten", data `wants`). Other verbs negate a judgement,
// not the wish ("Ich finde den Termin nicht gut", "Ich kenne den Preis nicht", "Ich warte nicht auf den Termin").
function isRefusedWantedObject(predicateCore, args, targets) {
  const asked = (args.prepositionalObjects || []).filter((o) => o.wants).map((o) => o.noun);
  if (asked.some((n) => isTargetNoun(n, targets))) return true;
  if (predicateCore.nonFinVerb || predicateCore.finVerb?.verbClass !== 'DESIRE') return false;
  return (args.directObjects || []).some((n) => isTargetNoun(n, targets));
}

// Prepositional phrases under "nicht" are left out on purpose: "nicht am Montag" contrasts, it does not refuse.
export function detectTargetRefusal(clauseProps = {}, targets = new Set()) {
  const { polarity = {}, predicateCore = {}, arguments: args = {} } = clauseProps;
  if ((polarity.negatedNouns || []).some((n) => isTargetNoun(n, targets))) {
    return refusal('negated_entity');
  }
  if (!polarity.isSentenceNegated) return NO_REFUSAL;
  if (isTargetAction(predicateCore, targets)) return refusal('negated_action');
  if (args.subject && isTargetNoun(args.subject, targets)) return refusal('negated_participant');
  if (isRefusedWantedObject(predicateCore, args, targets)) return refusal('negated_object');
  return NO_REFUSAL;
}
