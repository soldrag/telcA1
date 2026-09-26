/**
 * telc Deutsch A1 / Start Deutsch 1 — Schreiben Teil 2 regulation.
 * Source of truth: reglament/telc-a1.md §6.
 * - Each Leitpunkt: 3 fulfilled and understandable · 1.5 partial · 0 missing/unclear.
 * - Kommunikative Gestaltung (Anrede + Gruß): 1 appropriate · 0.5 atypical or one missing · 0 both missing.
 * - Grammar, spelling and length are not scoring criteria at A1; they stay feedback-only.
 */

import { ISchreibenRegulation } from './schreibenRegulationInterface.js';

const LEITPUNKT_POINTS = Object.freeze({ 2: 3, 1: 1.5, 0: 0 });
const KG_POINTS = Object.freeze({ appropriate: 1, partial: 0.5, none: 0 });
const LEITPUNKT_MAX = LEITPUNKT_POINTS[2];
const KG_MAX = KG_POINTS.appropriate;
const FULL_LEVEL = 2;

function normalizeLevel(level) {
  const n = Number(level);
  if (n >= FULL_LEVEL) return FULL_LEVEL;
  return n >= 1 ? 1 : 0;
}

function rateKommunikativeGestaltung(anrede, gruss) {
  if (anrede === FULL_LEVEL && gruss === FULL_LEVEL) return 'appropriate';
  if (anrede === 0 && gruss === 0) return 'none';
  return 'partial';
}

function scoreLeitpunkt(level) {
  return { level, points: LEITPUNKT_POINTS[level], maxPoints: LEITPUNKT_MAX };
}

function scoreKommunikativeGestaltung(anrede, gruss) {
  const rating = rateKommunikativeGestaltung(anrede, gruss);
  const level = { appropriate: 2, partial: 1, none: 0 }[rating];
  return { rating, level, points: KG_POINTS[rating], maxPoints: KG_MAX };
}

export class TelcA1Regulation extends ISchreibenRegulation {
  get id() { return 'telc-a1'; }

  get level() { return 'A1'; }

  get maxPoints() { return 10; }

  get trainingPassMark() { return 6; }

  scoreTeil2({ leitpunktLevels = [], anrede = 0, gruss = 0, isUnratable = false } = {}) {
    const levels = isUnratable ? leitpunktLevels.map(() => 0) : leitpunktLevels.map(normalizeLevel);
    const leitpunkte = levels.map(scoreLeitpunkt);
    const kg = isUnratable
      ? scoreKommunikativeGestaltung(0, 0)
      : scoreKommunikativeGestaltung(normalizeLevel(anrede), normalizeLevel(gruss));
    const total = leitpunkte.reduce((sum, lp) => sum + lp.points, 0) + kg.points;
    return { leitpunkte, kg, total, maxPoints: this.maxPoints };
  }
}

export const telcA1Regulation = Object.freeze(new TelcA1Regulation());
