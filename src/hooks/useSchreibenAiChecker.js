import { useState, useEffect, useCallback } from 'react';
import { gradeSchreibenWithWorker } from '../services/schreiben/grading/gradingWorkerClient.js';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../services/ai/types.js';
import { applyAiGradingResult } from './schreibenAiResultApplier.js';
export { formatDiffEntry } from './schreibenDiffFormatter.js';


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
  const [aiDiffSummary, setAiDiffSummary] = useState([]);
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

  // The provider is chosen here, where the developer override in localStorage is readable; the worker
  // gets only the resulting fact and runs the model off the main thread (CLAUDE.md §11).
  const gradeInBackground = useCallback(async () => {
    const provider = await aiProviderRegistry.getActiveProvider();
    setActiveProvider(provider);
    return gradeSchreibenWithWorker({
      userText: item.user_answer,
      question: item,
      options: { forceLimitedMode: provider.id === PROVIDER_IDS.NONE },
      onProgress: (text) => setAiStatus(text),
    });
  }, [item]);

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

  useEffect(() => {
    if (!item?.examiner_feedback && item?.user_answer && !aiLoading) {
      runGrading();
    }
  }, [item?.examiner_feedback, item?.user_answer, runGrading]);

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
