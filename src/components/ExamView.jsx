import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import ExamTimer from './ExamTimer.jsx';
import QuestionNav from './QuestionNav.jsx';
import Teil1 from './Teil1.jsx';
import Teil2 from './Teil2.jsx';
import Teil3 from './Teil3.jsx';
import Antwortbogen from './Antwortbogen.jsx';
import ModuleTaskView from './parts/ModuleTaskView.jsx';

export default function ExamView({
  testType = 'lesen',
  timerState,
  session,
  questions = [],
  answeredCount = 0,
  totalQuestions = 0,
  onOpenSubmitConfirm,
}) {
  const [showAntwortbogen, setShowAntwortbogen] = useState(false);

  useEffect(() => {
    if (session.scrollTargetId) {
      const el = document.getElementById(`question-${session.scrollTargetId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      session.setScrollTargetId(null);
    }
  }, [session.scrollTargetId]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-4">
          <ExamTimer
            isTimed={timerState.isTimed}
            totalSeconds={timerState.totalSeconds}
            secondsLeft={timerState.secondsLeft}
            setSecondsLeft={timerState.setSecondsLeft}
            secondsElapsed={timerState.secondsElapsed}
            setSecondsElapsed={timerState.setSecondsElapsed}
            isPaused={timerState.isPaused}
            setIsPaused={timerState.setIsPaused}
            isSubmitted={session.isSubmitted}
            onTimeUp={timerState.onTimeUp}
          />
        </div>
        <div className="lg:col-span-8">
          <QuestionNav
            questions={questions}
            answers={session.answers}
            activeTeil={session.activeTeil}
            setActiveTeil={session.setActiveTeil}
            activeQuestionIndex={session.activeQuestionIndex}
            onSelectQuestion={session.jumpToQuestion}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border-2 border-slate-300 shadow-sm text-sm">
        <div className="flex items-center space-x-2 text-slate-850">
          <span className="font-extrabold text-slate-900">Прогресс теста:</span>
          <span className="font-mono font-black text-telc-900 bg-telc-100 px-3 py-1 rounded-lg border border-telc-300">
            {answeredCount} из {totalQuestions} отвечено
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAntwortbogen(!showAntwortbogen)}
          className="flex items-center space-x-2 font-bold text-telc-800 hover:text-telc-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-telc-700 stroke-[2.5]" />
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
          <>
            {session.activeTeil === 1 && (
              <Teil1
                questions={questions.filter(q => q.teil === 1)}
                answers={session.answers}
                onSelectAnswer={session.selectAnswer}
                isSubmitted={session.isSubmitted}
              />
            )}
            {session.activeTeil === 2 && (
              <Teil2
                questions={questions.filter(q => q.teil === 2)}
                answers={session.answers}
                onSelectAnswer={session.selectAnswer}
                isSubmitted={session.isSubmitted}
              />
            )}
            {session.activeTeil === 3 && (
              <Teil3
                questions={questions.filter(q => q.teil === 3)}
                answers={session.answers}
                onSelectAnswer={session.selectAnswer}
                isSubmitted={session.isSubmitted}
              />
            )}
          </>
        ) : (
          <ModuleTaskView
            questions={questions}
            answers={session.answers}
            onSelectAnswer={session.selectAnswer}
            isSubmitted={session.isSubmitted}
            activeTeil={session.activeTeil}
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <button
          type="button"
          disabled={session.activeTeil === 1}
          onClick={() => {
            session.setActiveTeil(prev => Math.max(1, prev - 1));
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }}
          className="px-6 py-3 text-sm font-black text-slate-800 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border-2 border-slate-300 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          ← Предыдущая часть
        </button>

        <div className="text-sm font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 hidden sm:block">
          Часть {session.activeTeil} из {testType === 'schreiben' ? 2 : 3}
        </div>

        {session.activeTeil < (testType === 'schreiben' ? 2 : 3) ? (
          <button
            type="button"
            onClick={() => {
              session.setActiveTeil(prev => prev + 1);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 text-sm font-black text-white bg-telc-700 hover:bg-telc-800 rounded-xl shadow-sm transition-colors border-2 border-telc-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            Следующая часть →
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitConfirm}
            className="px-6 py-2.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all scale-105 border-2 border-emerald-700 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            Завершить экзамен ✓
          </button>
        )}
      </div>
    </>
  );
}
