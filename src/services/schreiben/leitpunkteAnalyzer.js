/**
 * Evaluates student essay against exam Leitpunkte using stem matching & semantic frames.
 * Grounded to assigned sentence segments to prevent global stem leakage.
 * Awards 0, 1, or 2 points per Leitpunkt.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { countMatchedConcepts } from './linguistic/keywordConcepts.js';
import { keywordThreshold } from './grading/rivalEvidence.js';
import { validateSentenceFrame } from './linguistic/semanticFrameValidator.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { detectSemanticInversion } from './linguistic/semanticPolarityValidator.js';
import { resolveLpDiagnosticCode } from './feedback/feedbackContracts.js';
import { hasTemporalExpression } from './grading/temporalRangeDetector.js';
import { evaluateCompoundCriterionBaseline } from './grading/compoundBaselineEvaluator.js';
import { hasTemporalEvidence } from './linguistic/criterionIntents.js';
import { requireLevelPort } from './grading/levelPorts.js';

function evaluateKeywordConcepts(text = '', criterion = {}, lexicon) {
  const keywords = criterion.keywords || [];
  let matchedCount = countMatchedConcepts(keywords, text.split(/\s+/), lexicon);
  if (hasTemporalEvidence(criterion) && text && hasTemporalExpression(text)) matchedCount += 1;

  if (matchedCount >= keywordThreshold(criterion, lexicon)) {
    return { score: 2, matched: true, detail: 'Inhaltspunkt ausreichend bearbeitet' };
  }
  if (matchedCount > 0) {
    return { score: 1, matched: true, detail: 'Inhaltspunkt nur teilweise erwähnt' };
  }
  return { score: 0, matched: false, detail: 'Inhaltspunkt nicht gefunden' };
}

function evaluateFrameConstraints(targetSentence = '', criterion = {}, lexicon) {
  const sentences = splitGermanSentences(targetSentence);
  const evalSentences = sentences.length > 0 ? sentences : [targetSentence];

  const allErrors = [];
  let maxPenalty = 0;

  for (const s of evalSentences) {
    const words = s.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
    const tagged = lexicon.tag(words);
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

function evaluateCriterionWithGrounding(targetSentence = '', fullText = '', { criterion = {}, lexicon, policy }) {
  const evalText = targetSentence || fullText;
  if (!evalText) {
    return { score: 0, matched: false, detail: 'Inhaltspunkt nicht gefunden', diagnosticCode: 'LP_MISSING', frameErrors: [] };
  }

  const inversion = detectSemanticInversion(evalText, criterion, { lexicon });
  if (inversion.isInverted) {
    const diagnosticCode = resolveLpDiagnosticCode(0, inversion, true);
    return { score: 0, matched: false, detail: 'Inhaltspunkt invertiert oder abgelehnt', diagnosticCode, frameErrors: [] };
  }

  const stemResult = evaluateKeywordConcepts(evalText, criterion, lexicon);

  const frameResult = evaluateFrameConstraints(evalText, criterion, lexicon);
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

  let rankerDetails = null;
  const compoundEval = evaluateCompoundCriterionBaseline(criterion, evalText, { policy });
  if (compoundEval) {
    finalScore = Math.min(finalScore, compoundEval.score);
    rankerDetails = compoundEval.rankerDetails;
    if (compoundEval.score < 2 && compoundEval.missingAspects?.length > 0) {
      detail = `Teilweise bearbeitet: Aspekt fehlt (${compoundEval.missingAspects.join(', ')})`;
    }
  }

  const diagnosticCode = resolveLpDiagnosticCode(finalScore, inversion, frameResult.isValid);
  return {
    score: finalScore,
    matched: finalScore > 0,
    detail,
    diagnosticCode,
    frameErrors: frameResult.errors,
    rankerDetails,
  };
}

/** @param {{ lexicon: object, policy: object }} levelContext - the level's lexicon port and ranker policy */
export function analyzeLeitpunkte(text = '', criteria = [], segments = null, { lexicon, policy } = {}) {
  requireLevelPort(lexicon, 'analyzeLeitpunkte: lexicon');
  requireLevelPort(policy, 'analyzeLeitpunkte: policy');
  let totalScore = 0;
  const semanticErrors = [];

  const results = criteria.map((criterion, index) => {
    const assigned = segments?.leitpunkte?.[index]?.userSentence;
    const targetSentence = (assigned && assigned !== 'Kein Satz im Text gefunden') ? assigned : '';

    const evalRes = evaluateCriterionWithGrounding(targetSentence, segments ? '' : text, { criterion, lexicon, policy });
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
      matchedSentence: targetSentence,
      rankerDetails: evalRes.rankerDetails || null,
    };
  });

  return {
    score: totalScore,
    maxScore: criteria.length * 2,
    items: results,
    semanticErrors
  };
}
