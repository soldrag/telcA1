/**
 * A task's units read by reference alignment (experiment 1, run A): a span supports a unit when its best fulfilling
 * phrase aligns at least as well as the unit's near misses and the irrelevant phrases (a span closer to a near miss
 * supports nothing; it does not void support found elsewhere). Thresholds and the IDF table are level data.
 */

import { parseSentencePropositions } from '../../linguistic/clauseStructureParser.js';
import { tokenizeSpan, bestAlignment, idfFrom } from './alignmentTokens.js';

/** Sentences and the clauses of each. */
export function alignmentSpans(sentences, lexicon) {
  const spans = new Set();
  for (const s of sentences) {
    spans.add(s);
    let props = [];
    try { props = parseSentencePropositions(s, { lexicon }); } catch { props = []; }
    props.map((p) => (p.rawText || '').trim()).filter(Boolean).forEach((c) => spans.add(c));
  }
  return [...spans];
}

function readUnit(unit, spans, { thresholds, context }) {
  let best = 0;
  let evidence = '';
  for (const span of spans) {
    const P = bestAlignment(unit.fulfils, span.tokens, context);
    const M = bestAlignment(unit.misses, span.tokens, context);
    const O = bestAlignment(unit.irr, span.tokens, context);
    if (P >= M && P >= O && P > best) { best = P; evidence = span.text; }
  }
  const level = best >= thresholds.full ? 2 : best >= thresholds.partial ? 1 : 0;
  return { key: unit.key, support: best, level, span: evidence };
}

function combine(readings) {
  if (readings.length === 1) return readings[0].level;
  if (readings.every((r) => r.level === 2)) return 2;
  return readings.some((r) => r.level >= 1) ? 1 : 0;
}

/**
 * @param {{ phrases: { texts: string[], groups: object[] }, sentences: string[], lexicon: object,
 *   model: { thresholds: { full, partial }, idf: { N, df } } }} input - phrases: loadTaskPhrases()
 * @returns {Array<{ lp, level, readings, span }>}
 */
export function alignLetter({ phrases, sentences, lexicon, model }) {
  const tokens = phrases.texts.map((t) => tokenizeSpan(t, lexicon));
  const pick = (indices) => indices.map((i) => tokens[i]);
  const spans = alignmentSpans(sentences, lexicon).map((text) => ({ text, tokens: tokenizeSpan(text, lexicon) }));
  const settings = { thresholds: model.thresholds, context: { idf: idfFrom(model.idf), lexicon } };
  return phrases.groups.map((group) => {
    const readings = group.units.map((u) => readUnit({ key: u.key, fulfils: pick(u.fulfils), misses: pick(u.misses), irr: pick(u.irr) }, spans, settings));
    const best = readings.reduce((a, b) => (b.support > a.support ? b : a), readings[0]);
    return { lp: group.lp, level: combine(readings), readings, span: best?.span || '' };
  });
}
