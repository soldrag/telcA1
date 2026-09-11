import React from 'react';
import { Clock } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HistoryEmptyState({ onStartExam }) {
  const { t } = useI18n();

  return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-surface-inset rounded-full flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-content-muted" />
      </div>
      <h3 className="text-lg font-bold text-content-primary mb-2">{t('history.emptyTitle')}</h3>
      <p className="text-sm text-content-secondary max-w-sm mb-6">
        {t('history.emptyDesc')}
      </p>
      <button
        type="button"
        onClick={onStartExam}
        className="px-6 py-3 bg-action-primary hover:bg-action-primary-hover text-white font-bold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
      >
        {t('history.startFirstExam')}
      </button>
    </div>
  );
}
