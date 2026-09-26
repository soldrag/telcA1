import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_TIME_LIMIT_SECONDS = 25 * 60;

export function useExamTimer(options = DEFAULT_TIME_LIMIT_SECONDS) {
  const configuration = typeof options === 'number' ? { initialSeconds: options } : (options || {});
  const {
    initialSeconds = DEFAULT_TIME_LIMIT_SECONDS,
    onTimeUp = null,
    isSubmitted = false,
    isRunning = true,
  } = configuration;

  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timeUpHandlerRef = useRef(onTimeUp);
  const endTimeRef = useRef(null);
  const startElapsedRef = useRef(null);

  useEffect(() => {
    timeUpHandlerRef.current = onTimeUp;
  }, [onTimeUp]);

  const registerTimeUpHandler = useCallback((handler) => {
    timeUpHandlerRef.current = handler;
  }, []);

  const resetTimer = useCallback((timed = true, newDurationSeconds, initialSecondsLeft) => {
    const targetSeconds = newDurationSeconds ?? DEFAULT_TIME_LIMIT_SECONDS;
    setTotalSeconds(targetSeconds);
    setIsTimed(Boolean(timed));
    const effectiveSecondsLeft = initialSecondsLeft !== undefined ? initialSecondsLeft : targetSeconds;
    setSecondsLeft(effectiveSecondsLeft);
    const elapsed = Math.max(0, targetSeconds - effectiveSecondsLeft);
    setSecondsElapsed(elapsed);
    setIsPaused(false);
    endTimeRef.current = Date.now() + effectiveSecondsLeft * 1000;
    startElapsedRef.current = Date.now() - elapsed * 1000;
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((previousState) => !previousState);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const startTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isRunning || isSubmitted || isPaused) {
      endTimeRef.current = null;
      startElapsedRef.current = null;
      return;
    }

    if (!isTimed) {
      startElapsedRef.current = Date.now() - secondsElapsed * 1000;
      const syncElapsed = () => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startElapsedRef.current) / 1000));
        setSecondsElapsed(elapsed);
      };

      const intervalId = setInterval(syncElapsed, 1000);
      const handleVisibility = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          syncElapsed();
        }
      };
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibility);
      }
      return () => {
        clearInterval(intervalId);
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', handleVisibility);
        }
      };
    }

    endTimeRef.current = Date.now() + secondsLeft * 1000;
    const syncRemaining = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      if (left <= 0) {
        setSecondsLeft(0);
        timeUpHandlerRef.current?.();
      } else {
        setSecondsLeft(left);
      }
    };

    const intervalId = setInterval(syncRemaining, 1000);
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncRemaining();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }
    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [isRunning, isTimed, isPaused, isSubmitted]);

  return {
    isTimed,
    totalSeconds,
    secondsLeft,
    secondsElapsed,
    isPaused,
    togglePause,
    pauseTimer,
    resumeTimer,
    startTimer,
    resetTimer,
    registerTimeUpHandler,
  };
}
