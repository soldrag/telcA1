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
import { getTestTypeById } from '../../shared/testTypes.js';

const TEIL_RENDERERS = {
  lesen: LesenTeilRenderer,
  schreiben: SchreibenTeilRenderer,
};

function getMaxTeile(questions = [], testType = 'lesen') {
  if (questions.length > 0) {
    return Math.max(...questions.map((q) => q.teil || 1), 1);
  }
  return getTestTypeById(testType)?.partsCount ?? 3;
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
  const resolvedTestType = testType || examConfig.test_type || questions[0]?.test_type || 'lesen';
  const maxTeile = getMaxTeile(questions, resolvedTestType);
  const ActiveTeilRenderer = TEIL_RENDERERS[resolvedTestType] || ModuleTaskView;
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
          testType={resolvedTestType}
        />
      )}

      <div className="min-h-[500px]">
        <ActiveTeilRenderer
          activeTeil={session.activeTeil}
          questions={questions}
          session={session}
          sessionState={session}
        />
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
