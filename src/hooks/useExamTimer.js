import { useState, useCallback } from 'react';

export function useExamTimer(initialTotalSeconds = 25 * 60) {
  const [isTimed, setIsTimed] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialTotalSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const resetTimer = useCallback((timed = true, newSeconds) => {
    const sec = newSeconds || totalSeconds;
    if (newSeconds) setTotalSeconds(newSeconds);
    setIsTimed(timed);
    setSecondsLeft(sec);
    setSecondsElapsed(0);
    setIsPaused(false);
  }, [totalSeconds]);

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
    resetTimer,
  };
}
