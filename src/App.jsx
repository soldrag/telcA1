import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import ExamView from './components/ExamView.jsx';
import ResultsView from './components/ResultsView.jsx';
import HistoryView from './components/HistoryView.jsx';
import ConfirmSubmitModal from './components/modals/ConfirmSubmitModal.jsx';
import ConfirmLeaveModal from './components/modals/ConfirmLeaveModal.jsx';
import { useExamSession } from './hooks/useExamSession.js';
import { useExamTimer } from './hooks/useExamTimer.js';
import { 
  fetchExams, fetchExamDetails, fetchTestTypes 
} from './services/api.js';
import { attemptStorage } from './services/storage/index.js';
import { getNextBalancedExam } from './utils/examBalancer.js';
import { sortExamsNumerically } from './utils/examFormat.js';

export default function App() {
  const [exams, setExams] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [activeTestType, setActiveTestType] = useState('lesen');
  const [currentExamId, setCurrentExamId] = useState('modellsatz-1');
  const [examData, setExamData] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [screen, setScreen] = useState('welcome');
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [userShortId, setUserShortId] = useState('Локально');
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const session = useExamSession();
  const timer = useExamTimer(25 * 60);

  const refreshAttempts = useCallback(async () => {
    try {
      const list = await attemptStorage.getAttempts({ testType: activeTestType, limit: 3 });
      setRecentAttempts(list);
    } catch (err) {
      console.error('Failed to load recent attempts:', err);
    }
  }, [activeTestType]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await attemptStorage.getAttempts();
      setHistoryAttempts(list);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestTypes().then(d => setTestTypes(d.testTypes || [])).catch(console.error);
    fetchExams(activeTestType).then(d => {
      if (d.exams?.length > 0) {
        const sorted = sortExamsNumerically(d.exams);
        setExams(sorted);
        setCurrentExamId(sorted[0].id);
      }
    }).catch(console.error);
    refreshAttempts();
  }, [activeTestType, refreshAttempts]);

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

  const handleStartExam = async ({ timed = true, specificExamId }) => {
    const targetId = specificExamId || currentExamId;
    if (targetId !== currentExamId) {
      await loadExamById(targetId);
      setCurrentExamId(targetId);
    } else {
      session.resetSession();
      timer.resetTimer(timed);
    }
    setScreen('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRandomExam = async ({ timed = true }) => {
    try {
      const selected = await getNextBalancedExam({ exams, storage: attemptStorage, testType: activeTestType });
      if (selected?.id) {
        setCurrentExamId(selected.id);
        await loadExamById(selected.id);
      }
      timer.resetTimer(timed);
      setScreen('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error starting random exam:', err);
      handleStartExam({ timed });
    }
  };

  const performSubmit = async () => {
    const result = await session.submitCurrentExam({
      examId: currentExamId, isTimed: timer.isTimed,
      secondsLeft: timer.secondsLeft, secondsElapsed: timer.secondsElapsed, totalSeconds: timer.totalSeconds
    });
    if (result) {
      setConfirmSubmitOpen(false);
      refreshAttempts();
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTimeUp = useCallback(() => {
    if (!session.isSubmitted && screen === 'exam') {
      alert('Время вышло! Ваш экзамен будет проверен автоматически.');
      performSubmit();
    }
  }, [session.isSubmitted, screen, performSubmit]);

  const handleLoadAttempt = async (attemptId) => {
    const data = await attemptStorage.getAttemptById(attemptId).catch(console.error);
    if (data?.results) {
      setCurrentExamId(data.exam_id);
      session.loadPastAttempt(data);
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearHistory = async () => {
    await attemptStorage.clearAttempts();
    await refreshAttempts();
    await refreshHistory();
  };

  const currentModule = testTypes.find(t => t.id === activeTestType) || { title: 'Lesen', maxScore: 15 };
  const questions = examData?.questions || [];
  const answeredCount = Object.keys(session.answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas font-sans">
      <Header
        screen={screen}
        onNavigateHome={() => (screen === 'exam' && !session.isSubmitted && answeredCount > 0) ? setConfirmLeaveOpen(true) : setScreen('welcome')}
        onOpenHistory={() => { refreshHistory(); setScreen('history'); }}
        onResetExam={() => handleStartExam({ timed: timer.isTimed })}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        onSubmitExam={() => setConfirmSubmitOpen(true)}
        userShortId={userShortId}
        activeModuleTitle={currentModule.title}
        activeModulePoints={currentModule.maxScore || 15}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {screen === 'welcome' && (
          <WelcomeScreen
            exams={exams} testTypes={testTypes} activeTestType={activeTestType}
            onSelectTestType={setActiveTestType} currentExamId={currentExamId}
            onSelectExam={setCurrentExamId} onStartExam={handleStartExam}
            onStartRandomExam={handleStartRandomExam} onOpenHistory={() => { refreshHistory(); setScreen('history'); }}
            onLoadAttempt={handleLoadAttempt} recentAttempts={recentAttempts}
          />
        )}
        {screen === 'history' && (
          <HistoryView
            onBack={() => setScreen('welcome')}
            onLoadAttempt={handleLoadAttempt}
            onStartExam={handleStartExam}
            onClearHistory={handleClearHistory}
            attempts={historyAttempts}
            loading={historyLoading}
            onRefresh={refreshHistory}
          />
        )}
        {screen === 'results' && session.results && (
          <ResultsView
            results={session.results} onResetExam={() => handleStartExam({ timed: timer.isTimed })}
            onRetakeMistakes={() => { session.retakeMistakes(); setScreen('exam'); }}
            onOpenHistory={() => { refreshHistory(); setScreen('history'); }}
          />
        )}
        {screen === 'exam' && examData && (
          <ExamView
            testType={examData?.exam?.test_type || activeTestType}
            timerState={{ ...timer, onTimeUp: handleTimeUp }}
            session={session} questions={questions} answeredCount={answeredCount}
            totalQuestions={questions.length} onOpenSubmitConfirm={() => setConfirmSubmitOpen(true)}
          />
        )}
      </main>

      <ConfirmSubmitModal
        isOpen={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)} onConfirm={performSubmit}
        answeredCount={answeredCount} totalQuestions={questions.length} isSubmitting={session.isSubmitting}
      />
      <ConfirmLeaveModal
        isOpen={confirmLeaveOpen} onClose={() => setConfirmLeaveOpen(false)}
        onConfirm={() => { setConfirmLeaveOpen(false); setScreen('welcome'); }}
      />
      <footer className="mt-auto border-t border-border-subtle bg-surface-card py-4 text-center text-xs text-content-tertiary">
        <p>Симулятор экзамена telc Deutsch A1 / Start Deutsch 1 • 15 баллов • Проходной порог: 60% (9 баллов)</p>
      </footer>
    </div>
  );
}
