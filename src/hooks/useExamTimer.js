import { useState, useCallback, useEffect } from 'react';

export function useExamTimer(options = 25 * 60) {
  const config = typeof options === 'number' ? { initialSeconds: options } : (options || {});
  const { initialSeconds = 25 * 60, onTimeUp = null, isSubmitted = false } = config;

  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeUpHandler, setTimeUpHandler] = useState(() => onTimeUp);

  const resetTimer = useCallback((timed = true, newSeconds) => {
    const sec = newSeconds || totalSeconds;
    if (newSeconds) setTotalSeconds(newSeconds);
    setIsTimed(timed);
    setSecondsLeft(sec);
    setSecondsElapsed(0);
    setIsPaused(false);
  }, [totalSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const registerTimeUpHandler = useCallback((handler) => {
    setTimeUpHandler(() => handler);
  }, []);

  useEffect(() => {
    if (isSubmitted || isPaused) return;

    if (!isTimed) {
      const interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (secondsLeft <= 0) {
      if (timeUpHandler) timeUpHandler();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (timeUpHandler) timeUpHandler();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimed, isPaused, isSubmitted, secondsLeft, timeUpHandler]);

  return {
    isTimed,
    setIsTimed,
    totalSeconds,
    secondsLeft,
    setSecondsLeft,
    secondsElapsed,
    setSecondsElapsed,
    isPaused,
    setIsPaused,
    togglePause,
    resetTimer,
    registerTimeUpHandler,
  };
}
