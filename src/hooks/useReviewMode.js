import { useState, useCallback } from 'react';
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
import { recordIssuedSubmission } from '../services/storage/issuedAssignmentsStorage.js';
import { useLatestRef, useUrlToken, openLinkedExam } from './useUrlToken.js';

async function prepareReviewResults(decoded) {
  const resultData = await submitLocalExamAnswers(decoded.examId, {
    answers: decoded.answers,
    timeSpentSeconds: decoded.timeSpentSeconds,
  });

  return {
    results: resultData,
    answers: decoded.answers,
  };
}

// A result for an assignment issued from this browser updates its row in «Issued assignments».
function recordSubmission(decoded, results, token) {
  recordIssuedSubmission(decoded.assignmentId, {
    studentName: decoded.studentName || null,
    score: results?.score ?? null,
    maxScore: results?.maxScore ?? null,
    submittedAt: decoded.createdAt || null,
    reviewToken: token,
  });
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
  const deps = useLatestRef({ loader, session, navigateTo, showError });

  const handleReviewToken = useCallback(async (token) => {
    const { loader, session, navigateTo, showError } = deps.current;
    const decoded = await decodeAttemptToken(token);
    if (!decoded?.examId) {
      showError?.('errors.invalidReviewLink');
      clearReviewTokenFromUrl();
      return;
    }

    try {
      await openLinkedExam(loader, decoded);

      const reviewPayload = await prepareReviewResults(decoded);
      session?.loadPastAttempt(reviewPayload);
      recordSubmission(decoded, reviewPayload.results, token);

      setDecodedAttempt(decoded);
      const verificationStatus = await evaluateSignature(decoded, getStoredTeacherKey());

      setReviewInfo({
        studentName: decoded.studentName,
        createdAt: decoded.createdAt,
        timeSpentSeconds: decoded.timeSpentSeconds,
        assignmentId: decoded.assignmentId || null,
        verificationStatus,
      });

      navigateTo?.('results');
    } catch (error) {
      console.warn('[useReviewMode] Failed to process review token:', error);
      showError?.('errors.invalidReviewLink');
      clearReviewTokenFromUrl();
    }
  }, [deps]);

  const { openToken: processReviewToken, forgetToken } = useUrlToken(parseReviewTokenFromUrl, handleReviewToken);

  const exitReview = useCallback(() => {
    forgetToken();
    clearReviewTokenFromUrl();
    setReviewInfo(null);
    setDecodedAttempt(null);
    deps.current.session?.resetSession();
    deps.current.navigateTo?.('welcome');
  }, [deps, forgetToken]);

  const verifyWithCustomKey = useCallback(async (customKey) => {
    if (!decodedAttempt) return false;
    setTeacherKey(customKey);
    const verificationStatus = await evaluateSignature(decodedAttempt, customKey);
    setReviewInfo((prev) => (prev ? { ...prev, verificationStatus } : prev));
    return verificationStatus === 'valid';
  }, [decodedAttempt]);

  return {
    isTeacherReview: Boolean(reviewInfo),
    reviewStudentName: reviewInfo?.studentName || null,
    reviewInfo,
    verifyWithCustomKey,
    exitReview,
    processReviewToken,
  };
}
