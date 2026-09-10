import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import AppScreens from './components/AppScreens.jsx';
import AppModals from './components/modals/AppModals.jsx';
import { useExamSession } from './hooks/useExamSession.js';
import { useExamTimer } from './hooks/useExamTimer.js';
import { useAttemptHistory } from './hooks/useAttemptHistory.js';
import { fetchExams, fetchExamDetails, fetchTestTypes } from './services/api.js';
import { attemptStorage } from './services/storage/index.js';
import { getNextBalancedExam } from './utils/examBalancer.js';
import { sortExamsNumerically } from './utils/examFormat.js';

export default function App() {
  const [exams, setExams] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [activeTestType, setActiveTestType] = useState('lesen');
  const [currentExamId, setCurrentExamId] = useState('modellsatz-1');
  const [examData, setExamData] = useState(null);
  const [screen, setScreen] = useState('welcome');
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const session = useExamSession();
  const timer = useExamTimer(25 * 60);
  const history = useAttemptHistory(activeTestType);

  useEffect(() => {
    fetchTestTypes().then((d) => setTestTypes(d.testTypes || [])).catch(console.error);
    fetchExams(activeTestType).then((d) => {
      if (!d.exams?.length) return;
      const sorted = sortExamsNumerically(d.exams);
      setExams(sorted);
      setCurrentExamId(sorted[0].id);
    }).catch(console.error);
  }, [activeTestType]);

  const loadExamById = useCallback(async (examId) => {
    try {
      const data = await fetchExamDetails(examId);
      setExamData(data);
      session.resetSession();
      const duration = (data.exam?.time_limit_minutes || 25) * 60;
      timer.resetTimer(true, duration);
    } catch (err) {
      console.error('Failed to load exam:', err);
    }
  }, [session, timer]);

  useEffect(() => {
    if (currentExamId) loadExamById(currentExamId);
  }, [currentExamId]);

  const navigateTo = (targetScreen) => {
    setScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = async ({ timed = true, specificExamId }) => {
    const targetId = specificExamId || currentExamId;
    if (targetId !== currentExamId) {
      await loadExamById(targetId);
      setCurrentExamId(targetId);
    } else {
      session.resetSession();
      timer.resetTimer(timed);
    }
    navigateTo('exam');
  };

  const handleStartRandomExam = async ({ timed = true }) => {
    try {
      const selected = await getNextBalancedExam({ exams, storage: attemptStorage, testType: activeTestType });
      if (selected?.id) {
        setCurrentExamId(selected.id);
        await loadExamById(selected.id);
      }
      timer.resetTimer(timed);
      navigateTo('exam');
    } catch (err) {
      console.error('Error starting random exam:', err);
      handleStartExam({ timed });
    }
  };

  const performSubmit = async () => {
    const result = await session.submitCurrentExam({
      examId: currentExamId,
      isTimed: timer.isTimed,
      secondsLeft: timer.secondsLeft,
      secondsElapsed: timer.secondsElapsed,
      totalSeconds: timer.totalSeconds,
    });
    if (!result) return;
    setConfirmSubmitOpen(false);
    history.refreshAttempts();
    navigateTo('results');
  };

  const handleTimeUp = useCallback(() => {
    if (session.isSubmitted || screen !== 'exam') return;
    alert('Время вышло! Ваш экзамен будет проверен автоматически.');
    performSubmit();
  }, [session.isSubmitted, screen, performSubmit]);

  useEffect(() => {
    timer.registerTimeUpHandler(handleTimeUp);
  }, [timer, handleTimeUp]);

  const handleLoadAttempt = async (attemptId) => {
    const data = await attemptStorage.getAttemptById(attemptId).catch(console.error);
    if (!data?.results) return;
    setCurrentExamId(data.exam_id);
    session.loadPastAttempt(data);
    navigateTo('results');
  };

  const currentModule = testTypes.find((t) => t.id === activeTestType) || { title: 'Lesen', maxScore: 15 };
  const questions = examData?.questions || [];
  const answeredCount = Object.keys(session.answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas font-sans">
      <Header
        screen={screen}
        onNavigateHome={() => (screen === 'exam' && !session.isSubmitted && answeredCount > 0) ? setConfirmLeaveOpen(true) : setScreen('welcome')}
        onOpenHistory={() => { history.refreshHistory(); setScreen('history'); }}
        onResetExam={() => handleStartExam({ timed: timer.isTimed })}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        onSubmitExam={() => setConfirmSubmitOpen(true)}
        userShortId="Локально"
        activeModuleTitle={currentModule.title}
        activeModulePoints={currentModule.maxScore || 15}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AppScreens
          screen={screen}
          welcomeProps={{
            exams,
            testTypes,
            activeTestType,
            onSelectTestType: setActiveTestType,
            currentExamId,
            onSelectExam: setCurrentExamId,
            onStartExam: handleStartExam,
            onStartRandomExam: handleStartRandomExam,
            onOpenHistory: () => { history.refreshHistory(); setScreen('history'); },
            onLoadAttempt: handleLoadAttempt,
            recentAttempts: history.recentAttempts,
          }}
          historyProps={{
            onBack: () => setScreen('welcome'),
            onLoadAttempt: handleLoadAttempt,
            onStartExam: handleStartExam,
            onClearHistory: history.clearHistory,
            attempts: history.historyAttempts,
            loading: history.historyLoading,
            onRefresh: history.refreshHistory,
          }}
          resultsProps={{
            results: session.results,
            onResetExam: () => handleStartExam({ timed: timer.isTimed }),
            onRetakeMistakes: () => { session.retakeMistakes(); setScreen('exam'); },
            onOpenHistory: () => { history.refreshHistory(); setScreen('history'); },
          }}
          examProps={{
            examData,
            testType: examData?.exam?.test_type || activeTestType,
            timerState: { ...timer, onTimeUp: handleTimeUp },
            session,
            questions,
            answeredCount,
            totalQuestions: questions.length,
            onOpenSubmitConfirm: () => setConfirmSubmitOpen(true),
          }}
        />
      </main>

      <AppModals
        confirmSubmitOpen={confirmSubmitOpen}
        onCloseSubmitModal={() => setConfirmSubmitOpen(false)}
        onConfirmSubmit={performSubmit}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        isSubmitting={session.isSubmitting}
        confirmLeaveOpen={confirmLeaveOpen}
        onCloseLeaveModal={() => setConfirmLeaveOpen(false)}
        onConfirmLeave={() => { setConfirmLeaveOpen(false); setScreen('welcome'); }}
      />

      <footer className="mt-auto border-t border-border-subtle bg-surface-card py-4 text-center text-xs text-content-tertiary">
        <p>Симулятор экзамена telc Deutsch A1 / Start Deutsch 1 • 15 баллов • Проходной порог: 60% (9 баллов)</p>
      </footer>
    </div>
  );
}
