/**
 * Stage 3: Grammar Checking (Qwen3 Proposes, Rules Filter).
 * Micro-task executes one call per sentence with few-shots.
 * Mandatory 4-step candidate filtering ensures zero hallucinations reach the UI.
 */

import { SENTENCE_GRAMMAR_SCHEMA } from './types.js';
import { executeQwen3Prompt } from './qwen3Service.js';
import { calculateLevenshtein, normalizeGermanText } from '../schreibenFuzzyMatcher.js';
import { checkGermanA1Grammar } from '../germanGrammarChecker.js';

export function buildGrammarPrompt(sentence = '') {
  return `You are a German grammar checker for level A1. Answer strictly in JSON.

Examples:
Sentence: "Ich möchte ein Deutschkurs machen."
JSON: {"errors":[{"original":"ein Deutschkurs","correction":"einen Deutschkurs","explanation":"Akkusativ maskulin"}]}

Sentence: "Ich habe vier Wochen Zeit."
JSON: {"errors":[]}

Sentence: "${sentence}"

List grammar errors in this sentence.
"original" must be an EXACT substring of the sentence.
If there are no errors, return an empty list: {"errors": []}.
Schema: {"errors": [{"original": "...", "correction": "...", "explanation": "..."}]}`;
}

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

export async function checkSentenceGrammar(sentence = '', qwenEngine = null) {
  const trimmed = (sentence || '').trim();
  if (!trimmed || !qwenEngine) return [];

  const prompt = buildGrammarPrompt(trimmed);
  try {
    const result = await executeQwen3Prompt({
      prompt,
      schema: SENTENCE_GRAMMAR_SCHEMA,
      maxTokens: 128,
      engine: qwenEngine
    });
    const candidates = Array.isArray(result?.errors) ? result.errors : [];
    return filterCandidateErrors(trimmed, candidates, 3);
  } catch (err) {
    console.warn('[Stage3Grammar] Skipping sentence on LLM error/timeout:', trimmed, err?.message || err);
    return [];
  }
}

export function computeGrammarPenalty(errorCount = 0) {
  const n = Number(errorCount) || 0;
  if (n >= 8) return 4;
  if (n >= 6) return 3;
  if (n >= 3) return 2;
  return n >= 1 ? 1 : 0;
}

export async function runStage3Grammar({
  fullText = '',
  bodySentences = [],
  qwenEngine = null
}) {
  // 1. Algorithmic baseline rules (zero LLM)
  const baselineErrors = checkGermanA1Grammar(fullText);

  // 2. Qwen3 micro-proposals (per sentence) with strict filter
  let candidateErrors = [];
  if (qwenEngine && bodySentences.length > 0) {
    const errorLists = await Promise.all(
      bodySentences.map(s => checkSentenceGrammar(s, qwenEngine))
    );
    candidateErrors = errorLists.flat();
  }

  // 3. Deduplicate and merge
  const seen = new Set(baselineErrors.map(e => e.original.toLowerCase().trim()));
  const mergedErrors = [...baselineErrors];

  for (const cand of candidateErrors) {
    const key = cand.original.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      mergedErrors.push(cand);
    }
  }

  const grammarPenalty = computeGrammarPenalty(mergedErrors.length);

  return {
    errors: mergedErrors,
    grammarPenalty,
    baselineErrorCount: baselineErrors.length,
    qwenCandidateCount: candidateErrors.length
  };
}
