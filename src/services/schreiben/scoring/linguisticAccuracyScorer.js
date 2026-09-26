/**
 * Linguistic Accuracy Scorer (Sprachliche Genauigkeit, pedagogical scale 0–10).
 * Independent of the official exam score: it measures defect density so a learner sees how far the text is
 * from error-free German. Distinct defects are weighted by how much they disturb understanding and
 * normalised to a reference length, so a longer letter is not punished for having more words.
 */

import { dedupeGrammarErrors } from '../linguistic/grammarErrorDeduper.js';

const MAX_SCORE = 10;
// Word order breaks the sentence frame and hinders reading most; spelling slips least.
const DEFAULT_WEIGHTS = Object.freeze({
  syntax: 1.5,
  rektion: 1.0,
  agreement: 1.0,
  grammar: 1.0,
  lexik: 1.0,
  orthography: 0.5,
});
const DEFAULT_WEIGHT = 1.0;
// Penalties are counted per this many words; shorter texts are not scaled up.
const REFERENCE_WORD_COUNT = 30;

// Band keys only: labels are presentation and live in the i18n dictionaries (results.linguisticAccuracy.bands).
const BANDS = [
  { min: 9.0, band: 'excellent' },
  { min: 7.0, band: 'good' },
  { min: 5.0, band: 'satisfactory' },
  { min: -Infinity, band: 'needs_practice' },
];

function resolveErrorWeight(error = {}, weights = DEFAULT_WEIGHTS) {
  const category = String(error.category || '').toLowerCase();
  return weights[category] ?? DEFAULT_WEIGHT;
}

function resolveAccuracyBand(score = 0) {
  return BANDS.find((b) => score >= b.min).band;
}

/** Lower bounds of the bands, highest first — for scale legends in the UI. */
export const ACCURACY_BAND_THRESHOLDS = Object.freeze(BANDS.filter((b) => Number.isFinite(b.min)).map(({ band, min }) => ({ band, min })));
export const ACCURACY_REFERENCE_WORD_COUNT = REFERENCE_WORD_COUNT;

function summarizeByCategory(errors, weights) {
  const summary = new Map();
  errors.forEach((err) => {
    const category = String(err.category || 'other').toLowerCase();
    const entry = summary.get(category) || { category, count: 0, weight: resolveErrorWeight(err, weights) };
    summary.set(category, { ...entry, count: entry.count + 1 });
  });
  return [...summary.values()].sort((a, b) => b.count * b.weight - a.count * a.weight);
}

function buildResult({ score, errorCount, wordCount, band = resolveAccuracyBand(score), byCategory = [] }) {
  return { score, maxScore: MAX_SCORE, errorCount, wordCount, percentage: Math.round((score / MAX_SCORE) * 100), band, byCategory };
}

/**
 * @param {{ grammarErrors?: Array, wordCount?: number, isGibberish?: boolean, weights?: Record<string, number> }} params
 *   wordCount: words of the letter body (salutation and closing excluded)
 * @returns {{ score: number, maxScore: number, errorCount: number, wordCount: number, percentage: number,
 *   band: 'excellent'|'good'|'satisfactory'|'needs_practice'|'unreadable',
 *   byCategory: Array<{ category: string, count: number, weight: number }> }}
 */
export function calculateLinguisticAccuracy({ grammarErrors = [], wordCount = 0, isGibberish = false, weights = DEFAULT_WEIGHTS } = {}) {
  if (isGibberish || wordCount === 0) {
    return buildResult({ score: 0, errorCount: 0, wordCount, band: 'unreadable' });
  }

  const errors = dedupeGrammarErrors(Array.isArray(grammarErrors) ? grammarErrors : []);
  const rawPenalty = errors.reduce((sum, err) => sum + resolveErrorWeight(err, weights), 0);
  const penalty = rawPenalty * (REFERENCE_WORD_COUNT / Math.max(wordCount, REFERENCE_WORD_COUNT));
  const score = Number(Math.max(0, MAX_SCORE - penalty).toFixed(1));
  return buildResult({ score, errorCount: errors.length, wordCount, byCategory: summarizeByCategory(errors, weights) });
}
