import { useState, useCallback, useEffect, useRef } from 'react';
import {
  parseReviewTokenFromUrl,
  decodeAttemptToken,
  clearReviewTokenFromUrl,
} from '../services/shareTokenService.js';
import { submitLocalExamAnswers } from '../services/localDataService.js';

function prepareReviewResults(decoded) {
  const resultData = submitLocalExamAnswers(decoded.examId, {
    answers: decoded.answers,
    timeSpentSeconds: decoded.timeSpentSeconds,
  });

  return {
    results: resultData,
    answers: decoded.answers,
  };
}

export function useReviewMode({ loader, session, navigateTo, showError } = {}) {
  const [reviewInfo, setReviewInfo] = useState(null);
  const processedTokenRef = useRef(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const navigateToRef = useRef(navigateTo);
  navigateToRef.current = navigateTo;
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const exitReview = useCallback(() => {
    processedTokenRef.current = null;
    clearReviewTokenFromUrl();
    setReviewInfo(null);
    sessionRef.current?.resetSession();
    navigateToRef.current?.('welcome');
  }, []);

  const processReviewToken = useCallback(async (token) => {
    if (!token || processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    const decoded = decodeAttemptToken(token);
    if (!decoded?.examId) {
      showErrorRef.current?.('errors.invalidReviewLink');
      clearReviewTokenFromUrl();
      return;
    }

    try {
      await loaderRef.current?.loadExamById(decoded.examId);
      loaderRef.current?.selectExam(decoded.examId);

      const reviewPayload = prepareReviewResults(decoded);
      sessionRef.current?.loadPastAttempt(reviewPayload);

      setReviewInfo({
        studentName: decoded.studentName,
        createdAt: decoded.createdAt,
        timeSpentSeconds: decoded.timeSpentSeconds,
      });

      navigateToRef.current?.('results');
    } catch (error) {
      console.warn('[useReviewMode] Failed to process review token:', error);
      showErrorRef.current?.('errors.invalidReviewLink');
      clearReviewTokenFromUrl();
    }
  }, []);

  useEffect(() => {
    const handleUrlToken = () => {
      const token = parseReviewTokenFromUrl();
      if (token && processedTokenRef.current !== token) {
        processReviewToken(token);
      }
    };

    handleUrlToken();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleUrlToken);
      return () => window.removeEventListener('hashchange', handleUrlToken);
    }
  }, [processReviewToken]);

  return {
    isTeacherReview: Boolean(reviewInfo),
    reviewStudentName: reviewInfo?.studentName || null,
    exitReview,
  };
}
