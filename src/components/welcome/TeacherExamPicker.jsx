import React, { useState, useEffect } from 'react';
import { GraduationCap, Eye, ChevronDown } from 'lucide-react';
import { formatExamName, sortExamsNumerically } from '../../utils/examFormat.js';

export default function TeacherExamPicker({
  exams = [],
  currentExamId,
  onSelectExam,
  onStartExam,
}) {
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
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3">
      <div className="flex items-center space-x-2 text-slate-700">
        <GraduationCap className="w-4 h-4 text-telc-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Режим преподавателя: быстрый выбор варианта
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <select
            value={selectedId}
            onChange={handleVariantChange}
            className="w-full appearance-none bg-white border border-slate-300 hover:border-slate-400 focus:border-telc-500 focus:ring-2 focus:ring-telc-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 pr-9 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            {sortedExams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {formatExamName(exam.id)}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={handleLaunch}
          className="px-6 py-3 rounded-xl bg-telc-700 hover:bg-telc-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Открыть вариант</span>
        </button>
      </div>
    </div>
  );
}
