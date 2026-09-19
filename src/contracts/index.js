/**
 * Formal interface contracts for telc A1 core ports and adapters.
 * Used by build-time validators to prevent contract regression.
 */

export const timerContract = {
  name: 'timerContract',
  requiredMethods: [
    'resetTimer',
    'togglePause',
    'pauseTimer',
    'resumeTimer',
    'startTimer',
    'registerTimeUpHandler',
  ],
  requiredProperties: [
    'isTimed',
    'totalSeconds',
    'secondsLeft',
    'secondsElapsed',
    'isPaused',
  ],
};

export const sessionContract = {
  name: 'sessionContract',
  requiredMethods: [
    'resetSession',
    'selectAnswer',
    'selectTeil',
    'nextTeil',
    'previousTeil',
    'jumpToQuestion',
    'clearScrollTarget',
    'submitCurrentExam',
    'retakeMistakes',
    'loadPastAttempt',
  ],
  requiredProperties: [
    'answers',
    'activeTeil',
    'activeQuestionIndex',
    'isSubmitted',
    'isSubmitting',
    'results',
    'scrollTargetId',
    'isInspection',
  ],
};

export const loaderContract = {
  name: 'loaderContract',
  requiredMethods: ['loadExamById', 'selectExam', 'changeTestType'],
  requiredProperties: [
    'exams',
    'testTypes',
    'activeTestType',
    'currentExamId',
    'examData',
    'isLoadingExam',
  ],
};

export const assignmentContract = {
  name: 'assignmentContract',
  requiredMethods: [
    'startAssignment',
    'finalizeAssignment',
    'exitAssignment',
    'processToken',
  ],
  requiredProperties: ['isAssignmentMode', 'assignmentData', 'lockoutState'],
};

export const screenContracts = {
  assignment: ['isAssignmentMode', 'assignmentData', 'lockoutState', 'onStart', 'onExit'],
  welcome: ['examState', 'navigation', 'actions', 'onOpenCreateAssignment', 'onProcessReview', 'onOpenTask'],
  exam: ['isLoading', 'examConfig', 'session', 'timer', 'onOpenSubmitConfirm', 'isInspection', 'onExitInspection'],
  results: ['results', 'onResetExam', 'onRetakeMistakes', 'onOpenHistory', 'onShareResult', 'isTeacherReview', 'onExitReview', 'assignmentSubmission'],
  history: ['navigation', 'actions', 'state'],
};
