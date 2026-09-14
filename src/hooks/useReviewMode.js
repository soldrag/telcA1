import { useState, useCallback, useEffect, useRef } from 'react';
import {
  parseReviewTokenFromUrl,
  decodeAttemptToken,
  clearReviewTokenFromUrl,
} from '../services/shareTokenService.js';
import { submitLocalExamAnswers } from '../services/localDataService.js';
import {
  getStoredTeacherKey,
  verifyAssignmentSignature,
  setTeacherKey,
} from '../services/security/teacherSecurityService.js';

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

async function evaluateSignature(decoded, teacherKey) {
  if (!decoded?.assignmentId || !decoded?.teacherSignature || !teacherKey) {
    return decoded?.assignmentId ? 'unverified' : 'none';
  }
  const payloadToVerify = {
    aid: decoded.assignmentId,
    eid: decoded.examId,
    created: decoded.assignmentCreatedAt,
    limit: decoded.assignmentTimeLimit ?? 0,
    student: decoded.studentName,
  };
  const isValid = await verifyAssignmentSignature(
    payloadToVerify,
    decoded.teacherSignature,
    teacherKey
  );
  return isValid ? 'valid' : 'invalid';
}

export function useReviewMode({ loader, session, navigateTo, showError } = {}) {
  const [reviewInfo, setReviewInfo] = useState(null);
  const [decodedAttempt, setDecodedAttempt] = useState(null);
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
    setDecodedAttempt(null);
    sessionRef.current?.resetSession();
    navigateToRef.current?.('welcome');
  }, []);

  const processReviewToken = useCallback(async (token) => {
    if (!token || processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    const decoded = await decodeAttemptToken(token);
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

      setDecodedAttempt(decoded);
      const verificationStatus = await evaluateSignature(decoded, getStoredTeacherKey());

      setReviewInfo({
        studentName: decoded.studentName,
        createdAt: decoded.createdAt,
        timeSpentSeconds: decoded.timeSpentSeconds,
        assignmentId: decoded.assignmentId || null,
        telemetry: decoded.telemetry || null,
        verificationStatus,
      });

      navigateToRef.current?.('results');
    } catch (error) {
      console.warn('[useReviewMode] Failed to process review token:', error);
      showErrorRef.current?.('errors.invalidReviewLink');
      clearReviewTokenFromUrl();
    }
  }, []);

  const verifyWithCustomKey = useCallback(async (customKey) => {
    if (!decodedAttempt) return false;
    setTeacherKey(customKey);
    const verificationStatus = await evaluateSignature(decodedAttempt, customKey);
    setReviewInfo((prev) => (prev ? { ...prev, verificationStatus } : prev));
    return verificationStatus === 'valid';
  }, [decodedAttempt]);

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
    reviewInfo,
    verifyWithCustomKey,
    exitReview,
    processReviewToken,
  };
}
