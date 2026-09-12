import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import ExpandedExplanationContent from './ExpandedExplanationContent.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsReviewCard({ item, isExpanded, onToggleExpand, onUpdateItemScore }) {
  const { t } = useI18n();
  const [currentPoints, setCurrentPoints] = React.useState(item.points_earned || 0);

  React.useEffect(() => {
    setCurrentPoints(item.points_earned || 0);
  }, [item.points_earned]);

  const handleScoreChange = (newTotal, newBreakdown) => {
    setCurrentPoints(newTotal);
    onUpdateItemScore?.(item.id, newTotal, newBreakdown);
  };

  const isCorrect = item.options_json?.type === 'essay'
    ? currentPoints >= Math.ceil((item.max_points || 10) * 0.6)
    : item.is_correct;

  const cardBorderClass = isCorrect
    ? 'border-state-success-border bg-state-success-subtle/20'
    : 'border-state-error-border bg-state-error-subtle/20';

  return (
    <div className={`rounded-2xl border transition-all ${cardBorderClass}`}>
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 overflow-hidden"
      >
        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
          <div className="mt-0.5 sm:mt-0 flex-shrink-0">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-state-success" />
            ) : (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-state-error" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono font-extrabold text-xs sm:text-sm text-content-primary">
                Aufgabe {item.question_number}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-content-secondary bg-surface-card px-2 py-0.5 rounded-md border border-border-default">
                Teil {item.teil}
              </span>
              {!isCorrect && (
                <span className="text-[11px] sm:text-xs font-bold text-state-error-text bg-state-error-muted px-2 py-0.5 rounded-md">
                  {t('results.badgeIncorrect')}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-content-secondary mt-1 font-medium line-clamp-2 sm:line-clamp-none break-words">
              {item.statement || item.situation}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:space-x-3 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t border-border-subtle/40 sm:border-0 min-w-0">
          {item.options_json?.type === 'essay' ? (
            <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-border-default bg-surface-inset text-content-primary shrink-0">
              <span>{item.word_count || 0} Wörter</span>
              <span className="mx-1.5 text-content-muted">•</span>
              <span className="text-action-primary font-black">{currentPoints}/{item.max_points || 10} Pkt</span>
            </div>
          ) : (
            <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono font-bold min-w-0">
              <span className="text-content-tertiary hidden md:inline">{t('results.yourAnswer')}</span>
              <span 
                className={`px-2 py-1 rounded-md border uppercase max-w-[130px] sm:max-w-[160px] truncate ${
                  item.is_correct
                    ? 'bg-state-success-muted text-state-success-text border-state-success-border'
                    : 'bg-state-error-muted text-state-error-text border-state-error-border line-through'
                }`}
                title={item.user_answer || t('results.noAnswer')}
              >
                {item.user_answer || t('results.noAnswer')}
              </span>

              {!item.is_correct && (
                <>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-muted shrink-0" />
                  <span 
                    className="px-2 py-1 rounded-md border bg-state-success text-white border-state-success-hover uppercase max-w-[150px] sm:max-w-[200px] truncate"
                    title={item.correct_answer}
                  >
                    {item.correct_answer}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center space-x-1 p-1.5 sm:p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors font-semibold text-xs shrink-0 ml-auto sm:ml-0">
            <span>{t('results.reviewToggle')}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>
      </button>

      {isExpanded && <ExpandedExplanationContent item={item} onScoreChange={handleScoreChange} />}
    </div>
  );
}
