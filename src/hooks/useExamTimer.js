import { useState, useCallback, useEffect } from 'react';

const DEFAULT_TIME_LIMIT_SECONDS = 25 * 60;

export function useExamTimer(options = DEFAULT_TIME_LIMIT_SECONDS) {
  const configuration = typeof options === 'number' ? { initialSeconds: options } : (options || {});
  const { initialSeconds = DEFAULT_TIME_LIMIT_SECONDS, onTimeUp = null, isSubmitted = false } = configuration;

  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeUpHandler, setTimeUpHandler] = useState(() => onTimeUp);

  const resetTimer = useCallback((timed = true, newDurationSeconds) => {
    const targetSeconds = newDurationSeconds || totalSeconds;
    if (newDurationSeconds) setTotalSeconds(newDurationSeconds);
    setIsTimed(timed);
    setSecondsLeft(targetSeconds);
    setSecondsElapsed(0);
    setIsPaused(false);
  }, [totalSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused((previousState) => !previousState);
  }, []);

  const registerTimeUpHandler = useCallback((handler) => {
    setTimeUpHandler(() => handler);
  }, []);

  useEffect(() => {
    if (isSubmitted || isPaused) return;

    if (!isTimed) {
      const intervalId = setInterval(() => {
        setSecondsElapsed((previousSeconds) => previousSeconds + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }

    if (secondsLeft <= 0) {
      if (timeUpHandler) timeUpHandler();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(intervalId);
          if (timeUpHandler) timeUpHandler();
          return 0;
        }
        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimed, isPaused, isSubmitted, secondsLeft, timeUpHandler]);

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
