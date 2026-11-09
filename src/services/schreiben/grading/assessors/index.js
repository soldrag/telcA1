/**
 * Registry of Leitpunkt assessors (ILeitpunktAssessor). `keyword-ranker` is the default; an unknown engine id is an
 * error, never a silent fallback.
 */

import { ILeitpunktAssessor } from './leitpunktAssessorInterface.js';
import { KeywordRankerAssessor } from './keywordRankerAssessor.js';

export const LEITPUNKT_ENGINES = Object.freeze({ KEYWORD_RANKER: 'keyword-ranker' });

const REGISTRY = new Map([[LEITPUNKT_ENGINES.KEYWORD_RANKER, new KeywordRankerAssessor()]]);

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
