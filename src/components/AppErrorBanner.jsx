import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PAGE_CONTAINER } from './layout/pageLayout.js';

export default function AppErrorBanner({ message, onDismiss }) {
  const { t } = useI18n();
  if (!message) return null;

  const displayMessage = typeof message === 'string' ? t(message) : String(message);

  return (
    <div className={`${PAGE_CONTAINER} pt-4`}>
      <div className="p-4 bg-state-error-subtle border border-state-error-border text-state-error-text text-sm rounded-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <AlertCircle className="w-5 h-5 text-state-error shrink-0" />
          <span className="font-semibold">{displayMessage}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('common.closeError')}
          className="min-h-[2.75rem] min-w-[2.75rem] inline-flex items-center justify-center text-state-error hover:bg-state-error-muted rounded-lg transition-colors cursor-pointer ml-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
