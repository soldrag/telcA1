import React from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Eye, ChevronRight } from 'lucide-react';
import { cleanExamTitle, formatAttemptDate, formatAttemptDuration } from '../../utils/historyFormat.js';

export default function HistoryItemCard({ attempt, onSelect, compact = false }) {
  const { minutes, seconds } = formatAttemptDuration(attempt.time_spent_seconds);
  const formattedDate = formatAttemptDate(attempt.created_at);
  const examTitle = cleanExamTitle(attempt.exam_title);

  const statusBadgeClass = attempt.passed
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-rose-100 text-rose-800';

  const iconContainerClass = attempt.passed
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-rose-100 text-rose-700 border-rose-200';

  return (
    <button
      type="button"
      onClick={() => onSelect(attempt.id)}
      className={`w-full text-left transition-all cursor-pointer flex items-center justify-between gap-4 group focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] ${
        compact
          ? 'p-4 rounded-2xl border border-slate-200 hover:border-telc-400 hover:bg-telc-50/40'
          : 'p-4 sm:p-6 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`flex-shrink-0 flex items-center justify-center border ${
          compact ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'
        } ${iconContainerClass}`}>
          {attempt.passed ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`font-bold text-slate-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {examTitle}
            </span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${statusBadgeClass}`}>
              {attempt.passed ? 'Сдано' : 'Не сдано'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{minutes}м {seconds}с</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="text-right">
          <div className={`font-black text-slate-900 ${compact ? 'text-sm sm:text-base' : 'text-lg'}`}>
            {attempt.score} <span className="text-xs sm:text-sm font-medium text-slate-500">/ {attempt.total_questions}</span>
          </div>
          <div className={`text-xs font-bold ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
            {attempt.percentage}%
          </div>
        </div>

        <div className="flex items-center">
          {compact ? (
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-telc-600 transition-colors" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-telc-50 group-hover:text-telc-600 group-hover:border-telc-200 transition-all">
              <Eye className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
