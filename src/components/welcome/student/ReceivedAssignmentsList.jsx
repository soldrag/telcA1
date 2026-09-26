import React from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { formatExamName } from '../../../utils/examFormat.js';
import { formatDayMonth } from '../../../utils/historyFormat.js';
import { getTestTypeById } from '../../../../shared/testTypes.js';

const VISIBLE_LIMIT = 5;
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

function describeAssignment(assignment, t) {
  const minutes = Math.round((assignment.timeLimitSeconds || 0) / 60);
  return [assignment.note && `«${assignment.note}»`, minutes > 0 && t('welcome.assignments.minutes', { minutes })]
    .filter(Boolean)
    .join(' · ');
}

function AssignmentTitle({ assignment }) {
  const module = getTestTypeById(assignment.testType || 'lesen');
  return <div className="font-semibold text-content-primary">{module.title} · {formatExamName(assignment.examId)}</div>;
}

function PendingAssignment({ assignment, onOpenTask, t, language }) {
  const details = describeAssignment(assignment, t);
  return (
    <li className="rounded-2xl bg-surface-card border border-action-primary-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <AssignmentTitle assignment={assignment} />
          {details && <div className="text-sm text-content-secondary break-words">{details}</div>}
        </div>
        {assignment.deadline && (
          <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-md bg-state-warning-subtle text-state-warning-text">
            {t('welcome.assignments.due', { date: formatDayMonth(assignment.deadline, language) })}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onOpenTask?.(assignment.token)}
        className={`w-full min-h-[3rem] rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        {t('welcome.assignments.start')}
      </button>
    </li>
  );
}

function SubmittedAssignment({ assignment, onOpenTask, t, language }) {
  const { passScore, maxScore } = getTestTypeById(assignment.testType || 'lesen');
  const hasScore = assignment.score !== null && assignment.score !== undefined;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpenTask?.(assignment.token)}
        className={`w-full text-left rounded-2xl bg-surface-card border border-border-default hover:bg-surface-raised px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        <span className="min-w-0 space-y-0.5">
          <AssignmentTitle assignment={assignment} />
          <span className="block text-sm text-content-secondary">
            {t('welcome.assignments.submitted', { date: formatDayMonth(assignment.submittedAt, language) })}
          </span>
        </span>
        {hasScore && (
          <span className={`font-semibold tabular-nums ${assignment.score >= passScore ? 'text-state-success-text' : 'text-state-error-text'}`}>
            {assignment.score}/{maxScore}
          </span>
        )}
      </button>
    </li>
  );
}

export default function ReceivedAssignmentsList({ assignments = [], onOpenTask }) {
  const { t, language } = useI18n();
  if (assignments.length === 0) return null;

  return (
    <section aria-labelledby="received-assignments-title" className="space-y-2">
      <h2 id="received-assignments-title" className="text-sm font-medium text-content-secondary">{t('welcome.assignments.title')}</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 items-start">
        {assignments.slice(0, VISIBLE_LIMIT).map((assignment) => {
          const Row = assignment.submittedAt ? SubmittedAssignment : PendingAssignment;
          return <Row key={assignment.assignmentId} assignment={assignment} onOpenTask={onOpenTask} t={t} language={language} />;
        })}
      </ul>
    </section>
  );
}
