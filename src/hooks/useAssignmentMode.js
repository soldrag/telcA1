import { useState, useCallback, useEffect, useRef } from 'react';
import {
  parseAssignmentTokenFromUrl,
  decodeAssignmentToken,
  clearAssignmentTokenFromUrl,
} from '../services/assignmentTokenService.js';
import {
  getAssignmentState,
  recordAssignmentStarted,
  recordAssignmentSubmitted,
} from '../services/storage/assignmentLockoutStorage.js';
import { calculateAssignmentTimerState } from '../services/assignment/assignmentTimerService.js';
import { createSessionTelemetryTracker } from '../services/telemetry/sessionTelemetryTracker.js';
import { buildShareUrl } from '../services/shareTokenService.js';

export function useAssignmentMode({ loader, session, timer, navigateTo, showError } = {}) {
  const [assignmentData, setAssignmentData] = useState(null);
  const [lockoutState, setLockoutState] = useState(null);
  const trackerRef = useRef(null);
  const processedTokenRef = useRef(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const timerRef = useRef(timer);
  timerRef.current = timer;
  const navigateToRef = useRef(navigateTo);
  navigateToRef.current = navigateTo;
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const processToken = useCallback(async (token) => {
    if (!token || processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    const decoded = await decodeAssignmentToken(token);
    if (!decoded?.examId) {
      showErrorRef.current?.('errors.invalidAssignmentLink');
      clearAssignmentTokenFromUrl();
      return;
    }

    setAssignmentData(decoded);
    const existingState = getAssignmentState(decoded.assignmentId);
    setLockoutState(existingState);

    if (decoded.testType && loaderRef.current?.changeTestType) {
      loaderRef.current.changeTestType(decoded.testType);
    }
    await loaderRef.current?.loadExamById(decoded.examId);
    loaderRef.current?.selectExam(decoded.examId);
  }, []);

  const ensureExamLoaded = useCallback(async (examId) => {
    const currentData = loaderRef.current?.examData;
    if (currentData?.exam?.id !== examId) {
      await loaderRef.current?.loadExamById(examId);
    }
  }, []);

  const startAssignment = useCallback(async () => {
    if (!assignmentData || lockoutState?.status === 'submitted') return;

    await ensureExamLoaded(assignmentData.examId);

    const started = recordAssignmentStarted(assignmentData.assignmentId, {
      examId: assignmentData.examId,
    });
    setLockoutState(started);

    const timerState = calculateAssignmentTimerState({
      timeLimitSeconds: assignmentData.timeLimitSeconds,
      startedAt: started?.startedAt,
    });

    sessionRef.current?.resetSession();
    timerRef.current?.resetTimer(
      timerState.isTimed,
      timerState.totalSeconds,
      timerState.remainingSeconds
    );

    const tracker = createSessionTelemetryTracker({ initialStartedAt: started?.startedAt });
    tracker.start();
    trackerRef.current = tracker;

    navigateToRef.current?.('exam');
  }, [assignmentData, lockoutState, ensureExamLoaded]);

  const finalizeAssignment = useCallback(async (attempt) => {
    if (!assignmentData) return null;
    trackerRef.current?.stop();
    const telemetry = trackerRef.current?.getSummary() || null;

    const enrichedAttempt = {
      ...attempt,
      exam_id: assignmentData.examId,
      test_type: assignmentData.testType,
      assignment_id: assignmentData.assignmentId,
      teacher_signature: assignmentData.signature,
      assignment_created_at: assignmentData.createdAt,
      assignment_time_limit: assignmentData.timeLimitSeconds,
      telemetry,
    };

    const shareUrl = await buildShareUrl({
      attempt: enrichedAttempt,
      studentName: assignmentData.studentName,
    });

    const submitted = recordAssignmentSubmitted(assignmentData.assignmentId, {
      shareUrl,
      telemetry,
    });
    setLockoutState(submitted);
    return shareUrl;
  }, [assignmentData]);

  const exitAssignment = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    processedTokenRef.current = null;
    clearAssignmentTokenFromUrl();
    setAssignmentData(null);
    setLockoutState(null);
    sessionRef.current?.resetSession();
    navigateToRef.current?.('welcome');
  }, []);

  useEffect(() => {
    const handleUrl = () => {
      const token = parseAssignmentTokenFromUrl();
      if (token && processedTokenRef.current !== token) {
        processToken(token);
      }
    };
    handleUrl();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleUrl);
      return () => window.removeEventListener('hashchange', handleUrl);
    }
  }, [processToken]);

  return {
    isAssignmentMode: Boolean(assignmentData),
    assignmentData,
    lockoutState,
    startAssignment,
    finalizeAssignment,
    exitAssignment,
    processToken,
  };
}
