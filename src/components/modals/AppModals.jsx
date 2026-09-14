import React from 'react';
import ConfirmSubmitModal from './ConfirmSubmitModal.jsx';
import ConfirmLeaveModal from './ConfirmLeaveModal.jsx';
import TimeUpModal from './TimeUpModal.jsx';
import ShareAttemptModal from './ShareAttemptModal.jsx';
import LegalModal from './LegalModal.jsx';
import CreateAssignmentModal from './CreateAssignmentModal.jsx';

export default function AppModals({ modals = {}, actions = {}, stats = {} }) {
  return (
    <>
      <ConfirmSubmitModal
        isOpen={modals.confirmSubmitOpen}
        onClose={modals.closeSubmitModal}
        onConfirm={actions.onConfirmSubmit}
        submissionStats={stats}
      />
      <ConfirmLeaveModal
        isOpen={modals.confirmLeaveOpen}
        onClose={modals.closeLeaveModal}
        onConfirm={actions.onConfirmLeave}
      />
      {modals.timeUpModalOpen && (
        <TimeUpModal
          isOpen={modals.timeUpModalOpen}
          onConfirm={actions.onConfirmTimeUp}
        />
      )}
      {Boolean(modals.shareModalAttempt) && (
        <ShareAttemptModal
          isOpen={Boolean(modals.shareModalAttempt)}
          attempt={modals.shareModalAttempt}
          onClose={modals.closeShareModal}
        />
      )}
      {Boolean(modals.legalModalType) && (
        <LegalModal
          isOpen={Boolean(modals.legalModalType)}
          initialType={modals.legalModalType}
          onClose={modals.closeLegalModal}
        />
      )}
      {Boolean(modals.assignmentModalData) && (
        <CreateAssignmentModal
          isOpen={Boolean(modals.assignmentModalData)}
          examId={modals.assignmentModalData.examId}
          testType={modals.assignmentModalData.testType}
          onClose={modals.closeAssignmentModal}
        />
      )}
    </>
  );
}
