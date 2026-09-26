import React from 'react';
import { Eye } from 'lucide-react';
import { formatExamName, sortExamsNumerically } from '../../../utils/examFormat.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

function VariantCard({ examId, onInspect, onAssign, t }) {
  const name = formatExamName(examId);
  return (
    <li className="rounded-2xl bg-surface-card border border-border-default p-3 flex items-center gap-2 lg:flex-wrap">
      <span lang="de" className="flex-1 lg:basis-full min-w-0 font-semibold text-content-primary truncate">{name}</span>
      <button
        type="button"
        onClick={() => onInspect(examId)}
        aria-label={t('welcome.teacherSpace.inspectVariantLabel', { variant: name })}
        title={t('welcome.teacherSpace.inspectVariantLabel', { variant: name })}
        className={`w-11 h-11 shrink-0 lg:order-last rounded-xl flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-surface-raised cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onAssign(examId)}
        aria-label={t('welcome.teacherSpace.assignVariantLabel', { variant: name })}
        className={`min-h-[2.75rem] px-3 shrink-0 lg:flex-1 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white text-sm font-semibold cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        {t('welcome.teacherSpace.createAssignmentBtn')}
      </button>
    </li>
  );
}

/**
 * Variants of the current module: look through one, or issue it to a student.
 */
export default function TeacherVariantsCatalog({ exams = [], onSelectExam, onStartExam, onInspectExam, onOpenCreateAssignment }) {
  const { t } = useI18n();

  const handleInspect = (examId) => {
    onSelectExam?.(examId);
    if (onInspectExam) onInspectExam(examId);
    else onStartExam?.({ timed: false, specificExamId: examId });
  };

  const handleAssign = (examId) => {
    onSelectExam?.(examId);
    onOpenCreateAssignment?.(examId);
  };

  return (
    <section aria-labelledby="teacher-catalog-title" className="space-y-3">
      <h2 id="teacher-catalog-title" className="text-xl font-bold text-content-primary">{t('welcome.teacherSpace.catalogTitle')}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        {sortExamsNumerically(exams).map((exam) => (
          <VariantCard key={exam.id} examId={exam.id} onInspect={handleInspect} onAssign={handleAssign} t={t} />
        ))}
      </ul>
    </section>
  );
}
