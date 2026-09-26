import React, { lazy, Suspense, useEffect, useState } from 'react';
import ExamTimer from './ExamTimer.jsx';
import ModuleTaskView from './parts/ModuleTaskView.jsx';
import ExamBottomNav from './exam/ExamBottomNav.jsx';
import ExamToolbar from './exam/ExamToolbar.jsx';
import ExamPageNav from './exam/ExamPageNav.jsx';
import { QuestionFlagProvider } from './exam/QuestionFlag.jsx';
import InspectionInfoCard from './exam/InspectionInfoCard.jsx';
import LesenTeilRenderer from './exam/LesenTeilRenderer.jsx';
import SchreibenTeilRenderer from './schreiben/SchreibenTeilRenderer.jsx';
import ExamLoadingSkeleton from './exam/ExamLoadingSkeleton.jsx';
import { scrollToElement, scrollToTop } from '../utils/scrollService.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useExamFontSize } from '../hooks/useExamFontSize.js';
import { useAnswerSheet } from '../hooks/useAnswerSheet.js';
import { useExamHotkeys } from '../hooks/useExamHotkeys.js';
import { getTestTypeById } from '../../shared/testTypes.js';

const AnswerSheetSheet = lazy(() => import('./exam/AnswerSheetSheet.jsx'));

const TEIL_RENDERERS = {
  lesen: LesenTeilRenderer,
  schreiben: SchreibenTeilRenderer,
};

// Desktop header navigation: a numbered strip for many short items, Teil tabs for a form plus one letter.
const HEADER_NAV_BY_MODULE = { schreiben: 'tabs' };

function getMaxTeile(questions = [], testType = 'lesen') {
  if (questions.length > 0) {
    return Math.max(...questions.map((q) => q.teil || 1), 1);
  }
  return getTestTypeById(testType)?.partsCount ?? 3;
}

function useExamScrollSync(session, maxTeile) {
  useEffect(() => {
    if (session.activeTeil > maxTeile) session.selectTeil?.(maxTeile);
  }, [session.activeTeil, maxTeile, session]);

  useEffect(() => {
    if (!session.scrollTargetId) return;
    scrollToElement(`question-${session.scrollTargetId}`);
    session.clearScrollTarget();
  }, [session.scrollTargetId, session]);

  useEffect(() => {
    if (session.scrollTargetId) return;
    scrollToTop('auto');
  }, [session.activeTeil]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function ExamView({
  examConfig = {},
  session = {},
  timer = {},
  onOpenSubmitConfirm,
  testType = examConfig.testType || 'lesen',
  questions = examConfig.questions || [],
  isLoading = false,
  isInspection = false,
  onExitInspection,
}) {
  const { t } = useI18n();
  const resolvedTestType = testType || examConfig.test_type || questions[0]?.test_type || 'lesen';
  const maxTeile = getMaxTeile(questions, resolvedTestType);
  const ActiveTeilRenderer = TEIL_RENDERERS[resolvedTestType] || ModuleTaskView;
  const answerSheet = useAnswerSheet(questions, session, resolvedTestType);
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false);
  useExamFontSize();
  useExamScrollSync(session, maxTeile);
  useExamHotkeys({ questions, currentQuestion: answerSheet.currentQuestion, session, maxTeile, onSelectQuestion: answerSheet.selectQuestion });

  if (isLoading || questions.length === 0) {
    return <ExamLoadingSkeleton />;
  }

  const openSheet = () => { setHasOpenedSheet(true); answerSheet.setSheetOpen(true); };
  const submitFromSheet = () => { answerSheet.setSheetOpen(false); onOpenSubmitConfirm?.(); };
  const pagination = { activeTeil: session.activeTeil, maxTeile };
  const navActions = {
    onPreviousTeil: session.previousTeil,
    onNextTeil: () => session.nextTeil(maxTeile),
    onSubmit: onOpenSubmitConfirm,
    onExit: onExitInspection,
  };
  const flagState = { flags: session.flags || {}, toggleFlag: session.toggleFlag, isSubmitted: session.isSubmitted };

  return (
    <QuestionFlagProvider value={flagState}>
      <ExamToolbar
        navMode={HEADER_NAV_BY_MODULE[resolvedTestType] || 'strip'}
        sheet={answerSheet.sheet}
        activeTeil={session.activeTeil}
        onSelectTeil={session.selectTeil}
        onSelectQuestion={answerSheet.selectQuestion}
        currentQuestion={answerSheet.currentQuestion}
        timerSlot={isInspection ? null : <ExamTimer timer={timer} isSubmitted={session.isSubmitted} />}
      />

      {timer.isPaused && !session.isSubmitted && (
        <div role="status" className="p-3 rounded-xl bg-state-warning-subtle border border-state-warning-border text-sm text-state-warning-text">
          {t('timer.pausedNotice')}
        </div>
      )}

      {isInspection && (
        <InspectionInfoCard examTitle={examConfig.examTitle} examId={examConfig.examId || questions[0]?.exam_id} />
      )}

      <div className="min-h-[31.25rem] pb-24 lg:pb-0">
        <ActiveTeilRenderer activeTeil={session.activeTeil} questions={questions} session={session} sessionState={session} />
      </div>

      <ExamPageNav pagination={pagination} actions={navActions} isInspection={isInspection} showHotkeysHint={resolvedTestType === 'lesen'} />
      <ExamBottomNav
        pagination={pagination}
        actions={navActions}
        sheet={{ onOpen: openSheet, answered: answerSheet.sheet.answered, total: answerSheet.sheet.total }}
        isInspection={isInspection}
      />

      {hasOpenedSheet && (
        <Suspense fallback={null}>
          <AnswerSheetSheet
            isOpen={answerSheet.isSheetOpen}
            onClose={() => answerSheet.setSheetOpen(false)}
            sheet={answerSheet.sheet}
            onSelectQuestion={answerSheet.selectQuestion}
            onSubmit={submitFromSheet}
            isInspection={isInspection}
          />
        </Suspense>
      )}
    </QuestionFlagProvider>
  );
}
