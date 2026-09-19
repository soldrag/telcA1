import React from 'react';
import { ArrowLeft, Award } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HistoryTopNav({ onBack }) {
  const { t } = useI18n();

  return (
    <div className="fixed top-0 left-0 right-0 pt-[env(safe-area-inset-top,0px)] bg-surface-card/95 backdrop-blur-md border-b border-border-default z-40 shadow-xs">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-content-secondary hover:text-content-primary transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm sm:text-base">{t('history.backToMenu')}</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <h1 className="text-sm font-bold text-content-primary">{t('history.title')}</h1>
            <p className="text-xs text-content-tertiary">{t('history.resultsSubtitle')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-action-primary-subtle flex items-center justify-center text-action-primary hidden sm:flex border border-action-primary-border">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
