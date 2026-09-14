import React, { useState, useEffect } from 'react';
import { GraduationCap, Eye, ChevronDown } from 'lucide-react';
import { formatExamName, sortExamsNumerically } from '../../utils/examFormat.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TeacherExamPicker({
  exams = [],
  currentExamId,
  onSelectExam,
  onStartExam,
}) {
  const { t } = useI18n();
  const sortedExams = sortExamsNumerically(exams);
  const [selectedId, setSelectedId] = useState(currentExamId || sortedExams[0]?.id || '');

  useEffect(() => {
    if (currentExamId) {
      setSelectedId(currentExamId);
    } else if (sortedExams.length > 0 && !selectedId) {
      setSelectedId(sortedExams[0].id);
    }
  }, [currentExamId, sortedExams, selectedId]);

  const handleVariantChange = (changeEvent) => {
    const selectedValue = changeEvent.target.value;
    setSelectedId(selectedValue);
    onSelectExam(selectedValue);
  };

  const handleLaunch = () => {
    const targetId = selectedId || sortedExams[0]?.id;
    if (targetId) {
      onSelectExam(targetId);
      onStartExam({ timed: false, specificExamId: targetId });
    }
  };

  return (
    <div className="bg-surface-inset rounded-2xl border border-border-default p-4 sm:p-5 space-y-3">
      <div className="flex items-center space-x-2 text-content-secondary">
        <GraduationCap className="w-4 h-4 text-action-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
          {t('welcome.teacherPicker.teacherModeBadge')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <select
            value={selectedId}
            onChange={handleVariantChange}
            className="w-full appearance-none bg-surface-card border border-border-default hover:border-border-strong focus:border-action-primary focus:ring-2 focus:ring-action-primary-subtle rounded-xl px-4 py-3 text-base sm:text-sm font-semibold text-content-primary pr-9 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            {sortedExams.map((exam) => (
              <option key={exam.id} value={exam.id} className="bg-surface-card text-content-primary">
                {formatExamName(exam.id)}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="w-4 h-4 text-content-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={handleLaunch}
          className="px-6 py-3 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>{t('welcome.teacherPicker.openVariant')}</span>
        </button>
      </div>
    </div>
  );
}
