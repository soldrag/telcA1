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
    user: {
      userShortId: 'Локально',
    },
  };
}

export function buildScreenProps(controller) {
  const questions = controller.examData?.questions || [];
  const activeType = controller.examData?.exam?.test_type || controller.activeTestType;

  return {
    welcome: {
      examState: {
        exams: controller.exams,
        testTypes: controller.testTypes,
        activeTestType: controller.activeTestType,
        currentExamId: controller.currentExamId,
        recentAttempts: controller.history.recentAttempts,
      },
      navigation: {
        onOpenHistory: controller.openHistory,
      },
      actions: {
        onSelectTestType: controller.changeTestType,
        onSelectExam: controller.selectExam,
        onStartExam: controller.startExam,
        onStartRandomExam: controller.startRandomExam,
        onLoadAttempt: controller.loadSavedAttempt,
      },
    },
    history: {
      navigation: {
        onBack: () => controller.navigateTo('welcome'),
      },
      actions: {
        onLoadAttempt: controller.loadSavedAttempt,
        onStartExam: controller.startExam,
        onClearHistory: controller.history.clearHistory,
        onRefresh: controller.history.refreshHistory,
      },
      state: {
        attempts: controller.history.historyAttempts,
        loading: controller.history.historyLoading,
      },
    },
    results: {
      results: controller.session.results,
      onResetExam: controller.resetExam,
      onRetakeMistakes: controller.retakeMistakes,
      onOpenHistory: controller.openHistory,
    },
    exam: {
      examConfig: {
        testType: activeType,
        questions,
      },
      session: controller.session,
      timer: { ...controller.timer, onTimeUp: controller.handleTimeUp },
      onOpenSubmitConfirm: controller.modals.openSubmitModal,
    },
  };
}
