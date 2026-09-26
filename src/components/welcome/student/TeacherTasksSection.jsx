import React from 'react';
import { ChevronDown } from 'lucide-react';
import ReceivedAssignmentsList from './ReceivedAssignmentsList.jsx';
import EnterTaskCard from './EnterTaskCard.jsx';
import Section from '../../layout/Section.jsx';
import OtherModulesHint from '../OtherModulesHint.jsx';
import { getTestTypeById } from '../../../../shared/testTypes.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

function LinkField({ onOpenTask, t }) {
  return (
    <details className="group mt-auto border-t border-border-subtle pt-2">
      <summary className="list-none cursor-pointer min-h-[2.75rem] flex items-center justify-between gap-2 text-sm text-action-primary [&::-webkit-details-marker]:hidden">
        {t('welcome.studentSpace.haveLink')}
        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <EnterTaskCard onOpenTask={onOpenTask} compact />
    </details>
  );
}

function EmptyText({ testType, hasElsewhere, t }) {
  if (hasElsewhere) {
    return <p className="text-sm text-content-secondary">{t('welcome.assignments.noneInModule', { module: getTestTypeById(testType).title })}</p>;
  }
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-content-primary">{t('welcome.studentSpace.emptyTitle')}</p>
      <p className="text-sm text-content-secondary">{t('welcome.studentSpace.emptyHint')}</p>
    </div>
  );
}

/**
 * «From the teacher»: the open module's received tasks as rows of one card, a chip per other module
 * that has some, and the link field folded at its foot; with none, where tasks come from and the field at hand.
 */
export default function TeacherTasksSection({ assignments = [], elsewhere = [], testType = 'lesen', onSelectTestType, onOpenTask, className = '' }) {
  const { t } = useI18n();
  const hasTasks = assignments.length > 0;
  const hint = <OtherModulesHint elsewhere={elsewhere} onSelectTestType={onSelectTestType} />;

  return (
    <Section id="teacher-tasks-title" title={t('welcome.assignments.title')} className={className} bodyClassName="gap-3">
      {hasTasks ? (
        <>
          <ReceivedAssignmentsList assignments={assignments} onOpenTask={onOpenTask} />
          {hint}
          <LinkField onOpenTask={onOpenTask} t={t} />
        </>
      ) : (
        <>
          <EmptyText testType={testType} hasElsewhere={elsewhere.length > 0} t={t} />
          {hint}
          <div className="mt-auto"><EnterTaskCard onOpenTask={onOpenTask} compact /></div>
        </>
      )}
    </Section>
  );
}
