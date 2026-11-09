import { useState, useCallback } from 'react';
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
import { saveReceivedAssignment, recordReceivedAssignmentResult } from '../services/storage/receivedAssignmentsStorage.js';
import { calculateAssignmentTimerState } from '../services/assignment/assignmentTimerService.js';
import { buildShareUrl } from '../services/shareTokenService.js';
import { useLatestRef, useUrlToken, openLinkedExam } from './useUrlToken.js';

export function useAssignmentMode({ loader, session, timer, navigateTo, showError } = {}) {
  const [assignmentData, setAssignmentData] = useState(null);
  const [lockoutState, setLockoutState] = useState(null);
  const deps = useLatestRef({ loader, session, timer, navigateTo, showError });

  const handleAssignmentToken = useCallback(async (token) => {
    const decoded = await decodeAssignmentToken(token);
    if (!decoded?.examId) {
      deps.current.showError?.('errors.invalidAssignmentLink');
      clearAssignmentTokenFromUrl();
      return;
    }

    setAssignmentData(decoded);
    saveReceivedAssignment(decoded, token);
    const existingState = getAssignmentState(decoded.assignmentId);
    setLockoutState(existingState);
    await openLinkedExam(deps.current.loader, decoded);
  }, [deps]);

  const { openToken: processToken, forgetToken } = useUrlToken(parseAssignmentTokenFromUrl, handleAssignmentToken);

  const ensureExamLoaded = useCallback(async (examId) => {
    const { loader } = deps.current;
    if (loader?.examData?.exam?.id !== examId) {
      await loader?.loadExamById(examId);
    }
  }, [deps]);

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

    deps.current.session?.resetSession();
    deps.current.timer?.resetTimer(
      timerState.isTimed,
      timerState.totalSeconds,
      timerState.remainingSeconds
    );

    deps.current.navigateTo?.('exam');
  }, [assignmentData, lockoutState, ensureExamLoaded, deps]);

  const finalizeAssignment = useCallback(async (attempt) => {
    if (!assignmentData) return null;
    const enrichedAttempt = {
      ...attempt,
      exam_id: assignmentData.examId,
      test_type: assignmentData.testType,
      assignment_id: assignmentData.assignmentId,
      teacher_signature: assignmentData.signature,
      assignment_created_at: assignmentData.createdAt,
      assignment_time_limit: assignmentData.timeLimitSeconds,
    };

    const shareUrl = await buildShareUrl({
      attempt: enrichedAttempt,
      studentName: assignmentData.studentName,
    });

    const submitted = recordAssignmentSubmitted(assignmentData.assignmentId, { shareUrl });
    setLockoutState(submitted);
    recordReceivedAssignmentResult(assignmentData.assignmentId, attempt);
    return shareUrl;
  }, [assignmentData]);

  const exitAssignment = useCallback(() => {
    forgetToken();
    clearAssignmentTokenFromUrl();
    setAssignmentData(null);
    setLockoutState(null);
    deps.current.session?.resetSession();
    deps.current.navigateTo?.('welcome');
  }, [deps, forgetToken]);

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
