/**
 * Micro-task Schreiben evaluation pipeline (Stages 0-4).
 * Enforces single-responsibility micro-tasks with small LLM guardrails:
 * Stage 0: Preprocessing & segmentation (Zero LLM)
 * Stage 1: Anrede & Gruß closed regex (Zero LLM)
 * Stage 2: Leitpunkte keyword/stem + single-LP arbitration (Enum coverage)
 * Stage 3: Sentence-by-sentence grammar checking with strict substring validation
 * Stage 4: Feedback summary verbalization from locked facts
 */
import {
  resolveLeitpunktCriteria,
  runDeterministicBaseline,
  toCriteriaBreakdown
} from './deterministicBaseline.js';
import { mergeCandidateGrammarErrors } from './linguistic/sentenceGrammarFilter.js';
import { arbitrateSingleLeitpunkt } from './analyzers/leitpunktArbitrator.js';
import { checkSentenceGrammarMicro } from './analyzers/sentenceGrammarMicroChecker.js';
import { generateFeedbackSummary } from './analyzers/feedbackVerbalizer.js';
import { computeTelcFinalScore } from './scoring/telcScoreCalculator.js';

async function arbitrateAllLeitpunkte(baselineItems = [], segments = null, llmCaller = null) {
  const lpSegments = segments?.leitpunkte || [];
  const diffSummary = [];
  const resolvedItems = [];

  for (let i = 0; i < baselineItems.length; i++) {
    const item = baselineItems[i];
    const candidate = lpSegments[i]?.userSentence || '';
    const taskPoint = item.label || `Punkt ${i + 1}`;

    const { score, coverage, arbitrated } = await arbitrateSingleLeitpunkt({
      taskPoint,
      candidateSentences: candidate,
      baselineScore: item.score,
      llmCaller
    });

    resolvedItems.push({ ...item, score, coverage });
    if (arbitrated) {
      diffSummary.push({
        id: `lp${i + 1}`,
        change: score > item.score ? 'rescued' : (score < item.score ? 'adjusted' : 'protected'),
        from: item.score,
        to: score
      });
    }
  }

  return { resolvedItems, diffSummary };
}

async function collectSentenceGrammarErrors(sentences = [], llmCaller = null) {
  if (!llmCaller || sentences.length === 0) return [];
  const candidateLists = await Promise.all(
    sentences.map(sentence => checkSentenceGrammarMicro({ sentence, llmCaller }))
  );
  return candidateLists.flat();
}

export async function runSchreibenMicroPipeline({
  userText = '',
  question = {},
  llmCaller = null,
  onProgress = null
}) {
  const text = (userText || '').trim();
  const criteria = resolveLeitpunktCriteria(question);

  // Stages 0-2 baseline: deterministic segmentation, Anrede/Gruß and Leitpunkte scoring
  onProgress?.('Segmentierung und Vorbereitung...');
  const baseline = runDeterministicBaseline(text, criteria);
  const {
    salutation,
    closing,
    segments,
    bodySentences,
    leitpunkte,
    grammarErrors,
    wordCount,
    isGibberish
  } = baseline;

  // Stage 2 (LLM gray zone): single-LEITPUNKT arbitration with enum coverage
  onProgress?.('Prüfung der Leitpunkte...');
  const { resolvedItems, diffSummary } = await arbitrateAllLeitpunkte(
    leitpunkte.items,
    segments,
    llmCaller
  );

  // Stage 3: deterministic grammar baseline + LLM substring-validated candidates
  onProgress?.('Grammatikprüfung...');
  const llmGrammarCandidates = await collectSentenceGrammarErrors(bodySentences, llmCaller);
  const finalGrammarErrors = mergeCandidateGrammarErrors(grammarErrors, llmGrammarCandidates);

  const lpTotalScore = resolvedItems.reduce((sum, it) => sum + (it.score ?? 0), 0);
  const { finalPoints, grammarPenalty } = computeTelcFinalScore({
    salutationScore: salutation.score,
    leitpunkteScore: lpTotalScore,
    closingScore: closing.score,
    wordCount,
    isGibberish,
    grammarErrorsCount: finalGrammarErrors.length
  });

  // Stage 4: feedback verbalizer from locked facts
  onProgress?.('Erstelle Prüfer-Feedback...');
  const feedbackSummary = await generateFeedbackSummary({
    facts: {
      salutationScore: salutation.score,
      lpResults: resolvedItems,
      closingScore: closing.score,
      grammarErrors: finalGrammarErrors
    },
    llmCaller
  });

  return {
    criteria_breakdown: toCriteriaBreakdown({
      salutationScore: salutation.score,
      leitpunkteItems: resolvedItems,
      closingScore: closing.score,
      salutation,
      closing
    }),
    breakdown: {
      anrede: salutation.score,
      leitpunkte: lpTotalScore,
      gruss: closing.score,
      grammar_penalty: grammarPenalty,
      items: resolvedItems
    },
    grammar_penalty: grammarPenalty,
    grammar_errors: finalGrammarErrors,
    diff_summary: diffSummary,
    arbitration_applied: diffSummary.length > 0,
    feedback_summary: feedbackSummary,
    final_points: finalPoints,
    user_segments: segments,
    word_count: wordCount
  };
}
