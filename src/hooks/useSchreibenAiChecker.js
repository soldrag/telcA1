import { useState, useEffect, useCallback } from 'react';
import { gradeSchreibenSubmission } from '../services/schreiben/gradingPipeline.js';
import { gradeSchreibenWithWorker, isWorkerSupported } from '../services/schreiben/grading/gradingWorkerClient.js';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../services/ai/types.js';
import { applyAiGradingResult } from './schreibenAiResultApplier.js';
import { compareGradingResults } from '../services/schreiben/grading/abTestingService.js';
import { scoreCriteriaLevels } from '../services/schreiben/regulations/index.js';
import { formatPoints } from '../utils/formatPoints.js';

const CRITERION_LABELS = {
  anrede: 'Anrede',
  lp1: 'Punkt 1',
  lp2: 'Punkt 2',
  lp3: 'Punkt 3',
  gruss: 'Grußformel',
};

const RANKER_VERDICT = {
  ru: { 2: 'полностью', 1: 'частично', 0: 'не раскрыт' },
  de: { 2: 'vollständig', 1: 'teilweise', 0: 'nicht erfüllt' },
};

function toPoints(level, lang) {
  return formatPoints(scoreCriteriaLevels({ lp1: level }).leitpunkte[0].points, lang);
}

export function formatDiffEntry(d, lang, item = null) {
  let label = CRITERION_LABELS[d.id] || d.id;
  if (d.id?.startsWith('lp') && item) {
    const idx = parseInt(d.id.replace('lp', ''), 10) - 1;
    const title = item.options_json?.leitpunkte?.[idx]
      || item.leitpunkte?.[idx]
      || item.criteria?.[idx]?.label
      || item.criteria_breakdown?.items?.[idx]?.label;
    if (title && typeof title === 'string') {
      const cleanTitle = title.replace(/^\d+[\.\)]\s*/, '').trim();
      label = `${CRITERION_LABELS[d.id]} (${cleanTitle})`;
    }
  }
  const from = toPoints(d.from ?? 0, lang);
  const to = toPoints(d.to ?? 0, lang);
  const verdict = (RANKER_VERDICT[lang] || RANKER_VERDICT.de)[d.rankerScore ?? 0];
  const msgs = {
    rescued:   lang === 'ru' ? `✨ ИИ нашёл ответ на ${label} и повысил балл: ${from} ➔ ${to}` : `✨ KI hat ${label} gefunden und hochgesetzt: ${from} ➔ ${to}`,
    adjusted:  lang === 'ru' ? `↕️ ${label}: ИИ скорректировал ${from} ➔ ${to}` : `↕️ ${label}: KI hat angepasst ${from} ➔ ${to}`,
    protected: lang === 'ru'
      ? `🛡️ ${label}: ранкер — ${verdict}, оставлено ${to} по ключевым словам`
      : `🛡️ ${label}: Ranker — ${verdict}, ${to} nach Schlüsselwörtern beibehalten`,
  };
  return msgs[d.change] || `${label}: ${from} ➔ ${to}`;
}

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
    item.examiner_feedback
      ? (language === 'ru' ? '⚡ Оценка выполнена микро-ранжировщиком (System 1)' : '⚡ Bewertung durch Micro-Ranker (System 1) abgeschlossen')
      : ''
  ));
  const [aiDiffSummary, setAiDiffSummary] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(() => item.feedback_summary || '');
  const [examinerFeedback, setExaminerFeedback] = useState(() => item.examiner_feedback || null);
  const [activeProvider, setActiveProvider] = useState(null);
  const [liveCriteriaBreakdown, setLiveCriteriaBreakdown] = useState(() => item.criteria_breakdown || null);
  const [abComparison, setAbComparison] = useState(null);

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

    if (!targetProvider && provider.id === PROVIDER_IDS.CLIENT_WEBGPU && isWorkerSupported()) {
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

  const handleRunAbComparison = useCallback(async () => {
    setAiLoading(true);
    setAiDiffSummary([]);
    setFeedbackSummary('');
    setExaminerFeedback(null);
    try {
      const t0 = performance.now();
      const standardProvider = await aiProviderRegistry.getActiveProvider();
      const resA = await runEvaluationForProvider(standardProvider, 'A: Standard');
      const durA = Math.round(performance.now() - t0);

      const t1 = performance.now();
      const ranker = aiProviderRegistry.getProvider(PROVIDER_IDS.MICRO_RANKER);
      const resB = await runEvaluationForProvider(ranker, 'B: Ranker');
      const durB = Math.round(performance.now() - t1);

      const comp = compareGradingResults(resA, resB, {
        durationMsA: durA,
        durationMsB: durB,
        providerAId: standardProvider.id,
        providerBId: ranker.id,
      });
      setAbComparison(comp);
      applyResult(resB);
      setAiStatus(language === 'ru' ? '✅ A/B сравнение успешно выполнено' : '✅ A/B-Vergleich abgeschlossen');
    } catch (err) {
      setAiStatus(err.message || (language === 'ru' ? 'Ошибка A/B теста' : 'Fehler beim A/B-Test'));
    } finally {
      setAiLoading(false);
    }
  }, [runEvaluationForProvider, applyResult, language]);

  return {
    aiLoading,
    aiStatus,
    aiDiffSummary,
    feedbackSummary,
    examinerFeedback,
    liveCriteriaBreakdown,
    abComparison,
    closeAbComparison: () => setAbComparison(null),
    handleRunAi,
    handleRunRankerAi,
    handleRunAbComparison,
    activeProvider,
    providerId: activeProvider?.id || PROVIDER_IDS.NONE,
    isLimitedMode: activeProvider?.id === PROVIDER_IDS.NONE,
  };
}
