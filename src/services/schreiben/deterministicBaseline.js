/**
 * Deterministic core of the Schreiben evaluation (Stages 0-2 baseline, zero LLM).
 * Shared by the rules-only path (evaluateTeil2Essay) and the
 * micro-pipeline so both compute identical baseline scores for the same text.
 */
import { analyzeSalutation } from './salutationAnalyzer.js';
import { analyzeClosing } from './closingAnalyzer.js';
import { analyzeLeitpunkte } from './leitpunkteAnalyzer.js';
import { analyzeGermanQuality } from './germanQualityAnalyzer.js';
import { segmentUserEssay } from './schreibenTextSegmenter.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { mergeCandidateGrammarErrors } from './linguistic/grammarErrorDeduper.js';

export function resolveLeitpunktCriteria(question = {}) {
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});

  if (Array.isArray(options.rubric?.leitpunkte_criteria)) {
    return options.rubric.leitpunkte_criteria;
  }

  return (options.leitpunkte || []).map((lp, index) => ({
    id: `lp${index + 1}`,
    label: lp,
    requiredMatches: 1
  }));
}

export function countWords(text = '') {
  return ((text || '').match(/[\p{L}\p{N}]+/gu) || []).length;
}

function extractBodySentences(rawText = '', salutation = {}, closing = {}) {
  let body = rawText;
  if (salutation.text) body = body.replace(salutation.text, '').trim();
  if (closing.text) body = body.replace(closing.text, '').trim();
  if (closing.senderName) body = body.replace(closing.senderName, '').trim();
  return splitGermanSentences(body);
}

/** @param {{ policy: object, lexicon: object, grammar: object }} levelContext - resolveLevelContext(question.level) */
export function runDeterministicBaseline(text = '', criteria = [], levelContext = {}) {
  const trimmed = (text || '').trim();
  const salutation = analyzeSalutation(trimmed, { isFormal: true, grammar: levelContext.grammar });
  const closing = analyzeClosing(trimmed, { isFormal: true });
  const segments = segmentUserEssay(trimmed, criteria, levelContext);
  const bodySentences = extractBodySentences(trimmed, salutation, closing);
  const leitpunkte = analyzeLeitpunkte(trimmed, criteria, segments, levelContext);
  const rawGrammarErrors = levelContext.grammar.checkLetter(trimmed);
  const grammarErrors = mergeCandidateGrammarErrors(rawGrammarErrors, leitpunkte.semanticErrors || []);
  const quality = analyzeGermanQuality(trimmed, 30);

  return {
    salutation,
    closing,
    segments,
    bodySentences,
    leitpunkte,
    grammarErrors,
    wordCount: countWords(trimmed),
    isGibberish: quality.isGibberish,
    quality
  };
}

export function toCriteriaBreakdown({
  salutationScore = 0,
  leitpunkteItems = [],
  closingScore = 0,
  salutation = null,
  closing = null
}) {
  return {
    anrede: salutationScore ?? 0,
    lp1: leitpunkteItems[0]?.score ?? 0,
    lp2: leitpunkteItems[1]?.score ?? 0,
    lp3: leitpunkteItems[2]?.score ?? 0,
    gruss: closingScore ?? 0,
    items: leitpunkteItems,
    diagnostic: {
      anrede: salutation,
      gruss: closing,
      items: leitpunkteItems
    }
  };
}
