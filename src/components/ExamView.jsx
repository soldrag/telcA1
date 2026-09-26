import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import ExamTimer from './ExamTimer.jsx';
import ModuleTaskView from './parts/ModuleTaskView.jsx';
import ExamBottomNav from './exam/ExamBottomNav.jsx';
import ExamToolbar from './exam/ExamToolbar.jsx';
import AnswerSheetGrid from './exam/AnswerSheetGrid.jsx';
import FontSizeControl from './teil1/FontSizeControl.jsx';
import { QuestionFlagProvider } from './exam/QuestionFlag.jsx';
import InspectionInfoCard from './exam/InspectionInfoCard.jsx';
import LesenTeilRenderer from './exam/LesenTeilRenderer.jsx';
import SchreibenTeilRenderer from './schreiben/SchreibenTeilRenderer.jsx';
import ExamLoadingSkeleton from './exam/ExamLoadingSkeleton.jsx';
import { scrollToElement, scrollToTop } from '../utils/scrollService.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useExamFontSize } from '../hooks/useExamFontSize.js';
import { useVisibleQuestion } from '../hooks/useVisibleQuestion.js';
import { getTeilGroups } from '../config/teilStructureConfig.js';
import { getTestTypeById } from '../../shared/testTypes.js';

const AnswerSheetSheet = lazy(() => import('./exam/AnswerSheetSheet.jsx'));

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

function useAnswerSheet(questions, session, testType) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const groups = useMemo(() => getTeilGroups(questions, testType), [questions, testType]);
  const teilIds = questions.filter((q) => q.teil === session.activeTeil).map((q) => String(q.id));
  const visibleId = useVisibleQuestion(teilIds);
  const currentQuestion = questions.find((q) => String(q.id) === visibleId);

  const selectQuestion = (question) => {
    setSheetOpen(false);
    session.selectTeil(question.teil);
    session.jumpToQuestion(questions.indexOf(question), question.id);
  };

  const sheet = {
    groups,
    answers: session.answers || {},
    flags: session.flags || {},
    currentQuestionId: currentQuestion?.id,
    answered: session.answeredCount ?? 0,
    total: questions.length,
  };
  return { sheet, currentQuestion, isSheetOpen, setSheetOpen, selectQuestion };
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

  if (isLoading || questions.length === 0) {
    return <ExamLoadingSkeleton />;
  }

  const openSheet = () => { setHasOpenedSheet(true); answerSheet.setSheetOpen(true); };
  const submitFromSheet = () => { answerSheet.setSheetOpen(false); onOpenSubmitConfirm?.(); };
  const flagState = { flags: session.flags || {}, toggleFlag: session.toggleFlag, isSubmitted: session.isSubmitted };

  return (
    <QuestionFlagProvider value={flagState}>
      <ExamToolbar
        groups={answerSheet.sheet.groups}
        activeTeil={session.activeTeil}
        answers={answerSheet.sheet.answers}
        onSelectTeil={session.selectTeil}
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

      <div className="hidden lg:flex items-center justify-between gap-4">
        <AnswerSheetGrid {...answerSheet.sheet} layout="strip" onSelect={answerSheet.selectQuestion} />
        <FontSizeControl />
      </div>

      <div className="min-h-[500px] pb-24">
        <ActiveTeilRenderer activeTeil={session.activeTeil} questions={questions} session={session} sessionState={session} />
      </div>

      <ExamBottomNav
        pagination={{ activeTeil: session.activeTeil, maxTeile }}
        actions={{
          onPreviousTeil: session.previousTeil,
          onNextTeil: () => session.nextTeil(maxTeile),
          onSubmit: onOpenSubmitConfirm,
          onExit: onExitInspection,
        }}
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
