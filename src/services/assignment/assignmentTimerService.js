/**
 * Pure domain service for calculating assignment time and continuity.
 * Completely decoupled from React and browser APIs.
 */

function createUntimedState() {
  return {
    isTimed: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    elapsedSeconds: 0,
    isExpired: false,
  };
}

function createUnstartedState(totalSeconds) {
  return {
    isTimed: true,
    totalSeconds,
    remainingSeconds: totalSeconds,
    elapsedSeconds: 0,
    isExpired: false,
  };
}

function calculateElapsedState(totalSeconds, startedAt, now) {
  const startTimeMs = new Date(startedAt).getTime();
  const validStartTime = Number.isNaN(startTimeMs) ? now : startTimeMs;
  const elapsedSeconds = Math.max(0, Math.floor((now - validStartTime) / 1000));
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  return {
    isTimed: true,
    totalSeconds,
    remainingSeconds,
    elapsedSeconds,
    isExpired: remainingSeconds === 0,
  };
}

export function calculateAssignmentTimerState({
  timeLimitSeconds = 0,
  startedAt = null,
  now = Date.now(),
} = {}) {
  const totalSeconds = Math.max(0, Number(timeLimitSeconds) || 0);
  if (totalSeconds <= 0) {
    return createUntimedState();
  }
  if (!startedAt) {
    return createUnstartedState(totalSeconds);
  }
  return calculateElapsedState(totalSeconds, startedAt, now);
}
