/**
 * Stage scorers and collectors for Schreiben grading pipeline.
 * Extracts sentence embeddings scoring and candidate error gathering from the main pipeline orchestrator.
 */

import { evaluateCriterionKeywords } from './stage2Leitpunkte.js';
import { arbitrateLeitpunkt, shouldArbitrateLeitpunkt } from './leitpunktArbitration.js';
import { formatCriterionQuery } from './rankerFallbackScorer.js';
import { SIMILARITY_T2, SIMILARITY_T1 } from './types.js';
import { cosineSimilarity } from './vectorMath.js';
import { filterCandidateErrors } from './stage3Grammar.js';
import { assessEvidenceSentences } from './criterionPolarityGate.js';
import { PROVIDER_IDS } from '../../ai/types.js';
import { computeEmbedding, getCachedLpEmbedding } from '../../embeddings/embeddingService.js';
import { createRankerEmbedder, buildSentenceVectorMap } from '../../embeddings/rankerEmbedder.js';
import { mergeCandidateGrammarErrors } from '../linguistic/sentenceGrammarFilter.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';
import { extractAffirmativeText } from '../linguistic/semanticPolarityValidator.js';
import { resolveLpDiagnosticCode } from '../feedback/feedbackContracts.js';
import { requireLevelPort } from './levelPorts.js';
import { evaluateCompoundCriterionBaseline, hasDeclaredEvidenceSupport } from './compoundBaselineEvaluator.js';
import { hasAspectConceptEvidence } from './aspectConceptEvidence.js';

async function computeSentenceVectors(bodySentences, customExtractor) {
  if (bodySentences.length === 0 || customExtractor === false) return [];
  try {
    return await Promise.all(
      bodySentences.map((s) => computeEmbedding(s, false, customExtractor).catch(() => null))
    );
  } catch (err) {
    console.warn('[PipelineStageScorers] Embedding computation failed, falling back to keywords:', err?.message || err);
    return [];
  }
}

async function gatherCriterionEvidence({ crit, critIdx, bodySentences, sentenceVectors, customExtractor, userSegments, policy }) {
  const kw = evaluateCriterionKeywords(bodySentences, crit, { lexicon: policy.lexicon });
  let bestSim = 0;
  // A sentence stating an aspect through the level's concept domains ("billig" → Preis) is evidence
  // like a rubric keyword; the compound evaluator still caps the criterion by its weakest aspect.
  const conceptSentences = bodySentences.filter((s) => !kw.relevantSentences.includes(s)
    && hasAspectConceptEvidence(crit, extractAffirmativeText(s, crit, { lexicon: policy.lexicon }), { policy }));
  const relSentences = [...kw.relevantSentences, ...conceptSentences];

  const assigned = userSegments?.leitpunkte?.[critIdx]?.userSentence;
  const segSentences = userSegments?.leitpunkte?.[critIdx]?.sentences
    || (assigned && assigned !== 'Kein Satz im Text gefunden' ? splitGermanSentences(assigned) : []);
  for (const s of [...segSentences].reverse()) {
    const idx = relSentences.indexOf(s);
    if (idx > -1) relSentences.splice(idx, 1);
    relSentences.unshift(s);
  }

  if (sentenceVectors.length > 0) {
    try {
      const lpQuery = formatCriterionQuery(crit.label || crit.id, crit.keywords);
      const lpVec = await getCachedLpEmbedding(crit.id, lpQuery, customExtractor);
      bodySentences.forEach((s, i) => {
        const sVec = sentenceVectors[i];
        const sim = sVec && lpVec ? cosineSimilarity(lpVec, sVec) : 0;
        if (sim > bestSim) bestSim = sim;
        if (sim >= 0.35 && !relSentences.includes(s)) relSentences.push(s);
      });
    } catch (err) {
      console.warn('[PipelineStageScorers] LP vector matching failed:', err?.message || err);
    }
  }

  const kwScore = Math.max(kw.score, conceptSentences.length > 0 ? 1 : 0);
  const kwSim = kwScore === 2 ? 0.75 : (kwScore === 1 ? 0.50 : 0.20);
  const effectiveSim = Math.max(bestSim, kwSim);
  return { relSentences, effectiveSim, keywordSentences: [...kw.relevantSentences, ...conceptSentences] };
}

function calculateBaseScore(effectiveSim, framePenalty) {
  if (framePenalty >= 2) return 0;
  const rawScore = effectiveSim >= SIMILARITY_T2 ? 2 : (effectiveSim >= SIMILARITY_T1 ? 1 : 0);
  return framePenalty === 1 ? Math.min(rawScore, 1) : rawScore;
}

// A compound criterion is capped by its weakest aspect (A ∧ B: all aspects needed for full);
// a criterion with a declared evidence kind needs that evidence or its keywords somewhere in the body.
function computeCriterionBaseScore(crit, { effectiveSim, frameCheck, relSentences, bodySentences, policy }) {
  if (hasDeclaredEvidenceSupport(crit, bodySentences.join(' '), { policy }) === false) return { baseScore: 0, compoundEval: null, evidenceMissing: true };
  const baseScore = calculateBaseScore(effectiveSim, frameCheck.penalty);
  const affirmative = relSentences.map((s) => extractAffirmativeText(s, crit, { lexicon: policy.lexicon })).join(' ');
  const compoundEval = evaluateCompoundCriterionBaseline(crit, affirmative, { policy });
  if (!compoundEval) return { baseScore, compoundEval };
  return { baseScore: Math.min(baseScore, compoundEval.score), compoundEval };
}

async function scoreCriterionItem(params) {
  const { crit, provider, bodySentences, rankerEmbedder, criteria = [], policy } = params;
  const lpText = crit.label || crit.id;
  const { relSentences, effectiveSim, keywordSentences } = await gatherCriterionEvidence(params);
  const hasAffirmativeEvidence = keywordSentences.length > 0;
  const frameCheck = assessEvidenceSentences({ sentences: relSentences, criterion: crit, hasAffirmativeEvidence, lexicon: policy.lexicon });
  const { baseScore, compoundEval, evidenceMissing = false } = computeCriterionBaseScore(crit, { effectiveSim, frameCheck, relSentences, bodySentences, policy });

  let finalScore = baseScore;
  let arbitrated = false;
  let rankerDetails = compoundEval?.rankerDetails || null;
  let arbitration = null;

  const arbitrationGate = { provider, effectiveSim, framePenalty: frameCheck.penalty, baselineScore: baseScore, isCompound: Boolean(compoundEval) };
  // Missing declared evidence is settled by the detector: no provider re-reads it into the text.
  if (!evidenceMissing && shouldArbitrateLeitpunkt(arbitrationGate)) {
    // The arbiter reads what the letter affirms: a refused clause ("ich kann nicht kommen") is not a Zusage.
    const candidates = relSentences.length > 0 ? relSentences : (bodySentences || []);
    const sentences = candidates.map((s) => extractAffirmativeText(s, crit, { lexicon: policy.lexicon })).filter(Boolean);
    const arb = await arbitrateLeitpunkt({
      criterion: crit, sentences, baselineScore: baseScore, provider,
      embedder: rankerEmbedder, rivalCriteria: criteria.filter((c) => c !== crit), policy,
    });
    finalScore = arb.score;
    arbitrated = arb.arbitrated;
    rankerDetails = arb.rankerDetails || rankerDetails;
    arbitration = { rankerScore: arb.rankerScore, isProtected: Boolean(arb.isProtected) };
  }

  const diagnosticCode = resolveLpDiagnosticCode(finalScore, frameCheck.inversionInfo, frameCheck.penalty === 0);

  return {
    id: crit.id,
    label: lpText,
    score: finalScore,
    baselineScore: baseScore,
    arbitrated,
    rankerScore: arbitration?.rankerScore ?? null,
    isProtected: arbitration?.isProtected ?? false,
    diagnosticCode,
    matchedSentence: rankerDetails?.matchedSentence || relSentences[0] || '',
    keywordSentences,
    frameErrors: frameCheck.frameErrors,
    rankerDetails,
  };
}

/** policy: the level's ranker policy (lexicon port, coverage thresholds). */
export async function scorePipelineLeitpunkte({ criteria, bodySentences, provider, customExtractor, userSegments = null, policy }) {
  requireLevelPort(policy, 'scorePipelineLeitpunkte: policy');
  const sentenceVectors = await computeSentenceVectors(bodySentences, customExtractor);
  const rankerEmbedder = sentenceVectors.some(Boolean)
    ? createRankerEmbedder({ customExtractor, sentenceVectors: buildSentenceVectorMap(bodySentences, sentenceVectors) })
    : null;
  const items = [];
  const semanticErrors = [];

  for (let idx = 0; idx < criteria.length; idx++) {
    const scoredItem = await scoreCriterionItem({
      crit: criteria[idx], critIdx: idx, bodySentences, sentenceVectors, customExtractor, provider, userSegments, rankerEmbedder, criteria, policy
    });
    items.push(scoredItem);
    if (scoredItem.frameErrors?.length > 0) semanticErrors.push(...scoredItem.frameErrors);
  }

  const totalScore = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  return { items, totalScore, semanticErrors };
}

/** grammar: the level's grammar checker (resolveLevelContext) */
export async function collectPipelineGrammarErrors({ rawText, bodySentences, provider, semanticErrors = [], baselineErrors = [], grammar }) {
  const ruleErrors = requireLevelPort(grammar, 'collectPipelineGrammarErrors: grammar').checkLetter(rawText) || [];
  const baseMerged = mergeCandidateGrammarErrors(baselineErrors, ruleErrors);
  const initial = mergeCandidateGrammarErrors(baseMerged, semanticErrors);
  if (!provider || provider.id === PROVIDER_IDS.NONE) return initial;

  const candidateList = [];
  for (const s of bodySentences.slice(0, 5)) {
    try {
      const rawCandidates = await provider.proposeGrammarCandidates(s);
      candidateList.push(...filterCandidateErrors(s, rawCandidates, 2));
    } catch (err) {
      console.warn('[PipelineStageScorers] Candidate grammar check skipped for sentence:', err?.message || err);
    }
  }

  return mergeCandidateGrammarErrors(initial, candidateList);
}
