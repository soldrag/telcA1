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
import { createSessionTelemetryTracker } from '../services/telemetry/sessionTelemetryTracker.js';
import { buildShareUrl } from '../services/shareTokenService.js';

export function useAssignmentMode({ loader, session, timer, navigateTo, showError } = {}) {
  const [assignmentData, setAssignmentData] = useState(null);
  const [lockoutState, setLockoutState] = useState(null);
  const trackerRef = useRef(null);
  const processedTokenRef = useRef(null);

  const processToken = useCallback(async (token) => {
    if (!token || processedTokenRef.current === token) return;
    processedTokenRef.current = token;

    const decoded = await decodeAssignmentToken(token);
    if (!decoded?.examId) {
      showError?.('errors.invalidAssignmentLink');
      clearAssignmentTokenFromUrl();
      return;
    }

    setAssignmentData(decoded);
    const existingState = getAssignmentState(decoded.assignmentId);
    setLockoutState(existingState);

    await loader?.loadExamById(decoded.examId);
    loader?.selectExam(decoded.examId);
  }, [loader, showError]);

  const startAssignment = useCallback(() => {
    if (!assignmentData) return;
    const started = recordAssignmentStarted(assignmentData.assignmentId, {
      examId: assignmentData.examId,
    });
    setLockoutState(started);

    const tracker = createSessionTelemetryTracker({ initialStartedAt: started?.startedAt });
    tracker.start();
    trackerRef.current = tracker;

    session?.resetSession();
    if (assignmentData.timeLimitSeconds > 0) {
      timer?.resetTimer(assignmentData.timeLimitSeconds);
      timer?.startTimer();
    } else {
      timer?.pauseTimer();
    }

    navigateTo?.('exam');
  }, [assignmentData, session, timer, navigateTo]);

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
    session?.resetSession();
    navigateTo?.('welcome');
  }, [session, navigateTo]);

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
