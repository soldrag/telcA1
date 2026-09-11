import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HistoryClearConfirm({ onConfirm, onCancel }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center space-x-2 bg-state-error-subtle border border-state-error-border rounded-xl p-1 px-2 text-xs">
      <span className="text-state-error-text font-semibold">{t('history.clearConfirmTitle')}</span>
      <button
        type="button"
        onClick={onConfirm}
        className="px-3 py-1.5 bg-state-error text-white font-bold rounded-lg hover:bg-state-error-hover transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-state-error"
      >
        {t('history.clearConfirmBtn')}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 text-content-secondary hover:text-content-primary font-medium min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        {t('history.clearCancel')}
      </button>
    </div>
  );
}
