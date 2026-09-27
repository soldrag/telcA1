import { useEffect } from 'react';
import { preloadExamGrading } from '../services/examService.js';

const IDLE_FALLBACK_DELAY_MS = 2000;

/** Once per exam screen, when the browser is idle: the grading chunk and dictionaries reach the offline cache. */
export function useGradingPreload(isEnabled) {
  useEffect(() => {
    if (!isEnabled) return undefined;
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => preloadExamGrading());
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => preloadExamGrading(), IDLE_FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);
}
