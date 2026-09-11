import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import ExpandedExplanationContent from './ExpandedExplanationContent.jsx';

export default function ResultsReviewCard({ item, isExpanded, onToggleExpand }) {
  const cardBorderClass = item.is_correct
    ? 'border-state-success-border bg-state-success-subtle/20'
    : 'border-state-error-border bg-state-error-subtle/20';

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
              <CheckCircle2 className="w-6 h-6 text-state-success" />
            ) : (
              <XCircle className="w-6 h-6 text-state-error" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-extrabold text-sm text-content-primary">
                Aufgabe {item.question_number}
              </span>
              <span className="text-xs font-semibold text-content-secondary bg-surface-card px-2 py-0.5 rounded-md border border-border-default">
                Teil {item.teil}
              </span>
              {!item.is_correct && (
                <span className="text-xs font-bold text-state-error-text bg-state-error-muted px-2 py-0.5 rounded-md">
                  Ошибка
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-content-secondary mt-1 font-medium line-clamp-1 sm:line-clamp-none">
              {item.statement || item.situation}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="text-content-tertiary hidden md:inline">Ваш ответ:</span>
            <span className={`px-2 py-1 rounded-md border uppercase ${
              item.is_correct
                ? 'bg-state-success-muted text-state-success-text border-state-success-border'
                : 'bg-state-error-muted text-state-error-text border-state-error-border line-through'
            }`}>
              {item.user_answer || 'Нет ответа'}
            </span>

            {!item.is_correct && (
              <>
                <ArrowRight className="w-4 h-4 text-content-muted" />
                <span className="px-2 py-1 rounded-md border bg-state-success text-white border-state-success-hover uppercase">
                  {item.correct_answer}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors font-semibold text-xs">
            <span>Разбор</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {isExpanded && <ExpandedExplanationContent item={item} />}
    </div>
  );
}
