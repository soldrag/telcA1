/**
 * Helper module for applying AI grading results to React state in useSchreibenAiChecker.
 * Decouples state mutations and localized status messages from the main hook controller.
 */

import { mergeCandidateGrammarErrors } from '../services/schreiben/linguistic/grammarErrorDeduper.js';

export function applyAiGradingResult({
  aiResult,
  item,
  scores,
  onApplyScores,
  onApplyErrors,
  setAiDiffSummary,
  setExaminerFeedback,
  setLiveCriteriaBreakdown,
  setAiStatus,
  language,
}) {
  if (!aiResult?.criteria_breakdown) return;

  const rawCb = aiResult.criteria_breakdown;
  const normalizedScores = {
    anrede: Number(rawCb.anrede) || 0,
    lp1: Number(rawCb.lp1) || 0,
    lp2: Number(rawCb.lp2) || 0,
    lp3: Number(rawCb.lp3) || 0,
    gruss: Number(rawCb.gruss) || 0,
  };
  const hasScoreChanged = Object.keys(normalizedScores).some((k) => normalizedScores[k] !== scores[k]);
  onApplyScores?.(normalizedScores);

  if (Array.isArray(aiResult.grammar_errors)) {
    const baselineErrors = Array.isArray(item.grammar_errors) ? item.grammar_errors : [];
    const mergedErrors = mergeCandidateGrammarErrors(baselineErrors, aiResult.grammar_errors);
    onApplyErrors?.(mergedErrors);
  }

  if (Array.isArray(aiResult.diff_summary) && aiResult.diff_summary.length > 0) {
    setAiDiffSummary?.(aiResult.diff_summary);
  }
  setExaminerFeedback?.(aiResult.examiner_feedback || null);
  setLiveCriteriaBreakdown?.(aiResult.criteria_breakdown);

  updateStatusMessage(aiResult, hasScoreChanged, setAiStatus, language);
}

function updateStatusMessage(aiResult, hasScoreChanged, setAiStatus, language) {
  if (!setAiStatus) return;
  const isRanker = aiResult.provider_id === 'micro_ranker';
  if (aiResult.is_limited_mode) {
    setAiStatus(language === 'ru'
      ? '✅ Выполнена правиловая оценка (ограниченный режим)'
      : '✅ Regelbasierte Bewertung abgeschlossen (Eingeschränkter Modus)');
  } else if (isRanker) {
    setAiStatus(language === 'ru'
      ? '⚡ Оценка выполнена микро-ранжировщиком (System 1)'
      : '⚡ Bewertung durch Micro-Ranker (System 1) abgeschlossen');
  } else if (hasScoreChanged) {
    setAiStatus(language === 'ru'
      ? '✅ Нейросеть обновила баллы и список ошибок'
      : '✅ KI hat Kriterien und Hinweise aktualisiert');
  } else {
    setAiStatus(language === 'ru'
      ? '✅ Нейросеть подтвердила правильность баллов'
      : '✅ KI hat den Text geprüft: Bewertung bestätigt');
  }
}
