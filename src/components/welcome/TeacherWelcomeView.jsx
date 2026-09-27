import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import QuickReviewInputCard from './teacher/QuickReviewInputCard.jsx';
import IssuedAssignmentsList from './teacher/IssuedAssignmentsList.jsx';
import TeacherVariantsCatalog from './teacher/TeacherVariantsCatalog.jsx';
import { ModuleHeading } from './RandomExamCard.jsx';
import Section from '../layout/Section.jsx';
import { PAGE_STACK } from '../layout/pageLayout.js';

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
 * Teacher home: the module heading with the two teacher actions, the open module's issued
 * assignments, then the variants to issue from — titled sections of the page grid, like the student home.
 */
export default function TeacherWelcomeView({ examState = {}, actions = {}, onOpenCreateAssignment, onProcessReview }) {
  const { t } = useI18n();
  const [isReviewInputOpen, setReviewInputOpen] = useState(false);
  const { exams = [], activeTestType = 'lesen' } = examState;
  const openNew = () => onOpenCreateAssignment?.();

  return (
    <div className={`${PAGE_STACK} lg:pt-4`}>
      {/* The same module heading as the student home, so both roles read the page the same way. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ModuleHeading moduleInfo={{ id: activeTestType }} />
        <div className="flex gap-2 max-sm:w-full shrink-0">
          <button type="button" aria-expanded={isReviewInputOpen} onClick={() => setReviewInputOpen((value) => !value)} className={`${SECONDARY} max-sm:w-full`}>
            {t('welcome.teacherSpace.checkByLinkBtn')}
          </button>
          <NewAssignmentButton onClick={openNew} className="max-sm:hidden" t={t} />
        </div>
      </div>
      {isReviewInputOpen && <QuickReviewInputCard onProcessReview={onProcessReview} />}
      <Section id="issued-title" title={t('welcome.teacherSpace.issuedTitle')} frame="none">
        <IssuedAssignmentsList
          testType={activeTestType}
          onSelectTestType={actions.onSelectTestType}
          onOpenLink={(entry) => onOpenCreateAssignment?.(null, entry)} onOpenReview={onProcessReview} />
      </Section>
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
