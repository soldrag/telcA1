import React from 'react';

export default function HistoryLoadingSkeleton() {
  const skeletonItems = [1, 2, 3];
  return (
    <div className="p-8 text-center text-content-tertiary text-sm space-y-4">
      {skeletonItems.map((itemIndex) => (
        <div key={itemIndex} className="p-4 rounded-2xl border border-border-default flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-raised flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-5 bg-surface-raised rounded w-48" />
              <div className="h-4 bg-surface-raised rounded w-32" />
            </div>
          </div>
          <div className="h-10 bg-surface-raised rounded w-24" />
        </div>
      ))}
    </div>
  );
}
