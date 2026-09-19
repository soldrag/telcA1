/**
 * Evaluates student essay against exam Leitpunkte using stem matching & semantic frames.
 * Grounded to assigned sentence segments to prevent global stem leakage.
 * Awards 0, 1, or 2 points per Leitpunkt.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { stemGermanWord } from './linguistic/germanStemmer.js';
import { tagTokens } from './linguistic/a1LexiconService.js';
import { validateSentenceFrame } from './linguistic/semanticFrameValidator.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { detectSemanticInversion } from './linguistic/semanticPolarityValidator.js';
import { resolveLpDiagnosticCode } from './feedback/feedbackContracts.js';

function extractStems(str = '') {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(w => stemGermanWord(w))
    .filter(s => s && s.length >= 3);
}

function evaluateStemMatches(textStems = [], criterion = {}) {
  const rawKeywords = criterion.keywords || [];
  const critStems = rawKeywords.map(k => stemGermanWord(k));

  let matchedCount = 0;
  for (const cStem of critStems) {
    if (textStems.includes(cStem)) {
      matchedCount += 1;
    }
  }

  const req = criterion.requiredMatches !== undefined ? criterion.requiredMatches : 2;
  const threshold = Math.min(req, Math.max(1, critStems.length));

  if (matchedCount >= threshold) {
    return { score: 2, matched: true, detail: 'Inhaltspunkt ausreichend bearbeitet' };
  }
  if (matchedCount > 0) {
    return { score: 1, matched: true, detail: 'Inhaltspunkt nur teilweise erwähnt' };
  }
  return { score: 0, matched: false, detail: 'Inhaltspunkt nicht gefunden' };
}

function evaluateFrameConstraints(targetSentence = '', criterion = {}) {
  const sentences = splitGermanSentences(targetSentence);
  const evalSentences = sentences.length > 0 ? sentences : [targetSentence];

  const allErrors = [];
  let maxPenalty = 0;

  for (const s of evalSentences) {
    const words = s.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
    const tagged = tagTokens(words);
    const res = validateSentenceFrame({
      taggedTokens: tagged,
      conversiveRules: criterion.conversive_rules || [],
      semanticSlots: criterion.semantic_slots || []
    });
    if (!res.isValid) {
      allErrors.push(...res.errors);
      maxPenalty = Math.max(maxPenalty, res.maxPenalty);
    }
  }

  return { isValid: allErrors.length === 0, errors: allErrors, maxPenalty };
}

function evaluateCriterionWithGrounding(targetSentence = '', fullText = '', criterion = {}) {
  const evalText = targetSentence || fullText;
  if (!evalText) {
    return { score: 0, matched: false, detail: 'Inhaltspunkt nicht gefunden', diagnosticCode: 'LP_MISSING', frameErrors: [] };
  }

  const inversion = detectSemanticInversion(evalText, criterion);
  if (inversion.isInverted) {
    const diagnosticCode = resolveLpDiagnosticCode(0, inversion, true);
    return { score: 0, matched: false, detail: 'Inhaltspunkt invertiert oder abgelehnt', diagnosticCode, frameErrors: [] };
  }

  const stems = extractStems(evalText);
  const stemResult = evaluateStemMatches(stems, criterion);

  const frameResult = evaluateFrameConstraints(evalText, criterion);
  let finalScore = stemResult.score;
  let detail = stemResult.detail;

  if (!frameResult.isValid) {
    if (frameResult.maxPenalty >= 2) {
      finalScore = 0;
    } else if (frameResult.maxPenalty === 1) {
      finalScore = Math.min(finalScore, 1);
    }
    detail = frameResult.errors.map(e => e.explanation).join(' ');
  }

  const diagnosticCode = resolveLpDiagnosticCode(finalScore, inversion, frameResult.isValid);
  return {
    score: finalScore,
    matched: finalScore > 0,
    detail,
    diagnosticCode,
    frameErrors: frameResult.errors
  };
}

export function analyzeLeitpunkte(text = '', criteria = [], segments = null) {
  let totalScore = 0;
  const semanticErrors = [];

  const results = criteria.map((criterion, index) => {
    const assigned = segments?.leitpunkte?.[index]?.userSentence;
    const targetSentence = (assigned && assigned !== 'Kein Satz im Text gefunden') ? assigned : '';

    const evalRes = evaluateCriterionWithGrounding(targetSentence, segments ? '' : text, criterion);
    totalScore += evalRes.score;

    if (evalRes.frameErrors?.length > 0) {
      semanticErrors.push(...evalRes.frameErrors);
    }

    return {
      index: index + 1,
      id: criterion.id || `lp${index + 1}`,
      label: criterion.label || `Leitpunkt ${index + 1}`,
      score: evalRes.score,
      maxScore: 2,
      matched: evalRes.matched,
      detail: evalRes.detail,
      diagnosticCode: evalRes.diagnosticCode,
      matchedSentence: targetSentence
    };
  });

  return {
    score: totalScore,
    maxScore: criteria.length * 2,
    items: results,
    semanticErrors
  };
}
