import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_TIME_LIMIT_SECONDS = 25 * 60;

// Ticks once a second and resyncs when the tab becomes visible again (background tabs throttle intervals).
function subscribeWallClockTick(sync) {
  const intervalId = setInterval(sync, 1000);
  const hasDocument = typeof document !== 'undefined';
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') sync();
  };
  if (hasDocument) document.addEventListener('visibilitychange', handleVisibility);
  return () => {
    clearInterval(intervalId);
    if (hasDocument) document.removeEventListener('visibilitychange', handleVisibility);
  };
}

export function useExamTimer({ initialSeconds = DEFAULT_TIME_LIMIT_SECONDS, isSubmitted = false, isRunning = true } = {}) {
  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timeUpHandlerRef = useRef(null);
  const endsAtRef = useRef(null);
  const startedAtRef = useRef(null);

  const registerTimeUpHandler = useCallback((handler) => {
    timeUpHandlerRef.current = handler;
  }, []);

  const resetTimer = useCallback((timed = true, newDurationSeconds, initialSecondsLeft) => {
    const targetSeconds = newDurationSeconds ?? DEFAULT_TIME_LIMIT_SECONDS;
    const effectiveSecondsLeft = initialSecondsLeft ?? targetSeconds;
    setTotalSeconds(targetSeconds);
    setIsTimed(Boolean(timed));
    setSecondsLeft(effectiveSecondsLeft);
    setSecondsElapsed(Math.max(0, targetSeconds - effectiveSecondsLeft));
    setIsPaused(false);
    endsAtRef.current = Date.now() + effectiveSecondsLeft * 1000;
    startedAtRef.current = Date.now() - (targetSeconds - effectiveSecondsLeft) * 1000;
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((previousState) => !previousState);
  }, []);

  useEffect(() => {
    if (!isRunning || isSubmitted || isPaused) return undefined;

    if (!isTimed) {
      startedAtRef.current = Date.now() - secondsElapsed * 1000;
      return subscribeWallClockTick(() => {
        setSecondsElapsed(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
      });
    }

    endsAtRef.current = Date.now() + secondsLeft * 1000;
    return subscribeWallClockTick(() => {
      const left = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) timeUpHandlerRef.current?.();
    });
  }, [isRunning, isTimed, isPaused, isSubmitted]);

  return {
    isTimed,
    totalSeconds,
    secondsLeft,
    secondsElapsed,
    isPaused,
    togglePause,
    resetTimer,
    registerTimeUpHandler,
  };
}
