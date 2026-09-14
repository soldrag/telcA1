/**
 * Unified Facade for Schreiben Teil 2 grading.
 * Completely isolates the UI from model details and orchestrates Stages 0-4.
 * Enforces graceful degradation to limited mode if WebGPU is absent or models fail.
 */

import { modelManager, isWebGPUSupported } from './modelManager.js';
import { runStage0Preprocessing } from './stage0Preprocessing.js';
import { runStage1Scoring } from './stage1SalutationClosing.js';
import { runStage2Leitpunkte, arbitrateGrayZone } from './stage2Leitpunkte.js';
import { runStage3Grammar } from './stage3Grammar.js';
import { runStage4Feedback } from './stage4Feedback.js';
import { resolveLeitpunktCriteria } from '../deterministicBaseline.js';
import { computeTelcFinalScore } from '../scoring/telcScoreCalculator.js';
import { analyzeGermanQuality } from '../germanQualityAnalyzer.js';
import { segmentUserEssay } from '../schreibenTextSegmenter.js';

function buildUserSegments(rawText, criteria, stage0) {
  const seg = segmentUserEssay(rawText, criteria);
  return {
    anrede: stage0.salutation.recognized ? stage0.salutation.text : (seg.anrede || ''),
    closing: stage0.closing.recognized ? stage0.closing.text : (seg.closing || ''),
    senderName: stage0.closing.senderName || seg.senderName || '',
    leitpunkte: seg.leitpunkte
  };
}

async function arbitrateGrayZoneItems(items = [], qwenEngine = null) {
  if (!qwenEngine || !Array.isArray(items)) return items;
  for (const item of items) {
    if (item.inGrayZone && !item.arbitrated && item.matchedSentences?.length > 0) {
      const arbRes = await arbitrateGrayZone({
        lpLabel: item.label,
        relevantSentences: item.matchedSentences.join(' '),
        baselineScore: item.baselineScore,
        qwenEngine
      });
      if (arbRes.arbitrated) {
        item.score = arbRes.score;
        item.arbitrated = true;
      }
    }
  }
  return items;
}

export async function gradeSchreibenTeil2({
  userText = '',
  question = {},
  onProgress = null,
  options = {}
}) {
  const raw = String(userText || '').trim();
  const criteria = resolveLeitpunktCriteria(question);

  // Stage 0 & 1: Deterministic preprocessing and salutation (0 MB models)
  onProgress?.('Vorverarbeitung und Textanalyse...', 0.05);
  const stage0 = runStage0Preprocessing(raw);
  const quality = analyzeGermanQuality(raw, 30);

  onProgress?.('Bewertung von Anrede und Gruß...', 0.1);
  const stage1 = runStage1Scoring(stage0);

  let isLimitedMode = options.forceLimitedMode || !isWebGPUSupported();
  let stage2 = null;
  let stage3 = null;
  let stage4 = null;

  try {
    let embedder = null;
    if (!isLimitedMode) {
      const embRes = await modelManager.loadEmbeddingModel(onProgress);
      if (embRes.success) {
        embedder = embRes.embedder;
      } else {
        isLimitedMode = true;
      }
    }

    // Stage 2: Leitpunkte similarity vectors (EmbeddingGemma only)
    onProgress?.('Prüfung der Leitpunkte...', 0.35);
    stage2 = await runStage2Leitpunkte({
      criteria,
      bodySentences: stage0.bodySentences,
      embedder,
      qwenEngine: options.qwenEngine || null
    });

    // Free EmbeddingGemma immediately to reclaim ~300-500MB before loading LLM!
    if (embedder) {
      await modelManager.unloadEmbeddingModel();
    }

    // Stage 2 Arbiter + Stage 3 Grammar + Stage 4 Polish (Qwen3 only)
    let qwenEngine = options.qwenEngine || null;
    if (!isLimitedMode && !qwenEngine) {
      const qwenRes = await modelManager.loadLanguageModel(onProgress);
      if (qwenRes.success) {
        qwenEngine = qwenRes.engine;
      }
    }

    if (qwenEngine && stage2?.items) {
      await arbitrateGrayZoneItems(stage2.items, qwenEngine);
      stage2.totalScore = stage2.items.reduce((s, it) => s + (Number(it.score) || 0), 0);
    }

    onProgress?.('Grammatikprüfung...', 0.7);
    stage3 = await runStage3Grammar({
      fullText: raw,
      bodySentences: stage0.bodySentences,
      qwenEngine
    });

    onProgress?.('Erstelle Prüfer-Feedback...', 0.9);
    stage4 = await runStage4Feedback({
      facts: {
        anredeScore: stage1.anredeScore,
        lpScore: stage2.totalScore,
        grussScore: stage1.grussScore,
        grammarErrorCount: stage3.errors.length
      },
      enableLlmPolish: Boolean(options.enableLlmPolish),
      qwenEngine
    });
  } finally {
    // Guaranteed cleanup: release Qwen3 & any leftover memory allocations
    await modelManager.unloadAll();
  }

  onProgress?.('Bewertung abgeschlossen', 1.0);

  const diffSummary = stage2.items
    .filter(it => it.arbitrated)
    .map(it => {
      const base = Number(it.baselineScore ?? 0);
      const changeType = it.score > base ? 'rescued' : (it.score < base ? 'adjusted' : 'protected');
      return { id: it.id, change: changeType, from: base, to: it.score };
    });

  // Score Calculation
  const { finalPoints, grammarPenalty } = computeTelcFinalScore({
    salutationScore: stage1.anredeScore,
    leitpunkteScore: stage2.totalScore,
    closingScore: stage1.grussScore,
    wordCount: stage0.wordCount,
    isGibberish: quality.isGibberish,
    grammarErrorsCount: stage3.errors.length
  });

  return {
    word_count: stage0.wordCount,
    points_earned: finalPoints,
    max_points: question.max_points || 10,
    is_correct: finalPoints >= 6,
    is_limited_mode: isLimitedMode,
    breakdown: {
      anrede: stage1.anredeScore,
      leitpunkte: stage2.totalScore,
      gruss: stage1.grussScore,
      grammar_penalty: grammarPenalty,
      items: stage2.items
    },
    criteria_breakdown: {
      anrede: stage1.anredeScore,
      lp1: stage2.items[0]?.score ?? 0,
      lp2: stage2.items[1]?.score ?? 0,
      lp3: stage2.items[2]?.score ?? 0,
      gruss: stage1.grussScore,
      items: stage2.items
    },
    grammar_errors: stage3.errors,
    grammar_penalty: grammarPenalty,
    feedback_summary: stage4.feedback,
    diff_summary: diffSummary,
    user_segments: buildUserSegments(raw, criteria, stage0)
  };
}
