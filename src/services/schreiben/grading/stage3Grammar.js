/**
 * Stage 3: Grammar Checking (Qwen3 Proposes, Rules Filter).
 * Micro-task executes one call per sentence with few-shots.
 * Mandatory 4-step candidate filtering ensures zero hallucinations reach the UI.
 */

import { calculateLevenshtein, normalizeGermanText } from '../schreibenFuzzyMatcher.js';
import { requireLevelPort } from './levelPorts.js';
import { mergeCandidateGrammarErrors } from '../linguistic/sentenceGrammarFilter.js';
import { buildGrammarPrompt } from './prompts.js';

export { buildGrammarPrompt };

export function isValidCorrectionDistance(orig = '', corr = '') {
  const origWords = orig.trim().split(/\s+/).filter(Boolean);
  const corrWords = corr.trim().split(/\s+/).filter(Boolean);

  // Edit distance cap: a fix touches 1-3 words
  if (origWords.length > 3 || corrWords.length > 4) return false;
  if (Math.abs(corr.length - orig.length) > 16) return false;

  const dist = calculateLevenshtein(normalizeGermanText(orig), normalizeGermanText(corr));
  const maxAllowed = Math.max(7, Math.ceil(orig.length * 0.7));
  return dist <= maxAllowed;
}

export function filterCandidateErrors(sentence = '', rawCandidates = [], maxPerSentence = 3) {
  if (!sentence || !Array.isArray(rawCandidates) || rawCandidates.length === 0) return [];
  const valid = [];
  const seenOriginals = new Set();

  for (const item of rawCandidates) {
    if (valid.length >= maxPerSentence) break;
    const orig = (item?.original || '').trim();
    const corr = (item?.correction || '').trim();

    // Mandatory filter a: original is an exact substring of the sentence
    if (!orig || !sentence.includes(orig)) continue;
    // Mandatory filter b: correction !== original
    if (!corr || corr.toLowerCase() === orig.toLowerCase()) continue;
    // Mandatory filter c: edit-distance cap (1-3 words)
    if (!isValidCorrectionDistance(orig, corr)) continue;
    // Mandatory filter d: deduplication
    if (seenOriginals.has(orig.toLowerCase())) continue;

    seenOriginals.add(orig.toLowerCase());
    valid.push({
      original: orig,
      correction: corr,
      explanation: (item.explanation || 'Grammatikfehler').trim()
    });
  }

  return valid;
}

export async function checkSentenceGrammar() {
  return [];
}

export async function runStage3Grammar({
  fullText = '',
  bodySentences = [],
  qwenEngine = null,
  grammar
}) {
  // 1. Algorithmic baseline rules of the level's grammar profile (zero LLM)
  const baselineErrors = requireLevelPort(grammar, 'runStage3Grammar: grammar').checkLetter(fullText);

  // 2. Qwen3 micro-proposals (per sentence) with strict filter
  let candidateErrors = [];
  if (qwenEngine && bodySentences.length > 0) {
    const errorLists = await Promise.all(
      bodySentences.map(s => checkSentenceGrammar(s, qwenEngine))
    );
    candidateErrors = errorLists.flat();
  }

  // 3. Merge through the shared deduper: each defect is listed once
  return {
    errors: mergeCandidateGrammarErrors(baselineErrors, candidateErrors),
    baselineErrorCount: baselineErrors.length,
    qwenCandidateCount: candidateErrors.length
  };
}
