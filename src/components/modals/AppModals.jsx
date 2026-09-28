import React, { lazy, Suspense } from 'react';
import ConfirmSubmitModal from './ConfirmSubmitModal.jsx';
import ConfirmLeaveModal from './ConfirmLeaveModal.jsx';
import TimeUpModal from './TimeUpModal.jsx';

// Opened on demand, so they load as separate chunks.
const ShareAttemptModal = lazy(() => import('./ShareAttemptModal.jsx'));
const LegalModal = lazy(() => import('./LegalModal.jsx'));
const CreateAssignmentModal = lazy(() => import('./CreateAssignmentModal.jsx'));

function OnDemandModals({ modals }) {
  const assignment = modals.assignmentModalData;
  return (
    <Suspense fallback={null}>
      {Boolean(modals.shareModalAttempt) && (
        <ShareAttemptModal isOpen attempt={modals.shareModalAttempt} onClose={modals.closeShareModal} />
      )}
      {Boolean(modals.legalModalType) && (
        <LegalModal isOpen initialType={modals.legalModalType} onClose={modals.closeLegalModal} />
      )}
      {Boolean(assignment) && (
        <CreateAssignmentModal
          isOpen
          examId={assignment.examId}
          testType={assignment.testType}
          exams={assignment.exams}
          issued={assignment.issued}
          onClose={modals.closeAssignmentModal}
        />
      )}
    </Suspense>
  );
}

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
          isGrading={stats.isSubmitting}
          gradingProgress={stats.gradingProgress}
        />
      )}
      <OnDemandModals modals={modals} />
    </>
  );
}
