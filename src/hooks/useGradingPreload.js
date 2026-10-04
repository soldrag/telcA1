import { useEffect } from 'react';
import { preloadExamGrading } from '../services/examService.js';

const IDLE_FALLBACK_DELAY_MS = 2000;

/** Once per exam screen, when the browser is idle: the grading chunk and dictionaries reach the offline cache. */
export function useGradingPreload(isEnabled, testType = 'schreiben') {
  useEffect(() => {
    if (!isEnabled || testType !== 'schreiben') return undefined;
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => preloadExamGrading(testType));
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => preloadExamGrading(testType), IDLE_FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled, testType]);
}
