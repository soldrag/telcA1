import { useState, useEffect, useCallback, useRef } from 'react';
import { gradeEssayWithActiveProvider } from '../services/schreiben/grading/essayGrader.js';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../services/ai/types.js';
import { applyAiGradingResult } from './schreibenAiResultApplier.js';
export { formatDiffEntry } from './schreibenDiffFormatter.js';


/**
 * Whether the results screen should grade the letter: a result graded at submission names its provider;
 * attempts saved before that (rules-only grading) do not.
 */
export function needsPipelineGrading(item = {}) {
  return Boolean(item.user_answer) && !item.provider_id;
}

export function useSchreibenAiChecker({
  item,
  scores,
  onApplyScores,
  onApplyErrors,
  language,
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(() => (
    item.examiner_feedback && item.provider_id === PROVIDER_IDS.MICRO_RANKER
      ? (language === 'ru' ? '⚡ Оценка выполнена микро-ранжировщиком (System 1)' : '⚡ Bewertung durch Micro-Ranker (System 1) abgeschlossen')
      : ''
  ));
  const [aiDiffSummary, setAiDiffSummary] = useState(() => item.diff_summary || []);
  const [feedbackSummary, setFeedbackSummary] = useState(() => item.feedback_summary || '');
  const [examinerFeedback, setExaminerFeedback] = useState(() => item.examiner_feedback || null);
  const [activeProvider, setActiveProvider] = useState(null);
  const [liveCriteriaBreakdown, setLiveCriteriaBreakdown] = useState(() => item.criteria_breakdown || null);

  useEffect(() => {
    let isMounted = true;
    aiProviderRegistry.getActiveProvider().then((p) => {
      if (isMounted) setActiveProvider(p);
    });
    return () => { isMounted = false; };
  }, []);

  const gradeInBackground = useCallback(() => gradeEssayWithActiveProvider({
    userText: item.user_answer,
    question: item,
    onProgress: (text) => setAiStatus(text),
  }), [item]);

  const applyResult = useCallback((res) => {
    applyAiGradingResult({
      aiResult: res,
      item,
      scores,
      onApplyScores,
      onApplyErrors,
      setAiDiffSummary,
      setFeedbackSummary,
      setExaminerFeedback,
      setLiveCriteriaBreakdown,
      setAiStatus,
      language,
    });
  }, [item, scores, onApplyScores, onApplyErrors, language]);

  const runGrading = useCallback(async () => {
    setAiLoading(true);
    setAiStatus(language === 'ru' ? 'Запуск микро-ранжировщика...' : 'Lade Micro-Ranker...');
    setAiDiffSummary([]);
    setFeedbackSummary('');
    setExaminerFeedback(null);
    try {
      applyResult(await gradeInBackground());
    } catch (err) {
      setAiStatus(err.message || (language === 'ru' ? 'Ошибка ранжировщика' : 'Fehler beim Ranker'));
    } finally {
      setAiLoading(false);
    }
  }, [gradeInBackground, applyResult, language]);

  // Once per answer: applying the result changes the scores and with them runGrading's identity.
  const gradedAnswerRef = useRef(null);
  useEffect(() => {
    const answerKey = `${item?.id}:${item?.user_answer}`;
    if (!needsPipelineGrading(item) || gradedAnswerRef.current === answerKey) return;
    gradedAnswerRef.current = answerKey;
    runGrading();
  }, [item, runGrading]);

  return {
    aiLoading,
    aiStatus,
    aiDiffSummary,
    feedbackSummary,
    examinerFeedback,
    liveCriteriaBreakdown,
    activeProvider,
    providerId: activeProvider?.id || PROVIDER_IDS.NONE,
    isLimitedMode: activeProvider?.id === PROVIDER_IDS.NONE,
  };
}
