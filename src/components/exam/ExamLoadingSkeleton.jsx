import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ExamLoadingSkeleton() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 animate-pulse" aria-label={t('exam.loadingAriaLabel')}>
      {/* Timer and Nav skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-surface-card rounded-2xl border border-border-default p-4 h-24 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-surface-raised rounded w-24" />
            <div className="h-6 bg-surface-raised rounded w-32" />
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-card rounded-2xl border border-border-default p-4 h-24 flex items-center justify-between">
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="h-14 bg-surface-raised rounded-xl" />
            <div className="h-14 bg-surface-raised rounded-xl" />
            <div className="h-14 bg-surface-raised rounded-xl" />
          </div>
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="bg-surface-card rounded-2xl border border-border-default p-4 h-12 flex items-center justify-between">
        <div className="h-4 bg-surface-raised rounded w-40" />
        <div className="h-6 bg-surface-raised rounded-lg w-36" />
      </div>

      {/* Task card skeleton */}
      <div className="bg-surface-card rounded-3xl border-2 border-border-default overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="h-6 bg-surface-raised rounded w-48" />
        <div className="h-4 bg-surface-raised rounded w-full" />
        <div className="h-4 bg-surface-raised rounded w-3/4" />
        <div className="h-32 bg-surface-raised rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-surface-raised rounded-xl" />
          <div className="h-12 bg-surface-raised rounded-xl" />
        </div>
      </div>
    </div>
  );
}
