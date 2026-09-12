import React from 'react';
import ConfirmSubmitModal from './ConfirmSubmitModal.jsx';
import ConfirmLeaveModal from './ConfirmLeaveModal.jsx';
import TimeUpModal from './TimeUpModal.jsx';
import ShareAttemptModal from './ShareAttemptModal.jsx';

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
    </>
  );
}
