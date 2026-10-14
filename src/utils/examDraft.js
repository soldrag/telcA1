/**
 * @typedef {object} ExamDraft  an exam in progress, kept so a reload does not lose it
 * @property {string} examId
 * @property {Record<string, *>} answers
 * @property {number} activeTeil
 * @property {number} activeQuestionIndex
 * @property {boolean} isTimed
 * @property {number} totalSeconds
 * @property {number} secondsLeft     timer reading at `savedAt` (timed exam)
 * @property {number} secondsElapsed  timer reading at `savedAt` (practice without a timer)
 * @property {boolean} isPaused
 * @property {number} savedAt         epoch milliseconds
 */

/** Captures the running exam; the timer reading is stamped with `now` so closed time can be counted later. */
export function buildExamDraft({ examId, session, timer }, now = Date.now()) {
  return {
    examId,
    answers: session.answers,
    activeTeil: session.activeTeil,
    activeQuestionIndex: session.activeQuestionIndex,
    isTimed: timer.isTimed,
    totalSeconds: timer.totalSeconds,
    secondsLeft: timer.secondsLeft,
    secondsElapsed: timer.secondsElapsed,
    isPaused: timer.isPaused,
    savedAt: now,
  };
}

/** A stored value is a usable draft only if every field the restore reads has the expected type. */
export function isExamDraft(value) {
  if (!value || typeof value !== 'object') return false;
  const numbersAreValid = ['activeTeil', 'activeQuestionIndex', 'totalSeconds', 'secondsLeft', 'secondsElapsed', 'savedAt']
    .every((key) => Number.isFinite(value[key]));
  return typeof value.examId === 'string' && value.examId !== ''
    && Boolean(value.answers) && typeof value.answers === 'object'
    && typeof value.isTimed === 'boolean'
    && numbersAreValid;
}

/**
 * The timer reading to resume with. A timed exam keeps running while the page is closed, as in the real exam,
 * unless it was paused; practice without a timer only counts the time that was on screen.
 */
export function resolveDraftTimer(draft, now = Date.now()) {
  const closedSeconds = draft.isPaused ? 0 : Math.max(0, Math.floor((now - draft.savedAt) / 1000));
  const secondsLeft = draft.isTimed ? Math.max(0, draft.secondsLeft - closedSeconds) : draft.totalSeconds - draft.secondsElapsed;
  return {
    isTimed: draft.isTimed,
    totalSeconds: draft.totalSeconds,
    secondsLeft,
  };
}
