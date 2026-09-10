import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import ExamTimer from './ExamTimer.jsx';
import QuestionNav from './QuestionNav.jsx';
import Antwortbogen from './Antwortbogen.jsx';
import ModuleTaskView from './parts/ModuleTaskView.jsx';
import ExamBottomNav from './exam/ExamBottomNav.jsx';
import LesenTeilRenderer from './exam/LesenTeilRenderer.jsx';
import { scrollToElement, scrollToExamHeader } from '../utils/scrollService.js';

function getMaxTeile(testType) {
  return testType === 'schreiben' ? 2 : 3;
}

export default function ExamView({
  examConfig = {},
  session = {},
  timer = {},
  onOpenSubmitConfirm,
  testType = examConfig.testType || 'lesen',
  timerState = timer,
  questions = examConfig.questions || [],
}) {
  const [showAntwortbogen, setShowAntwortbogen] = useState(false);
  const maxTeile = getMaxTeile(testType);
  const answeredCount = session.answeredCount ?? 0;
  const totalQuestions = questions.length;

  useEffect(() => {
    if (!session.scrollTargetId) return;
    scrollToElement(`question-${session.scrollTargetId}`);
    session.clearScrollTarget();
  }, [session.scrollTargetId, session]);

  const handlePreviousTeil = () => {
    session.previousTeil();
    scrollToExamHeader();
  };

  const handleNextTeil = () => {
    session.nextTeil(maxTeile);
    scrollToExamHeader();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-4">
          <ExamTimer
            timer={timerState}
            isSubmitted={session.isSubmitted}
          />
        </div>
        <div className="lg:col-span-8">
          <QuestionNav
            questions={questions}
            session={session}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card px-4 py-3 rounded-2xl border-2 border-border-default shadow-sm text-sm">
        <div className="flex items-center space-x-2 text-content-secondary">
          <span className="font-extrabold text-content-primary">Прогресс теста:</span>
          <span className="font-mono font-black text-telc-900 dark:text-telc-200 bg-telc-100 dark:bg-telc-950/80 px-3 py-1 rounded-lg border border-telc-300 dark:border-telc-800">
            {answeredCount} из {totalQuestions} отвечено
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAntwortbogen(!showAntwortbogen)}
          className="flex items-center space-x-2 font-bold text-telc-800 dark:text-telc-300 hover:text-telc-900 dark:hover:text-telc-100 bg-surface-card hover:bg-slate-50 dark:hover:bg-slate-700/60 px-4 py-2 rounded-xl border-2 border-border-default hover:border-slate-400 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-telc-700 dark:text-telc-400 stroke-[2.5]" />
          <span>{showAntwortbogen ? 'Скрыть бланк' : 'Показать бланк (Antwortbogen)'}</span>
        </button>
      </div>

      {showAntwortbogen && (
        <Antwortbogen
          questions={questions}
          answers={session.answers}
          onSelectQuestion={session.jumpToQuestion}
          isSubmitted={session.isSubmitted}
        />
      )}

      <div className="min-h-[500px]">
        {testType === 'lesen' ? (
          <LesenTeilRenderer
            activeTeil={session.activeTeil}
            questions={questions}
            session={session}
          />
        ) : (
          <ModuleTaskView
            questions={questions}
            sessionState={session}
            activeTeil={session.activeTeil}
          />
        )}
      </div>

      <ExamBottomNav
        pagination={{ activeTeil: session.activeTeil, maxTeile }}
        actions={{
          onPreviousTeil: handlePreviousTeil,
          onNextTeil: handleNextTeil,
          onSubmit: onOpenSubmitConfirm,
        }}
      />
    </>
  );
}
