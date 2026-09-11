import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_TIME_LIMIT_SECONDS = 25 * 60;

export function useExamTimer(options = DEFAULT_TIME_LIMIT_SECONDS) {
  const configuration = typeof options === 'number' ? { initialSeconds: options } : (options || {});
  const { initialSeconds = DEFAULT_TIME_LIMIT_SECONDS, onTimeUp = null, isSubmitted = false } = configuration;

  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timeUpHandlerRef = useRef(onTimeUp);
  useEffect(() => {
    timeUpHandlerRef.current = onTimeUp;
  }, [onTimeUp]);

  const registerTimeUpHandler = useCallback((handler) => {
    timeUpHandlerRef.current = handler;
  }, []);

  const resetTimer = useCallback((timed = true, newDurationSeconds) => {
    const targetSeconds = newDurationSeconds || DEFAULT_TIME_LIMIT_SECONDS;
    setTotalSeconds(targetSeconds);
    setIsTimed(timed);
    setSecondsLeft(targetSeconds);
    setSecondsElapsed(0);
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((previousState) => !previousState);
  }, []);

  useEffect(() => {
    if (isSubmitted || isPaused) return;

    if (!isTimed) {
      const intervalId = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          timeUpHandlerRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimed, isPaused, isSubmitted]);

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
