/**
 * Registry of Leitpunkt assessors (ILeitpunktAssessor). `keyword-ranker` is the default; `evidence-head` is the
 * keyword-free head, behind the switch until it passes its gate. An unknown engine id is an error, never a fallback.
 */

import { ILeitpunktAssessor } from './leitpunktAssessorInterface.js';
import { KeywordRankerAssessor } from './keywordRankerAssessor.js';
import { EvidenceHeadAssessor } from './evidenceHeadAssessor.js';
import { ReferenceAlignmentAssessor } from './referenceAlignmentAssessor.js';
import { LEITPUNKT_ENGINES } from './leitpunktEngines.js';

export { LEITPUNKT_ENGINES };

const REGISTRY = new Map([
  [LEITPUNKT_ENGINES.KEYWORD_RANKER, new KeywordRankerAssessor()],
  [LEITPUNKT_ENGINES.EVIDENCE_HEAD, new EvidenceHeadAssessor()],
  [LEITPUNKT_ENGINES.REFERENCE_ALIGNMENT, new ReferenceAlignmentAssessor()],
]);

/** @param {string} id @param {ILeitpunktAssessor} assessor */
export function registerLeitpunktAssessor(id, assessor) {
  if (!(assessor instanceof ILeitpunktAssessor)) throw new TypeError('registerLeitpunktAssessor: not an ILeitpunktAssessor');
  REGISTRY.set(id, assessor);
}

/** @param {string} [id] - LEITPUNKT_ENGINES value; default keyword-ranker */
export function resolveLeitpunktAssessor(id = LEITPUNKT_ENGINES.KEYWORD_RANKER) {
  const assessor = REGISTRY.get(id);
  if (!assessor) throw new RangeError(`Unknown Leitpunkt engine "${id}"; known: ${[...REGISTRY.keys()].join(', ')}`);
  return assessor;
}
