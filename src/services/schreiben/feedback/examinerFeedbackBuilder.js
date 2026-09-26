/**
 * Builds a language-neutral examiner feedback descriptor from locked grading facts.
 * Output holds only codes and raw German fragments; examinerFeedbackRenderer turns it into RU/EN text,
 * so the UI can switch language without re-grading and stored attempts stay renderable.
 */

import { DIAGNOSTIC_CODES, EXAMINER_CODES } from './feedbackContracts.js';
import { selectGrammarHighlights } from './grammarHighlightSelector.js';

export const EXAMINER_FEEDBACK_VERSION = 1;

const LP_STATUS_BY_CODE = Object.freeze({
  [DIAGNOSTIC_CODES.LP_FULFILLED]: 'positive',
  [DIAGNOSTIC_CODES.LP_PARTIAL]: 'warning',
  [DIAGNOSTIC_CODES.LP_FRAME_VIOLATION]: 'warning',
  [EXAMINER_CODES.LP_MISSING_ASPECT]: 'warning',
  [DIAGNOSTIC_CODES.LP_INVERTED_DEFECT]: 'error',
  [DIAGNOSTIC_CODES.LP_INVERTED_REQUEST]: 'error',
  [DIAGNOSTIC_CODES.LP_INVERTED_CANCEL]: 'error',
  [DIAGNOSTIC_CODES.LP_INVERTED_GENERAL]: 'error',
});

const FRAMING_STATUS_BY_CODE = Object.freeze({
  [DIAGNOSTIC_CODES.ANREDE_PERFECT]: 'positive',
  [DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW]: 'warning',
  [DIAGNOSTIC_CODES.GRUSS_PERFECT]: 'positive',
  [DIAGNOSTIC_CODES.GRUSS_INCOMPLETE]: 'warning',
});

const isInverted = (item) => String(item.diagnosticCode || '').startsWith('LP_INVERTED');
const entry = (code, params = {}) => ({ code, params });

function resolveLeitpunktCode(item) {
  const hasMissingAspect = item.missingAspects?.length > 0 && item.score < 2;
  return hasMissingAspect && !isInverted(item) ? EXAMINER_CODES.LP_MISSING_ASPECT : item.diagnosticCode;
}

function describeLeitpunkt(item) {
  const code = resolveLeitpunktCode(item);
  const status = LP_STATUS_BY_CODE[code];
  const needsQuote = code !== EXAMINER_CODES.LP_MISSING_ASPECT;
  if (!status || (needsQuote && !item.matchedSentence)) return null;
  const params = { criterion: item.label, quote: item.matchedSentence || '', missingAspect: (item.missingAspects || []).join(', ') };
  return { category: 'leitpunkt', status, ...entry(code, params) };
}

function describeFramingPart(category, part = {}) {
  const status = FRAMING_STATUS_BY_CODE[part.code];
  if (!status || !part.text) return null;
  return { category, status, ...entry(part.code, { quote: part.text }) };
}

function selectOverallCode(facts, verdict) {
  if (facts.isGibberish || !facts.wordCount) return EXAMINER_CODES.OVERALL_INSUFFICIENT;
  if (facts.items.length > 0 && facts.items.every((it) => !it.score)) return EXAMINER_CODES.OVERALL_THEME_MISSED;
  if (facts.finalPoints >= verdict.excellent) return EXAMINER_CODES.OVERALL_EXCELLENT;
  return facts.finalPoints >= verdict.good ? EXAMINER_CODES.OVERALL_GOOD : EXAMINER_CODES.OVERALL_PARTIAL;
}

function summarizeContent(items) {
  const inverted = items.find(isInverted);
  if (inverted) return entry(EXAMINER_CODES.SUMMARY_LP_INVERTED, { criterion: inverted.label });
  const missing = items.filter((it) => !it.score);
  if (missing.length > 1) return entry(EXAMINER_CODES.SUMMARY_LP_MISSING_MANY, { count: missing.length });
  if (missing.length === 1) return entry(EXAMINER_CODES.SUMMARY_LP_MISSING, { criterion: missing[0].label });
  const partial = items.find((it) => it.score < 2);
  if (partial) return entry(EXAMINER_CODES.SUMMARY_LP_PARTIAL, { criterion: partial.label });
  return entry(EXAMINER_CODES.SUMMARY_LP_ALL_COVERED);
}

function summarizeFraming({ anrede = {}, gruss = {} }) {
  const noAnrede = anrede.code === DIAGNOSTIC_CODES.ANREDE_MISSING;
  const noGruss = gruss.code === DIAGNOSTIC_CODES.GRUSS_MISSING;
  if (noAnrede && noGruss) return entry(EXAMINER_CODES.SUMMARY_FRAMING_BOTH);
  if (noAnrede) return entry(EXAMINER_CODES.SUMMARY_FRAMING_ANREDE);
  if (noGruss) return entry(EXAMINER_CODES.SUMMARY_FRAMING_GRUSS);
  const flawed = anrede.code === DIAGNOSTIC_CODES.ANREDE_MINOR_FLAW || gruss.code === DIAGNOSTIC_CODES.GRUSS_INCOMPLETE;
  return flawed ? entry(EXAMINER_CODES.SUMMARY_FRAMING_FLAWED) : null;
}

function summarizeGrammar(errors) {
  return errors.length === 0
    ? entry(EXAMINER_CODES.GRAMMAR_CLEAN)
    : entry(EXAMINER_CODES.SUMMARY_GRAMMAR_ERRORS, { count: errors.length });
}

function composeSummary(facts, selection) {
  const overall = entry(selectOverallCode(facts, selection.verdict), { points: facts.finalPoints, maxPoints: facts.maxPoints });
  if (overall.code === EXAMINER_CODES.OVERALL_INSUFFICIENT) return [overall];
  const parts = [overall, summarizeContent(facts.items), summarizeFraming(facts), summarizeGrammar(facts.grammarErrors)];
  return parts.filter(Boolean).slice(0, selection.maxSummarySentences);
}

function composeBullets(facts, selection) {
  const grammar = selectGrammarHighlights(facts.grammarErrors, selection.grammarHighlights)
    .map((g) => ({ category: 'grammar', status: 'warning', ...g }));
  return [
    describeFramingPart('anrede', facts.anrede),
    ...facts.items.map(describeLeitpunkt),
    describeFramingPart('gruss', facts.gruss),
    ...grammar,
  ].filter(Boolean);
}

/**
 * @param {object} facts - See buildExaminerFeedbackFacts in grading/pipelineFeedback.js
 * @param {{ grammarHighlights: number, maxSummarySentences: number, verdict: { excellent: number, good: number } }} selection
 * @returns {{ version: number, summary: Array<{code: string, params: object}>, bullets: Array<object> }}
 */
export function buildExaminerFeedbackDescriptor(facts = {}, selection) {
  const safeFacts = { items: [], grammarErrors: [], ...facts };
  return {
    version: EXAMINER_FEEDBACK_VERSION,
    summary: composeSummary(safeFacts, selection),
    bullets: composeBullets(safeFacts, selection),
  };
}
