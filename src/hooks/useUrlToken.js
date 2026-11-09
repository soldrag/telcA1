import { useCallback, useEffect, useRef } from 'react';

/** Mirrors the latest value in a ref, so stable callbacks read current dependencies. */
export function useLatestRef(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** Opens the exam a link points to: switches to its module, then loads and selects the exam. */
export async function openLinkedExam(loader, { examId, testType }) {
  if (testType) loader?.changeTestType?.(testType);
  await loader?.loadExamById(examId);
  loader?.selectExam(examId);
}

/**
 * Hands each new token from the URL to `handleToken` once: on mount, on every hash change,
 * and through `openToken` (a link pasted by hand). `forgetToken` lets the same link be opened again.
 * `handleToken` must be stable (useCallback with no changing dependencies).
 */
export function useUrlToken(parseToken, handleToken) {
  const processedTokenRef = useRef(null);

  const openToken = useCallback(async (token) => {
    if (!token || processedTokenRef.current === token) return;
    processedTokenRef.current = token;
    await handleToken(token);
  }, [handleToken]);

  const forgetToken = useCallback(() => {
    processedTokenRef.current = null;
  }, []);

  useEffect(() => {
    const openTokenFromUrl = () => openToken(parseToken());
    openTokenFromUrl();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('hashchange', openTokenFromUrl);
    return () => window.removeEventListener('hashchange', openTokenFromUrl);
  }, [parseToken, openToken]);

  return { openToken, forgetToken };
}
