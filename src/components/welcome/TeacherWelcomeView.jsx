import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import QuickReviewInputCard from './teacher/QuickReviewInputCard.jsx';
import IssuedAssignmentsList from './teacher/IssuedAssignmentsList.jsx';
import TeacherVariantsCatalog from './teacher/TeacherVariantsCatalog.jsx';
import { getTestTypeById } from '../../../shared/testTypes.js';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';
const PRIMARY = `min-h-[3rem] px-4 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;
const SECONDARY = `min-h-[3rem] px-4 rounded-xl bg-surface-card border border-border-default hover:bg-surface-raised text-content-primary font-semibold whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;

function NewAssignmentButton({ onClick, className, t }) {
  return (
    <button type="button" onClick={onClick} className={`${PRIMARY} ${className}`}>
      <Plus className="w-5 h-5" aria-hidden="true" />
      {t('welcome.teacherSpace.newAssignmentBtn')}
    </button>
  );
}

// Phones: «New assignment» stays in thumb reach just above the tab bar while the list scrolls,
// and settles at the end of the page so the footer stays readable.
function PhoneNewAssignmentBar({ onClick, t }) {
  return (
    <div className="sm:hidden sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-30 -mx-4 px-4 py-2 bg-canvas">
      <NewAssignmentButton onClick={onClick} className="w-full" t={t} />
    </div>
  );
}

/**
 * Teacher home: the open module's issued assignments first, then the variants to issue from.
 */
export default function TeacherWelcomeView({ examState = {}, actions = {}, onOpenCreateAssignment, onProcessReview }) {
  const { t } = useI18n();
  const [isReviewInputOpen, setReviewInputOpen] = useState(false);
  const { exams = [], activeTestType = 'lesen' } = examState;
  const openNew = () => onOpenCreateAssignment?.();

  return (
    <div className="space-y-6 lg:space-y-8">
      <section aria-labelledby="issued-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="issued-title" className="text-2xl lg:text-[1.75rem] font-bold text-content-primary">{t('welcome.teacherSpace.issuedTitle')} · {getTestTypeById(activeTestType).title}</h1>
          <div className="flex gap-2 max-sm:w-full">
            <button type="button" aria-expanded={isReviewInputOpen} onClick={() => setReviewInputOpen((value) => !value)} className={`${SECONDARY} max-sm:w-full`}>
              {t('welcome.teacherSpace.checkByLinkBtn')}
            </button>
            <NewAssignmentButton onClick={openNew} className="max-sm:hidden" t={t} />
          </div>
        </div>
        {isReviewInputOpen && <QuickReviewInputCard onProcessReview={onProcessReview} />}
        <IssuedAssignmentsList
          testType={activeTestType}
          onSelectTestType={actions.onSelectTestType}
          onOpenLink={(entry) => onOpenCreateAssignment?.(null, entry)} onOpenReview={onProcessReview} />
      </section>
      <TeacherVariantsCatalog
        exams={exams}
        onSelectExam={actions.onSelectExam}
        onStartExam={actions.onStartExam}
        onInspectExam={actions.onInspectExam}
        onOpenCreateAssignment={onOpenCreateAssignment}
      />
      <PhoneNewAssignmentBar onClick={openNew} t={t} />
    </div>
  );
}
