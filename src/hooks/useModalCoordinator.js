import { useState, useCallback } from 'react';

/**
 * Encapsulates modal dialog visibility state and controls.
 */
export function useModalCoordinator() {
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [timeUpModalOpen, setTimeUpModalOpen] = useState(false);
  const [shareModalAttempt, setShareModalAttempt] = useState(null);
  const [legalModalType, setLegalModalType] = useState(null);
  const [assignmentModalData, setAssignmentModalData] = useState(null);

  const openSubmitModal = useCallback(() => setConfirmSubmitOpen(true), []);
  const closeSubmitModal = useCallback(() => setConfirmSubmitOpen(false), []);
  const openLeaveModal = useCallback(() => setConfirmLeaveOpen(true), []);
  const closeLeaveModal = useCallback(() => setConfirmLeaveOpen(false), []);
  const openTimeUpModal = useCallback(() => setTimeUpModalOpen(true), []);
  const closeTimeUpModal = useCallback(() => setTimeUpModalOpen(false), []);
  const openShareModal = useCallback((attempt) => setShareModalAttempt(attempt), []);
  const closeShareModal = useCallback(() => setShareModalAttempt(null), []);
  const openLegalModal = useCallback((type = 'impressum') => setLegalModalType(type), []);
  const closeLegalModal = useCallback(() => setLegalModalType(null), []);
  const openAssignmentModal = useCallback((data) => setAssignmentModalData(data), []);
  const closeAssignmentModal = useCallback(() => setAssignmentModalData(null), []);

  return {
    confirmSubmitOpen,
    confirmLeaveOpen,
    timeUpModalOpen,
    shareModalAttempt,
    legalModalType,
    assignmentModalData,
    openSubmitModal,
    closeSubmitModal,
    openLeaveModal,
    closeLeaveModal,
    openTimeUpModal,
    closeTimeUpModal,
    openShareModal,
    closeShareModal,
    openLegalModal,
    closeLegalModal,
    openAssignmentModal,
    closeAssignmentModal,
  };
}
