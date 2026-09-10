import React from 'react';
import ConfirmSubmitModal from './ConfirmSubmitModal.jsx';
import ConfirmLeaveModal from './ConfirmLeaveModal.jsx';

export default function AppModals({
  confirmSubmitOpen,
  onCloseSubmitModal,
  onConfirmSubmit,
  answeredCount,
  totalQuestions,
  isSubmitting,
  confirmLeaveOpen,
  onCloseLeaveModal,
  onConfirmLeave,
}) {
  return (
    <>
      <ConfirmSubmitModal
        isOpen={confirmSubmitOpen}
        onClose={onCloseSubmitModal}
        onConfirm={onConfirmSubmit}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
      />
      <ConfirmLeaveModal
        isOpen={confirmLeaveOpen}
        onClose={onCloseLeaveModal}
        onConfirm={onConfirmLeave}
      />
    </>
  );
}
