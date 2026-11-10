/**
 * How the evidence head reads a letter body: its spans (sentences, their clauses, adjacent pairs), each unit's best
 * support and strongest whole-sentence contradiction, and the Leitpunkt levels with the regulation's compound rule
 * (a point with declared aspects is full only when every aspect is, reglament §6).
 */

import { parseSentencePropositions } from '../../linguistic/clauseStructureParser.js';
import { spanFeatures, applySoftmaxHead, unitLevel } from './spanEvidence.js';

/** @param {string[]} sentences @param {{ lexicon: object }} context @returns {string[]} unique spans */
export function letterSpans(sentences, { lexicon }) {
  const clauses = sentences.flatMap((s) => {
    try {
      return parseSentencePropositions(s, { lexicon }).map((p) => (p.rawText || '').trim()).filter((t) => t && t !== s.trim());
    } catch {
      return [];
    }
  });
  const pairs = sentences.slice(1).map((s, i) => `${sentences[i]} ${s}`);
  return [...new Set([...sentences, ...clauses, ...pairs])].filter((t) => t.trim());
}

/**
 * @param {{ head: object, unit: object, spans: Array<{ text: string, vector: Float32Array, whole: boolean }> }} input
 * @returns {{ key: string, support: number, contradiction: number, span: string }}
 */
export function readUnit({ head, unit, spans }) {
  const reading = { key: unit.key, support: 0, contradiction: 0, span: '' };
  for (const span of spans) {
    const p = applySoftmaxHead(spanFeatures(span.vector, unit), head);
    if (p.F > reading.support) { reading.support = p.F; reading.span = span.text; }
    if (span.whole) reading.contradiction = Math.max(reading.contradiction, p.C);
  }
  return reading;
}

function combineAspects(levels) {
  if (levels.length === 1) return levels[0];
  if (levels.every((l) => l === 2)) return 2;
  return levels.some((l) => l >= 1) ? 1 : 0;
}

/**
 * @param {{ head: object, thresholds: object, groups: Array<{ lp: string, units: object[] }>, spans: object[] }} input
 * @returns {Array<{ lp: string, level: 0|1|2, readings: object[], span: string }>} per Leitpunkt, rubric order
 */
export function readLetterGroups({ head, thresholds, groups, spans }) {
  return groups.map((group) => {
    const readings = group.units.map((unit) => readUnit({ head, unit, spans })).map((r) => ({ ...r, level: unitLevel(r, thresholds) }));
    const best = readings.reduce((a, b) => (b.support > a.support ? b : a), readings[0]);
    return { lp: group.lp, level: combineAspects(readings.map((r) => r.level)), readings, span: best?.span || '' };
  });
}
