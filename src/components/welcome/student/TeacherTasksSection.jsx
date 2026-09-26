import React from 'react';
import { ChevronDown } from 'lucide-react';
import ReceivedAssignmentsList from './ReceivedAssignmentsList.jsx';
import EnterTaskCard from './EnterTaskCard.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';

function EmptyTeacherTasks({ onOpenTask, t }) {
  return (
    <section aria-labelledby="teacher-tasks-title" className="space-y-2">
      <h2 id="teacher-tasks-title" className="text-sm font-medium text-content-secondary">{t('welcome.assignments.title')}</h2>
      <div className="rounded-2xl bg-surface-card border border-border-default p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-content-primary">{t('welcome.studentSpace.emptyTitle')}</p>
          <p className="text-sm text-content-secondary">{t('welcome.studentSpace.emptyHint')}</p>
        </div>
        <EnterTaskCard onOpenTask={onOpenTask} compact />
      </div>
    </section>
  );
}

/**
 * «From the teacher»: received tasks with the link field folded away, or, with none yet,
 * a card that explains where tasks come from and keeps the field at hand.
 */
export default function TeacherTasksSection({ assignments = [], onOpenTask }) {
  const { t } = useI18n();
  if (assignments.length === 0) return <EmptyTeacherTasks onOpenTask={onOpenTask} t={t} />;

  return (
    <div className="space-y-2">
      <ReceivedAssignmentsList assignments={assignments} onOpenTask={onOpenTask} />
      <details className="group">
        <summary className="list-none cursor-pointer min-h-[2.75rem] inline-flex items-center gap-1 text-sm text-action-primary [&::-webkit-details-marker]:hidden">
          {t('welcome.studentSpace.haveLink')}
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <EnterTaskCard onOpenTask={onOpenTask} compact />
      </details>
    </div>
  );
}
