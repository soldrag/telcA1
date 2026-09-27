import { useState, useEffect, useCallback } from 'react';
import { gradeSchreibenSubmission } from '../services/schreiben/gradingPipeline.js';
import { gradeSchreibenWithWorker, isWorkerSupported } from '../services/schreiben/grading/gradingWorkerClient.js';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../services/ai/types.js';
import { applyAiGradingResult } from './schreibenAiResultApplier.js';
export { formatDiffEntry } from './schreibenDiffFormatter.js';


export function useSchreibenAiChecker({
  item,
  scores,
  onApplyScores,
  onApplyErrors,
  t,
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

  const runEvaluationForProvider = useCallback(async (targetProvider = null, progressPrefix = '') => {
    const provider = targetProvider || await aiProviderRegistry.getActiveProvider();
    setActiveProvider(provider);
    const onProg = (text) => setAiStatus(progressPrefix ? `${progressPrefix}: ${text}` : text);

    const isBrowserAi = provider.id === PROVIDER_IDS.MICRO_RANKER;
    if (!targetProvider && isBrowserAi && isWorkerSupported()) {
      return await gradeSchreibenWithWorker({
        userText: item.user_answer,
        question: item,
        onProgress: onProg,
      });
    }
    return await gradeSchreibenSubmission({
      userText: item.user_answer,
      question: item,
      provider,
      onProgress: onProg,
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

  const handleRunAi = useCallback(async () => {
    setAiLoading(true);
    setAiStatus(t('results.aiCheckLoading'));
    setAiDiffSummary([]);
    setFeedbackSummary('');
    setExaminerFeedback(null);
    try {
      const res = await runEvaluationForProvider(null);
      applyResult(res);
    } catch (err) {
      setAiStatus(err.message || (language === 'ru' ? 'Ошибка проверки' : 'Fehler bei der Analyse'));
    } finally {
      setAiLoading(false);
    }
  }, [runEvaluationForProvider, applyResult, t, language]);

  const handleRunRankerAi = useCallback(async () => {
    setAiLoading(true);
    setAiStatus(language === 'ru' ? 'Запуск микро-ранжировщика...' : 'Lade Micro-Ranker...');
    setAiDiffSummary([]);
    setFeedbackSummary('');
    setExaminerFeedback(null);
    try {
      const ranker = aiProviderRegistry.getProvider(PROVIDER_IDS.MICRO_RANKER);
      const res = await runEvaluationForProvider(ranker);
      applyResult(res);
    } catch (err) {
      setAiStatus(err.message || (language === 'ru' ? 'Ошибка ранжировщика' : 'Fehler beim Ranker'));
    } finally {
      setAiLoading(false);
    }
  }, [runEvaluationForProvider, applyResult, language]);

  useEffect(() => {
    if (!item?.examiner_feedback && item?.user_answer && !aiLoading) {
      handleRunRankerAi();
    }
  }, [item?.examiner_feedback, item?.user_answer, handleRunRankerAi]);

  return {
    aiLoading,
    aiStatus,
    aiDiffSummary,
    feedbackSummary,
    examinerFeedback,
    liveCriteriaBreakdown,
    handleRunAi,
    handleRunRankerAi,
    activeProvider,
    providerId: activeProvider?.id || PROVIDER_IDS.NONE,
    isLimitedMode: activeProvider?.id === PROVIDER_IDS.NONE,
  };
}
