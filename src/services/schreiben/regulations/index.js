/**
 * Registry of Schreiben exam regulations, keyed by CEFR level.
 * A1 is active; A2/B1 register their own ISchreibenRegulation with their own reglament.
 */

import { ISchreibenRegulation } from './schreibenRegulationInterface.js';
import { TelcA1Regulation, telcA1Regulation } from './telcA1Regulation.js';
import { resolveTaskLevel } from '../taskLevel.js';

export { ISchreibenRegulation, TelcA1Regulation, telcA1Regulation };

const REGULATION_REGISTRY = new Map([
  ['A1', telcA1Regulation],
]);

export function registerSchreibenRegulation(level, regulation) {
  if (!level || !(regulation instanceof ISchreibenRegulation)) {
    throw new TypeError('Invalid regulation: must be an instance of ISchreibenRegulation with a valid level');
  }
  REGULATION_REGISTRY.set(String(level).toUpperCase(), regulation);
}

/** @throws {RangeError} for a level without a registered regulation; a missing level is legacy A1 */
export function getSchreibenRegulation(level) {
  return REGULATION_REGISTRY.get(resolveTaskLevel(level, REGULATION_REGISTRY, 'getSchreibenRegulation'));
}

/**
 * Scores the per-criterion levels kept in criteria_breakdown / the self-check ({anrede, lp1..3, gruss}).
 * Old attempts store the same levels, so they are re-scored on the current regulation scale.
 */
export function scoreCriteriaLevels(levels = {}, level) {
  return getSchreibenRegulation(level).scoreTeil2({
    leitpunktLevels: [levels.lp1, levels.lp2, levels.lp3].map((v) => Number(v) || 0),
    anrede: Number(levels.anrede) || 0,
    gruss: Number(levels.gruss) || 0,
  });
}
