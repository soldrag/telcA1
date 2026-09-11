import React from 'react';
import HistoryItemCard from './HistoryItemCard.jsx';
import HistoryLoadingSkeleton from './HistoryLoadingSkeleton.jsx';
import HistoryEmptyState from './HistoryEmptyState.jsx';

export default function HistoryListContainer({
  loading = false,
  attempts = [],
  onLoadAttempt,
  onStartExam,
}) {
  return (
    <div className="bg-surface-card rounded-3xl border border-border-default shadow-xs overflow-hidden">
      {loading ? (
        <HistoryLoadingSkeleton />
      ) : attempts.length === 0 ? (
        <HistoryEmptyState onStartExam={onStartExam} />
      ) : (
        <div className="divide-y divide-border-subtle">
          {attempts.map((attempt) => (
            <HistoryItemCard
              key={attempt.id}
              attempt={attempt}
              onSelect={onLoadAttempt}
              compact={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
