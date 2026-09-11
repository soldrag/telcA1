import React from 'react';
import ResultsFilterTabs from './ResultsFilterTabs.jsx';
import ResultsFilterHeader from './ResultsFilterHeader.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsFilterBar({
  filterState = {},
  stats = {},
  onToggleExpandAll,
  // Backwards compatibility fallbacks
  filter = filterState.filter,
  onSetFilter = filterState.onSetFilter,
  isAllExpanded = filterState.isAllExpanded,
  totalQuestions = stats.totalQuestions,
  mistakesCount = stats.mistakesCount,
  score = stats.score,
}) {
  const { isRussian } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-default">
      <ResultsFilterHeader />

      <div className="flex items-center space-x-2">
        <ResultsFilterTabs
          filter={filter}
          onSetFilter={onSetFilter}
          totalQuestions={totalQuestions}
          mistakesCount={mistakesCount}
          score={score}
        />

        <button
          type="button"
          onClick={onToggleExpandAll}
          className="text-xs font-medium text-content-secondary hover:text-content-primary bg-surface-raised hover:bg-surface-inset border border-border-default px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          {isAllExpanded
            ? (isRussian ? 'Свернуть все' : 'Collapse all')
            : (isRussian ? 'Развернуть все' : 'Expand all')}
        </button>
      </div>
    </div>
  );
}
