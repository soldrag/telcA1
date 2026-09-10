import { useState, useCallback } from 'react';

/**
 * Encapsulates modal dialog visibility state and controls.
 */
export function useModalCoordinator() {
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [timeUpModalOpen, setTimeUpModalOpen] = useState(false);

  const openSubmitModal = useCallback(() => setConfirmSubmitOpen(true), []);
  const closeSubmitModal = useCallback(() => setConfirmSubmitOpen(false), []);
  const openLeaveModal = useCallback(() => setConfirmLeaveOpen(true), []);
  const closeLeaveModal = useCallback(() => setConfirmLeaveOpen(false), []);
  const openTimeUpModal = useCallback(() => setTimeUpModalOpen(true), []);
  const closeTimeUpModal = useCallback(() => setTimeUpModalOpen(false), []);

  return {
    confirmSubmitOpen,
    confirmLeaveOpen,
    timeUpModalOpen,
    openSubmitModal,
    closeSubmitModal,
    openLeaveModal,
    closeLeaveModal,
    openTimeUpModal,
    closeTimeUpModal,
  };
}
