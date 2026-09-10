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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {loading ? (
        <HistoryLoadingSkeleton />
      ) : attempts.length === 0 ? (
        <HistoryEmptyState onStartExam={onStartExam} />
      ) : (
        <div className="divide-y divide-slate-100">
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
