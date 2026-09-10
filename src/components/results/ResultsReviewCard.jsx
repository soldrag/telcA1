import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import ExpandedExplanationContent from './ExpandedExplanationContent.jsx';

export default function ResultsReviewCard({ item, isExpanded, onToggleExpand }) {
  const cardBorderClass = item.is_correct
    ? 'border-emerald-200 bg-emerald-50/20'
    : 'border-rose-200 bg-rose-50/20';

  return (
    <div className={`rounded-2xl border transition-all ${cardBorderClass}`}>
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
      >
        <div className="flex items-start sm:items-center space-x-3">
          <div className="mt-0.5 sm:mt-0 flex-shrink-0">
            {item.is_correct ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-extrabold text-sm text-slate-800">
                Aufgabe {item.question_number}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Teil {item.teil}
              </span>
              {!item.is_correct && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Ошибка
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium line-clamp-1 sm:line-clamp-none">
              {item.statement || item.situation}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="text-slate-500 hidden md:inline">Ваш ответ:</span>
            <span className={`px-2 py-1 rounded border uppercase ${
              item.is_correct
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300 line-through'
            }`}>
              {item.user_answer || 'Нет ответа'}
            </span>

            {!item.is_correct && (
              <>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="px-2 py-1 rounded border bg-emerald-600 text-white border-emerald-700 uppercase">
                  {item.correct_answer}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors font-semibold text-xs">
            <span>Разбор</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {isExpanded && <ExpandedExplanationContent item={item} />}
    </div>
  );
}
