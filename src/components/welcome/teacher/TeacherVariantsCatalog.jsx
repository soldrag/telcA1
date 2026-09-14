import React from 'react';
import { Eye, Send, FileText } from 'lucide-react';
import { formatExamName, sortExamsNumerically } from '../../../utils/examFormat.js';
import { useI18n } from '../../../i18n/I18nContext.jsx';

export default function TeacherVariantsCatalog({
  exams = [],
  onSelectExam,
  onStartExam,
  onOpenCreateAssignment,
}) {
  const { t } = useI18n();
  const sortedExams = sortExamsNumerically(exams);

  const handleInspect = (examId) => {
    onSelectExam?.(examId);
    onStartExam?.({ timed: false, specificExamId: examId });
  };

  const handleAssign = (examId) => {
    onSelectExam?.(examId);
    onOpenCreateAssignment?.(examId);
  };

  return (
    <div className="bg-surface-card border border-border-default rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-action-primary" />
        <h3 className="text-base font-bold text-content-primary">
          {t('welcome.teacherSpace.catalogTitle')}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedExams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col justify-between p-4 rounded-2xl bg-surface-raised border border-border-default space-y-3"
          >
            <div>
              <h4 className="text-sm font-bold text-content-primary">
                {formatExamName(exam.id)}
              </h4>
              <span className="text-[11px] text-content-tertiary font-mono">
                ID: {exam.id}
              </span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleInspect(exam.id)}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-inset border border-border-default text-content-primary text-xs font-semibold transition-colors min-h-[40px] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-content-muted" />
                <span>{t('welcome.teacherSpace.inspectVariantBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAssign(exam.id)}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white text-xs font-bold transition-colors min-h-[40px] shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('welcome.teacherSpace.createAssignmentBtn')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
