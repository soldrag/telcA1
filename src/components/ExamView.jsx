import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import ExamTimer from './ExamTimer.jsx';
import QuestionNav from './QuestionNav.jsx';
import Antwortbogen from './Antwortbogen.jsx';
import ModuleTaskView from './parts/ModuleTaskView.jsx';
import ExamBottomNav from './exam/ExamBottomNav.jsx';
import LesenTeilRenderer from './exam/LesenTeilRenderer.jsx';
import SchreibenTeilRenderer from './schreiben/SchreibenTeilRenderer.jsx';
import ExamLoadingSkeleton from './exam/ExamLoadingSkeleton.jsx';
import { scrollToElement, scrollToExamHeader } from '../utils/scrollService.js';
import { useI18n } from '../i18n/I18nContext.jsx';

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
  isLoading = false,
}) {
  const { t } = useI18n();
  const [showAntwortbogen, setShowAntwortbogen] = useState(false);
  const resolvedTestType = testType || (questions[0]?.exam_id?.startsWith('schreiben-') ? 'schreiben' : 'lesen');
  const maxTeile = getMaxTeile(resolvedTestType);
  const answeredCount = session.answeredCount ?? 0;
  const totalQuestions = questions.length;

  useEffect(() => {
    if (session.activeTeil > maxTeile) {
      session.selectTeil?.(maxTeile);
    }
  }, [session.activeTeil, maxTeile, session]);

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

  if (isLoading || questions.length === 0) {
    return <ExamLoadingSkeleton />;
  }

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
            testType={resolvedTestType}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card px-4 py-3 rounded-2xl border-2 border-border-default shadow-xs text-sm">
        <div className="flex items-center space-x-2 text-content-secondary">
          <span className="font-extrabold text-content-primary">{t('exam.progressLabel')}</span>
          <span className="font-mono font-black text-action-primary bg-action-primary-subtle px-3 py-1 rounded-lg border border-action-primary-border">
            {t('exam.progressCounter', { answered: answeredCount, total: totalQuestions })}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAntwortbogen(!showAntwortbogen)}
          className="flex items-center space-x-2 font-bold text-content-primary bg-surface-card hover:bg-surface-raised px-4 py-2 rounded-xl border-2 border-border-default hover:border-border-strong shadow-xs transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-action-primary stroke-[2.5]" />
          <span>{showAntwortbogen ? t('exam.toggleAntwortbogenHide') : t('exam.toggleAntwortbogenShow')}</span>
        </button>
      </div>

      {showAntwortbogen && (
        <Antwortbogen
          questions={questions}
          answers={session.answers}
          onSelectQuestion={session.jumpToQuestion}
          isSubmitted={session.isSubmitted}
          testType={testType}
        />
      )}

      <div className="min-h-[500px]">
        {testType === 'lesen' && (
          <LesenTeilRenderer
            activeTeil={session.activeTeil}
            questions={questions}
            session={session}
          />
        )}
        {testType === 'schreiben' && (
          <SchreibenTeilRenderer
            activeTeil={session.activeTeil}
            questions={questions}
            session={session}
          />
        )}
        {testType !== 'lesen' && testType !== 'schreiben' && (
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
