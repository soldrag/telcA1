/**
 * Pure builders for assembling Screen and Header DTOs.
 * Isolates presentation configuration from the main App component.
 */

export function buildHeaderConfig(controller) {
  const currentModule = controller.testTypes.find((item) => item.id === controller.activeTestType) || {
    title: 'Lesen',
    maxScore: 15,
  };
  const questionsCount = controller.examData?.questions?.length || 0;

  return {
    navigation: {
      screen: controller.screen,
      onNavigateHome: controller.navigateHome,
      onOpenHistory: controller.openHistory,
      onResetExam: controller.resetExam,
      onSubmitExam: controller.modals.openSubmitModal,
    },
    stats: {
      answeredCount: controller.session.answeredCount,
      totalQuestions: questionsCount,
      activeModuleTitle: currentModule.title,
      activeModulePoints: currentModule.maxScore || 15,
    },
    user: { userShortId: 'local' },
  };
}

function buildWelcomeProps(controller) {
  return {
    examState: {
      exams: controller.exams,
      testTypes: controller.testTypes,
      activeTestType: controller.activeTestType,
      currentExamId: controller.currentExamId,
      recentAttempts: controller.history.recentAttempts,
    },
    navigation: { onOpenHistory: controller.openHistory },
    actions: {
      onSelectTestType: controller.changeTestType,
      onSelectExam: controller.selectExam,
      onStartExam: controller.startExam,
      onStartRandomExam: controller.startRandomExam,
      onLoadAttempt: controller.loadSavedAttempt,
      onShareAttempt: controller.modals.openShareModal,
    },
  };
}

function buildHistoryProps(controller) {
  return {
    navigation: { onBack: () => controller.navigateTo('welcome') },
    actions: {
      onLoadAttempt: controller.loadSavedAttempt,
      onStartExam: controller.startExam,
      onClearHistory: controller.history.clearHistory,
      onRefresh: controller.history.refreshHistory,
      onShareAttempt: controller.modals.openShareModal,
    },
    state: {
      attempts: controller.history.historyAttempts,
      loading: controller.history.historyLoading,
    },
  };
}

function createSharePayload(controller) {
  const res = controller.session.results;
  if (!res) return undefined;
  return () => controller.modals.openShareModal({
    exam_id: controller.currentExamId || res.exam?.id,
    test_type: res.exam?.test_type || controller.activeTestType,
    answers: controller.session.answers,
    time_spent_seconds: res.timeSpentSeconds,
    created_at: new Date().toISOString(),
    score: res.score,
    total_questions: res.totalQuestions,
  });
}

function buildResultsProps(controller) {
  return {
    results: controller.session.results,
    onResetExam: controller.resetExam,
    onRetakeMistakes: controller.retakeMistakes,
    onOpenHistory: controller.openHistory,
    onShareResult: createSharePayload(controller),
    isTeacherReview: controller.reviewMode?.isTeacherReview || false,
    reviewStudentName: controller.reviewMode?.reviewStudentName || null,
    onExitReview: controller.reviewMode?.exitReview,
    onUpdateItemScore: controller.session.updateItemScore,
  };
}

function buildExamProps(controller) {
  const questions = controller.examData?.questions || [];
  const activeType = controller.examData?.exam?.test_type || controller.activeTestType;
  return {
    isLoading: controller.isLoadingExam,
    examConfig: { testType: activeType, questions },
    session: controller.session,
    timer: { ...controller.timer, onTimeUp: controller.handleTimeUp },
    onOpenSubmitConfirm: controller.modals.openSubmitModal,
  };
}

export function buildScreenProps(controller) {
  return {
    welcome: buildWelcomeProps(controller),
    history: buildHistoryProps(controller),
    results: buildResultsProps(controller),
    exam: buildExamProps(controller),
  };
}
