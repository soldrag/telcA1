import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { createAssignmentLink } from '../../services/assignmentTokenService.js';
import { getOrCreateTeacherKey } from '../../services/security/teacherSecurityService.js';
import { saveIssuedAssignment } from '../../services/storage/issuedAssignmentsStorage.js';
import { getTestTypeById } from '../../../shared/testTypes.js';
import { formatExamName } from '../../utils/examFormat.js';
import AssignmentForm from './assignment/AssignmentForm.jsx';
import AssignmentReady from './assignment/AssignmentReady.jsx';

function resolveTimeLimitSeconds(form, standardMinutes) {
  if (form.timeMode === 'none') return 0;
  return (form.timeMode === 'custom' ? form.customMinutes : standardMinutes) * 60;
}

function describeIssued(entry, t) {
  const minutes = Math.round((entry.timeLimitSeconds || 0) / 60);
  return [
    getTestTypeById(entry.testType).title,
    formatExamName(entry.examId),
    minutes > 0 ? t('welcome.assignments.minutes', { minutes }) : t('modals.createAssignment.noTimer'),
    entry.studentName && t('modals.createAssignment.forStudent', { name: entry.studentName }),
  ].filter(Boolean).join(' · ');
}

async function issueAssignment(form, { testType, standardMinutes }) {
  const config = {
    examId: form.examId,
    testType,
    timeLimitSeconds: resolveTimeLimitSeconds(form, standardMinutes),
    studentName: form.studentName.trim(),
    note: form.note.trim(),
    deadline: form.deadline || null,
  };
  const { assignmentId, url } = await createAssignmentLink({ assignmentConfig: { ...config, teacherKey: getOrCreateTeacherKey() } });
  const entry = { ...config, assignmentId, url };
  saveIssuedAssignment(entry);
  return entry;
}

/**
 * New assignment: settings form, then «Link is ready». Opened with an issued entry it shows that link again.
 */
export default function CreateAssignmentModal({ isOpen, examId, testType = 'lesen', exams = [], issued = null, onClose }) {
  const { t } = useI18n();
  const [readyEntry, setReadyEntry] = useState(issued);
  const [isBusy, setBusy] = useState(false);
  const standardMinutes = getTestTypeById(testType).timeLimitMinutes;

  const handleSubmit = async (form) => {
    setBusy(true);
    try {
      setReadyEntry(await issueAssignment(form, { testType, standardMinutes }));
    } catch (error) {
      console.warn('[CreateAssignmentModal] Failed to create the link:', error);
    } finally {
      setBusy(false);
    }
  };

  const title = readyEntry ? t('modals.createAssignment.readyTitle') : t('modals.createAssignment.title');
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth={readyEntry ? 'max-w-[480px]' : 'max-w-lg'}>
      {readyEntry
        ? <AssignmentReady url={readyEntry.url} summary={describeIssued(readyEntry, t)} />
        : <AssignmentForm initialExamId={examId} exams={exams} standardMinutes={standardMinutes} isBusy={isBusy} onSubmit={handleSubmit} />}
    </Dialog>
  );
}
