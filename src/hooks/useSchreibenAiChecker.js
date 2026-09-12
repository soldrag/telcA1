import { useState, useEffect, useCallback } from 'react';
import { gradeSchreibenSubmission } from '../services/schreiben/gradingPipeline.js';
import { gradeSchreibenWithWorker, isWorkerSupported } from '../services/schreiben/grading/gradingWorkerClient.js';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../services/ai/types.js';
import { mergeCandidateGrammarErrors } from '../services/schreiben/linguistic/sentenceGrammarFilter.js';

const CRITERION_LABELS = {
  anrede: 'Anrede',
  lp1: 'Punkt 1',
  lp2: 'Punkt 2',
  lp3: 'Punkt 3',
  gruss: 'Grußformel',
};

export function formatDiffEntry(d, lang) {
  const label = CRITERION_LABELS[d.id] || d.id;
  const from = d.from ?? 0;
  const to = d.to ?? 0;
  const msgs = {
    rescued:   lang === 'ru' ? `✨ ИИ нашёл ответ на ${label} и повысил балл: ${from} ➔ ${to}` : `✨ KI hat ${label} gefunden und hochgesetzt: ${from} ➔ ${to}`,
    upgraded:  lang === 'ru' ? `⬆️ ${label}: ИИ повысил ${from} ➔ ${to}` : `⬆️ ${label}: KI hat hochgesetzt ${from} ➔ ${to}`,
    adjusted:  lang === 'ru' ? `↕️ ${label}: ИИ скорректировал ${from} ➔ ${to}` : `↕️ ${label}: KI hat angepasst ${from} ➔ ${to}`,
    protected: lang === 'ru' ? `🛡️ ${label}: защита от обнуления (${from} ➔ ${to})` : `🛡️ ${label}: Schutz vor Nullung (${from} ➔ ${to})`,
    collapse_blocked: lang === 'ru' ? '🛡️ Защита: ИИ пытался обнулить все пункты' : '🛡️ Schutz: KI hat versucht alle Punkte auf 0 zu setzen',
  };
  return msgs[d.change] || `${label}: ${from} ➔ ${to}`;
}

export function useSchreibenAiChecker({
  item,
  scores,
  onApplyScores,
  onApplyErrors,
  t,
  language
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [aiDiffSummary, setAiDiffSummary] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState('');
  const [activeProvider, setActiveProvider] = useState(null);

  useEffect(() => {
    let isMounted = true;
    aiProviderRegistry.getActiveProvider().then(p => {
      if (isMounted) setActiveProvider(p);
    });
    return () => { isMounted = false; };
  }, []);

  const handleRunAi = useCallback(async () => {
    setAiLoading(true);
    setAiStatus(t('results.aiCheckLoading'));
    setAiDiffSummary([]);
    setFeedbackSummary('');

    try {
      const provider = await aiProviderRegistry.getActiveProvider();
      setActiveProvider(provider);

      let aiResult;
      if (provider.id === PROVIDER_IDS.CLIENT_WEBGPU && isWorkerSupported()) {
        aiResult = await gradeSchreibenWithWorker({
          userText: item.user_answer,
          question: item,
          onProgress: (text) => setAiStatus(text)
        });
      } else {
        aiResult = await gradeSchreibenSubmission({
          userText: item.user_answer,
          question: item,
          provider,
          onProgress: (text) => setAiStatus(text)
        });
      }

      if (aiResult?.criteria_breakdown) {
        const rawCb = aiResult.criteria_breakdown;
        const normalizedScores = {
          anrede: Number(rawCb.anrede) || 0,
          lp1: Number(rawCb.lp1) || 0,
          lp2: Number(rawCb.lp2) || 0,
          lp3: Number(rawCb.lp3) || 0,
          gruss: Number(rawCb.gruss) || 0,
        };
        const hasScoreChanged = Object.keys(normalizedScores).some(
          k => normalizedScores[k] !== scores[k]
        );
        onApplyScores(normalizedScores);

        if (Array.isArray(aiResult.grammar_errors)) {
          const baselineErrors = Array.isArray(item.grammar_errors) ? item.grammar_errors : [];
          const mergedErrors = mergeCandidateGrammarErrors(baselineErrors, aiResult.grammar_errors);
          onApplyErrors(mergedErrors);
        }
        if (Array.isArray(aiResult.diff_summary) && aiResult.diff_summary.length > 0) {
          setAiDiffSummary(aiResult.diff_summary);
        }
        if (aiResult.feedback_summary) {
          setFeedbackSummary(aiResult.feedback_summary);
        }

        if (aiResult.is_limited_mode) {
          setAiStatus(language === 'ru'
            ? '✅ Выполнена правиловая оценка (ограниченный режим)'
            : '✅ Regelbasierte Bewertung abgeschlossen (Eingeschränkter Modus)');
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
    } catch (err) {
      setAiStatus(err.message || (language === 'ru' ? 'Ошибка проверки' : 'Fehler bei der Analyse'));
    } finally {
      setAiLoading(false);
    }
  }, [item, scores, onApplyScores, onApplyErrors, t, language]);

  return {
    aiLoading,
    aiStatus,
    aiDiffSummary,
    feedbackSummary,
    handleRunAi,
    activeProvider,
    providerId: activeProvider?.id || PROVIDER_IDS.NONE,
    isLimitedMode: activeProvider?.id === PROVIDER_IDS.NONE
  };
}
